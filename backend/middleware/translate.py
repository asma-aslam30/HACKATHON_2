"""
Translation Middleware — wired into the FastAPI chat pipeline.

Flow:
  user message (any language)
      → detect language
      → translate to English  (for Gemini NLU)
      → run Gemini agent
      → translate response back to user's language
      → return to frontend

Dependencies: deep-translator, langdetect
Install: pip install deep-translator langdetect
"""

import logging
from functools import lru_cache
from typing import Optional

logger = logging.getLogger(__name__)

# ── Supported languages ────────────────────────────────────────────────────────
SUPPORTED_LANGUAGES: dict[str, dict] = {
    "en": {"name": "English",    "native": "English",    "flag": "🇺🇸", "rtl": False},
    "ur": {"name": "Urdu",       "native": "اردو",        "flag": "🇵🇰", "rtl": True},
    "ar": {"name": "Arabic",     "native": "العربية",     "flag": "🇸🇦", "rtl": True},
    "es": {"name": "Spanish",    "native": "Español",     "flag": "🇪🇸", "rtl": False},
    "fr": {"name": "French",     "native": "Français",    "flag": "🇫🇷", "rtl": False},
    "de": {"name": "German",     "native": "Deutsch",     "flag": "🇩🇪", "rtl": False},
    "zh": {"name": "Chinese",    "native": "中文",         "flag": "🇨🇳", "rtl": False},
    "hi": {"name": "Hindi",      "native": "हिन्दी",       "flag": "🇮🇳", "rtl": False},
    "pt": {"name": "Portuguese", "native": "Português",   "flag": "🇵🇹", "rtl": False},
    "tr": {"name": "Turkish",    "native": "Türkçe",      "flag": "🇹🇷", "rtl": False},
    "ru": {"name": "Russian",    "native": "Русский",     "flag": "🇷🇺", "rtl": False},
    "ja": {"name": "Japanese",   "native": "日本語",       "flag": "🇯🇵", "rtl": False},
    "ko": {"name": "Korean",     "native": "한국어",       "flag": "🇰🇷", "rtl": False},
}

# langdetect → deep-translator code mapping (some codes differ)
_LANG_MAP = {
    "zh-cn": "zh",
    "zh-tw": "zh",
}


def _normalize_lang(code: str) -> str:
    """Normalize language code to our supported set."""
    code = code.lower().strip()
    code = _LANG_MAP.get(code, code)
    return code if code in SUPPORTED_LANGUAGES else "en"


# ── Language detection ─────────────────────────────────────────────────────────

def detect_language(text: str, fallback: str = "en") -> str:
    """
    Detect the language of `text`.
    Returns ISO 639-1 code. Falls back to `fallback` on any error.
    """
    if not text or len(text.strip()) < 3:
        return fallback
    try:
        from langdetect import detect, DetectorFactory
        DetectorFactory.seed = 0          # deterministic results
        raw = detect(text)
        return _normalize_lang(raw)
    except Exception as e:
        logger.warning(f"Language detection failed: {e}")
        return fallback


# ── Translation ────────────────────────────────────────────────────────────────

def _translate(text: str, source: str, target: str) -> str:
    """
    Translate `text` from `source` to `target` using deep-translator (Google backend).
    Returns original text on failure.
    """
    if source == target or not text.strip():
        return text
    try:
        from deep_translator import GoogleTranslator
        translated = GoogleTranslator(source=source, target=target).translate(text)
        return translated or text
    except Exception as e:
        logger.warning(f"Translation {source}→{target} failed: {e}")
        return text


def translate_to_english(text: str, source_lang: str) -> str:
    """Translate user input to English for Gemini NLU."""
    if source_lang == "en":
        return text
    return _translate(text, source=source_lang, target="en")


def translate_from_english(text: str, target_lang: str) -> str:
    """Translate Gemini's English response back to the user's language."""
    if target_lang == "en":
        return text
    return _translate(text, source="en", target=target_lang)


# ── Main pipeline helper ───────────────────────────────────────────────────────

def process_chat_message(
    user_message: str,
    preferred_lang: Optional[str] = None,
) -> dict:
    """
    Prepare a user message for the Gemini agent.

    Returns:
        {
            "translated_input": str,   # English text to send to Gemini
            "detected_lang": str,      # ISO code of user's language
            "original_message": str,   # unchanged original
        }
    """
    detected = detect_language(user_message)
    # Prefer explicit user preference over auto-detection
    lang = _normalize_lang(preferred_lang) if preferred_lang else detected

    translated = translate_to_english(user_message, lang)

    logger.info(f"[translate] lang={lang} | '{user_message[:60]}' → '{translated[:60]}'")

    return {
        "translated_input": translated,
        "detected_lang": lang,
        "original_message": user_message,
    }


def translate_response(response_text: str, target_lang: str) -> str:
    """
    Translate Gemini's response to the user's language.
    Preserves emoji and task content.
    """
    if target_lang == "en":
        return response_text
    translated = translate_from_english(response_text, target_lang)
    logger.info(f"[translate] response {target_lang}: '{translated[:60]}'")
    return translated
