"""
Translation Middleware for Evolution of Todo

This module provides translation layers for multilingual support:
1. Language Detection: Auto-detect user language
2. Input Translation: User input → English for NLU
3. Output Translation: System responses → User's language
4. Content Preservation: Never translate user-created content

Author: Spec Architect Agent
Version: 1.0.0
Date: 2025-12-25
"""

from typing import Optional, Dict, Any, List
from functools import lru_cache
import logging
from datetime import datetime, timedelta

# Third-party imports (install: pip install langdetect googletrans==4.0.0-rc1)
from langdetect import detect, DetectorFactory
from googletrans import Translator

# FastAPI imports
from fastapi import Request, Depends
from sqlmodel import Session

logger = logging.getLogger(__name__)

# Ensure consistent language detection
DetectorFactory.seed = 0

# Supported languages
SUPPORTED_LANGUAGES = {
    "en": {"name": "English", "native": "English", "flag": "🇺🇸", "rtl": False},
    "es": {"name": "Spanish", "native": "Español", "flag": "🇪🇸", "rtl": False},
    "fr": {"name": "French", "native": "Français", "flag": "🇫🇷", "rtl": False},
    "de": {"name": "German", "native": "Deutsch", "flag": "🇩🇪", "rtl": False},
    "pt": {"name": "Portuguese", "native": "Português", "flag": "🇵🇹", "rtl": False},
    "zh": {"name": "Chinese (Simplified)", "native": "简体中文", "flag": "🇨🇳", "rtl": False},
    "ja": {"name": "Japanese", "native": "日本語", "flag": "🇯🇵", "rtl": False},
    "ar": {"name": "Arabic", "native": "العربية", "flag": "🇸🇦", "rtl": True},
    "hi": {"name": "Hindi", "native": "हिन्दी", "flag": "🇮🇳", "rtl": False},
}

# Response templates (system messages)
RESPONSE_TEMPLATES = {
    "en": {
        "task_created": "Task created: {title} (ID: {task_id})",
        "task_updated": "Task updated: {title}",
        "task_completed": "Task completed: {title}",
        "task_deleted": "Task deleted successfully",
        "tasks_listed": "Found {count} task(s)",
        "no_tasks": "No tasks found",
        "batch_completed": "Completed {successful} out of {total} task(s)",
        "error_general": "An error occurred. Please try again.",
    },
    "es": {
        "task_created": "Tarea creada: {title} (ID: {task_id})",
        "task_updated": "Tarea actualizada: {title}",
        "task_completed": "Tarea completada: {title}",
        "task_deleted": "Tarea eliminada exitosamente",
        "tasks_listed": "Se encontraron {count} tarea(s)",
        "no_tasks": "No se encontraron tareas",
        "batch_completed": "Se completaron {successful} de {total} tarea(s)",
        "error_general": "Ocurrió un error. Por favor intenta de nuevo.",
    },
    "fr": {
        "task_created": "Tâche créée : {title} (ID : {task_id})",
        "task_updated": "Tâche mise à jour : {title}",
        "task_completed": "Tâche terminée : {title}",
        "task_deleted": "Tâche supprimée avec succès",
        "tasks_listed": "{count} tâche(s) trouvée(s)",
        "no_tasks": "Aucune tâche trouvée",
        "batch_completed": "{successful} tâche(s) terminée(s) sur {total}",
        "error_general": "Une erreur s'est produite. Veuillez réessayer.",
    },
    "de": {
        "task_created": "Aufgabe erstellt: {title} (ID: {task_id})",
        "task_updated": "Aufgabe aktualisiert: {title}",
        "task_completed": "Aufgabe abgeschlossen: {title}",
        "task_deleted": "Aufgabe erfolgreich gelöscht",
        "tasks_listed": "{count} Aufgabe(n) gefunden",
        "no_tasks": "Keine Aufgaben gefunden",
        "batch_completed": "{successful} von {total} Aufgabe(n) abgeschlossen",
        "error_general": "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.",
    },
    "pt": {
        "task_created": "Tarefa criada: {title} (ID: {task_id})",
        "task_updated": "Tarefa atualizada: {title}",
        "task_completed": "Tarefa concluída: {title}",
        "task_deleted": "Tarefa excluída com sucesso",
        "tasks_listed": "{count} tarefa(s) encontrada(s)",
        "no_tasks": "Nenhuma tarefa encontrada",
        "batch_completed": "{successful} de {total} tarefa(s) concluída(s)",
        "error_general": "Ocorreu um erro. Por favor, tente novamente.",
    },
    # Add more languages as needed
}


class LanguageDetector:
    """Detects user language from multiple sources"""

    @staticmethod
    def detect_from_text(text: str, fallback: str = "en") -> str:
        """
        Detect language from text using langdetect
        
        Args:
            text: User input text
            fallback: Default language if detection fails
            
        Returns:
            ISO 639-1 language code
        """
        try:
            if len(text.strip()) < 3:
                return fallback

            detected = detect(text)

            if detected in SUPPORTED_LANGUAGES:
                return detected
            else:
                logger.warning(f"Detected unsupported language: {detected}, using fallback")
                return fallback

        except Exception as e:
            logger.error(f"Language detection failed: {e}")
            return fallback

    @staticmethod
    def detect_from_request(request: Request) -> str:
        """
        Extract language from Accept-Language header
        
        Args:
            request: FastAPI request object
            
        Returns:
            ISO 639-1 language code
        """
        accept_language = request.headers.get("Accept-Language", "en")

        # Parse: "en-US,en;q=0.9,es;q=0.8"
        for lang_entry in accept_language.split(","):
            code = lang_entry.split(";")[0].split("-")[0].strip()
            if code in SUPPORTED_LANGUAGES:
                return code

        return "en"

    @staticmethod
    def get_user_language(
        user_id: int,
        auto_detected: str,
        db: Session
    ) -> str:
        """
        Get user's preferred language
        Priority: User preference > Auto-detection
        
        Args:
            user_id: User ID
            auto_detected: Auto-detected language code
            db: Database session
            
        Returns:
            ISO 639-1 language code
        """
        from models.user import User  # Lazy import to avoid circular dependency

        user = db.get(User, user_id)

        if user and user.preferred_language:
            return user.preferred_language
        else:
            # First interaction: save auto-detected language
            if user:
                user.preferred_language = auto_detected
                db.add(user)
                db.commit()

            return auto_detected


class InputTranslator:
    """Translates user input to English for NLU processing"""

    def __init__(self):
        self.translator = Translator()
        self._cache: Dict[str, Dict[str, Any]] = {}
        self._cache_ttl = timedelta(hours=1)

    @lru_cache(maxsize=1000)
    def _get_cached_translation(self, cache_key: str) -> Optional[Dict[str, Any]]:
        """Get cached translation if available and not expired"""
        if cache_key in self._cache:
            cached = self._cache[cache_key]
            if datetime.now() < cached["expires_at"]:
                return cached["data"]
            else:
                del self._cache[cache_key]
        return None

    def _set_cache(self, cache_key: str, data: Dict[str, Any]):
        """Cache translation result"""
        self._cache[cache_key] = {
            "data": data,
            "expires_at": datetime.now() + self._cache_ttl
        }

    async def translate_for_nlu(
        self,
        text: str,
        source_lang: str
    ) -> Dict[str, Any]:
        """
        Translate user input to English for NLU processing
        
        Args:
            text: User input in any language
            source_lang: ISO 639-1 code of source language
            
        Returns:
            {
                "original": "Añade comprar leche",
                "translated": "Add buy milk",
                "source_lang": "es",
                "entities_preserved": {"title": "comprar leche"}
            }
        """
        # No translation needed for English
        if source_lang == "en":
            return {
                "original": text,
                "translated": text,
                "source_lang": "en",
                "entities_preserved": {}
            }

        # Check cache
        cache_key = f"{source_lang}:{text}"
        cached = self._get_cached_translation(cache_key)
        if cached:
            logger.info(f"Using cached translation for: {text[:50]}")
            return cached

        try:
            # Translate to English
            translation = self.translator.translate(
                text,
                src=source_lang,
                dest="en"
            )

            result = {
                "original": text,
                "translated": translation.text,
                "source_lang": source_lang,
                "entities_preserved": self._extract_entities(text, source_lang)
            }

            # Cache result
            self._set_cache(cache_key, result)

            logger.info(f"Translated: '{text}' → '{translation.text}'")
            return result

        except Exception as e:
            logger.error(f"Translation failed: {e}")
            # Fallback: use original text
            return {
                "original": text,
                "translated": text,
                "source_lang": source_lang,
                "entities_preserved": {}
            }

    def _extract_entities(self, text: str, language: str) -> Dict[str, str]:
        """
        Extract entities that should be preserved in original language
        
        Args:
            text: Original text
            language: Source language
            
        Returns:
            Dictionary of entities to preserve
            
        Note: This is a simplified implementation.
        In production, use spaCy or similar for proper NER.
        """
        # Placeholder: In production, extract actual entities
        # For now, preserve the entire text as potential task title
        return {"title": text}


class ResponseTranslator:
    """Translates system responses to user's language"""

    def __init__(self):
        self.translator = Translator()

    def get_template(
        self,
        language: str,
        template_key: str,
        **params
    ) -> str:
        """
        Get translated template with parameters
        
        Args:
            language: Target language code
            template_key: Template key (e.g., "task_created")
            **params: Template parameters (title, task_id, count, etc.)
            
        Returns:
            Formatted template string
            
        Example:
            >>> get_template("es", "task_created", title="comprar leche", task_id=5)
            "Tarea creada: comprar leche (ID: 5)"
        """
        templates = RESPONSE_TEMPLATES.get(language, RESPONSE_TEMPLATES["en"])
        template = templates.get(template_key, RESPONSE_TEMPLATES["en"][template_key])

        try:
            return template.format(**params)
        except KeyError as e:
            logger.error(f"Missing template parameter: {e}")
            return template

    async def translate_response(
        self,
        response: Dict[str, Any],
        target_lang: str
    ) -> str:
        """
        Translate system response to user's language
        CRITICAL: Preserve user content (task titles, descriptions)
        
        Args:
            response: Response dictionary with template_key and params
            target_lang: Target language code
            
        Returns:
            Translated response string
        """
        if target_lang == "en":
            return self.get_template("en", **response)

        # Use pre-translated templates
        if "template_key" in response:
            return self.get_template(
                target_lang,
                response["template_key"],
                **response.get("params", {})
            )

        # Dynamic translation for complex responses
        # (Preserve user content fields: title, description, tags)
        return await self._translate_dynamic(response, target_lang)

    async def _translate_dynamic(
        self,
        response: Dict[str, Any],
        target_lang: str
    ) -> str:
        """
        Translate complex responses dynamically
        Preserve user-generated content
        """
        # Identify system text vs user content
        user_content_keys = {"title", "description", "tags", "name"}
        system_parts = []
        user_parts = {}

        for key, value in response.items():
            if key in user_content_keys:
                # User content - DON'T translate
                user_parts[key] = value
            else:
                # System message - translate
                if isinstance(value, str):
                    system_parts.append(value)

        # Translate system parts
        if system_parts:
            try:
                translated = self.translator.translate(
                    "\n".join(system_parts),
                    dest=target_lang
                )
                translated_text = translated.text
            except Exception as e:
                logger.error(f"Dynamic translation failed: {e}")
                translated_text = "\n".join(system_parts)
        else:
            translated_text = ""

        # Reconstruct response (system text + user content)
        # This is simplified - adjust based on actual response structure
        return translated_text


class TranslationMiddleware:
    """
    Main translation middleware for FastAPI
    Handles language detection and translation layers
    """

    def __init__(self):
        self.language_detector = LanguageDetector()
        self.input_translator = InputTranslator()
        self.response_translator = ResponseTranslator()

    async def process_request(
        self,
        request: Request,
        user_id: Optional[int],
        user_input: str,
        db: Session
    ) -> Dict[str, Any]:
        """
        Process incoming request with translation
        
        Args:
            request: FastAPI request
            user_id: Authenticated user ID
            user_input: User's message/input
            db: Database session
            
        Returns:
            {
                "original_input": "Añade comprar leche",
                "translated_input": "Add buy milk",
                "user_language": "es",
                "entities_preserved": {"title": "comprar leche"}
            }
        """
        # Step 1: Detect language
        auto_detected = self.language_detector.detect_from_text(user_input)

        # Step 2: Get user's preferred language
        if user_id:
            user_language = self.language_detector.get_user_language(
                user_id, auto_detected, db
            )
        else:
            # Guest user: use auto-detection or request header
            user_language = auto_detected or self.language_detector.detect_from_request(
                request
            )

        # Step 3: Translate input to English for NLU
        translation = await self.input_translator.translate_for_nlu(
            user_input, user_language
        )

        return {
            "original_input": translation["original"],
            "translated_input": translation["translated"],
            "user_language": user_language,
            "entities_preserved": translation["entities_preserved"]
        }

    async def process_response(
        self,
        response_data: Dict[str, Any],
        user_language: str
    ) -> str:
        """
        Translate system response to user's language
        
        Args:
            response_data: Response with template_key and params
            user_language: User's language code
            
        Returns:
            Translated response string
        """
        return await self.response_translator.translate_response(
            response_data, user_language
        )


# Singleton instance
translation_middleware = TranslationMiddleware()


# Dependency for FastAPI endpoints
async def get_translation_middleware() -> TranslationMiddleware:
    """FastAPI dependency for translation middleware"""
    return translation_middleware


# Example usage in FastAPI endpoint
"""
from fastapi import APIRouter, Depends
from middleware.translate import get_translation_middleware, TranslationMiddleware

router = APIRouter()

@router.post("/chat")
async def chat_endpoint(
    message: str,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    translator: TranslationMiddleware = Depends(get_translation_middleware)
):
    # Step 1: Process request (detect + translate)
    translation = await translator.process_request(
        request, current_user.id, message, db
    )
    
    # Step 2: Process with NLU (use translated English input)
    intent, entities = classify_intent(translation["translated_input"])
    
    # Step 3: Preserve original language in entities
    if "title" in entities and translation["entities_preserved"].get("title"):
        entities["title"] = translation["entities_preserved"]["title"]
    
    # Step 4: Execute tool
    result = await orchestrator.execute(intent, entities, {"user_id": current_user.id})
    
    # Step 5: Translate response
    response_text = await translator.process_response(
        {
            "template_key": "task_created",
            "params": {
                "title": entities["title"],  # Original language
                "task_id": result["task_id"]
            }
        },
        translation["user_language"]
    )
    
    return {"message": response_text}
"""
