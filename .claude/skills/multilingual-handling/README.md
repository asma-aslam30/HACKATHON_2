# Multilingual Handling Skill

**Skill Type**: Internationalization (i18n) & Multilingual NLU Design
**Version**: 1.0.0
**Created**: 2025-12-25
**Owner**: Spec Architect Agent

---

## Overview

The **Multilingual Handling** skill provides comprehensive design patterns for internationalization (i18n) and multilingual Natural Language Understanding (NLU) in the Evolution of Todo application. This skill enables global Hackathon II users to interact with the application in their native language while maintaining data integrity and system consistency.

**Purpose**: Design and implement language detection, translation layers, and bilingual UI support for a globally accessible task management system.

**Output**:
- `specs/i18n/locales.md` - Internationalization specification
- `middleware/translate.py` - Translation middleware implementation guide
- Language detection and routing architecture
- UI translation strategy with Next.js i18next

---

## Skill Components

### 1. Language Detection & Routing
- Automatic language detection from user input
- Intent translation to English for MCP tool processing
- Response translation back to user's language
- Language preference persistence

### 2. Translation Layers
- **Input Layer**: User input (any language) → English intent/entities
- **Storage Layer**: Preserve task titles/descriptions in original language
- **Output Layer**: System responses → User's preferred language
- **UI Layer**: Static UI elements translated via i18next

### 3. Bilingual UI Support
- Next.js i18next integration
- ChatKit locale support for chat interface
- Dynamic language switching
- RTL (Right-to-Left) language support

### 4. Data Integrity
- Store user content in original language
- Never auto-translate user-created content
- Translate only system messages and UI elements
- Metadata in English for system processing

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User Input (Any Language)                │
│              "Añade comprar leche mañana"                   │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│               Language Detection Layer                      │
│  - Detect: Spanish (es)                                     │
│  - Store preference: user.preferred_language = "es"         │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              Intent Translation Layer                       │
│  - Input: "Añade comprar leche mañana" (es)                │
│  - Translate: "Add buy milk tomorrow" (en)                 │
│  - Extract intent: "add_task"                               │
│  - Extract entities: {title: "comprar leche", due: ...}    │
│  - KEEP: Original title in Spanish                          │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                MCP Tool Execution (English)                 │
│  add_task(title="comprar leche", due_date="2025-12-26")    │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│               Response Translation Layer                    │
│  - English: "Task created: comprar leche"                   │
│  - Translate system message to Spanish                      │
│  - KEEP: User content "comprar leche" untranslated          │
│  - Output: "Tarea creada: comprar leche"                    │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                  User Response (Spanish)                    │
│              "Tarea creada: comprar leche"                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Language Detection & Routing

### Supported Languages (Phase II)

| **Language** | **Code** | **Status** | **RTL** | **Priority** |
|--------------|----------|------------|---------|--------------|
| English | en | Primary | No | P0 |
| Spanish | es | Supported | No | P1 |
| French | fr | Supported | No | P1 |
| German | de | Supported | No | P1 |
| Portuguese | pt | Supported | No | P1 |
| Chinese (Simplified) | zh | Supported | No | P2 |
| Japanese | ja | Supported | No | P2 |
| Arabic | ar | Supported | Yes | P2 |
| Hindi | hi | Supported | No | P2 |

**Future Expansion**: Add more languages based on user demand

---

### Language Detection Strategy

**Method 1: Automatic Detection (Primary)**

```python
from langdetect import detect, DetectorFactory
from typing import Optional

# Ensure consistent results
DetectorFactory.seed = 0

def detect_language(text: str, fallback: str = "en") -> str:
    """
    Detect language from user input
    
    Args:
        text: User input text
        fallback: Default language if detection fails
        
    Returns:
        ISO 639-1 language code (e.g., "en", "es", "fr")
    """
    try:
        # Minimum 3 characters for reliable detection
        if len(text.strip()) < 3:
            return fallback
            
        detected = detect(text)
        
        # Validate against supported languages
        if detected in SUPPORTED_LANGUAGES:
            return detected
        else:
            return fallback
            
    except Exception:
        return fallback

# Usage
user_input = "Añade comprar leche"
language = detect_language(user_input)  # Returns: "es"
```

**Method 2: User Preference (Override)**

```python
def get_user_language(user_id: int, auto_detected: str) -> str:
    """
    Get user's preferred language
    Priority: User preference > Auto-detection
    """
    user = get_user_by_id(user_id)
    
    if user.preferred_language:
        return user.preferred_language
    else:
        # First interaction: use auto-detected, save as preference
        user.preferred_language = auto_detected
        save_user_preferences(user)
        return auto_detected
```

**Method 3: Browser/Request Header (Fallback)**

```python
def detect_from_request(request) -> str:
    """Extract language from Accept-Language header"""
    accept_language = request.headers.get("Accept-Language", "en")
    
    # Parse: "en-US,en;q=0.9,es;q=0.8"
    languages = []
    for lang in accept_language.split(","):
        code = lang.split(";")[0].split("-")[0].strip()
        languages.append(code)
    
    # Return first supported language
    for code in languages:
        if code in SUPPORTED_LANGUAGES:
            return code
    
    return "en"
```

---

## Translation Layers

### Layer 1: Input Translation (NLU)

**Purpose**: Translate user input to English for intent classification and entity extraction

```python
from googletrans import Translator

class InputTranslator:
    def __init__(self):
        self.translator = Translator()
        self.cache = {}  # Cache translations
    
    async def translate_for_nlu(
        self, 
        text: str, 
        source_lang: str
    ) -> dict:
        """
        Translate user input for NLU processing
        
        Returns:
            {
                "original": "Añade comprar leche mañana",
                "translated": "Add buy milk tomorrow",
                "source_lang": "es",
                "entities_map": {"comprar leche": "buy milk"}
            }
        """
        if source_lang == "en":
            return {
                "original": text,
                "translated": text,
                "source_lang": "en",
                "entities_map": {}
            }
        
        # Check cache
        cache_key = f"{source_lang}:{text}"
        if cache_key in self.cache:
            return self.cache[cache_key]
        
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
            "entities_map": self._extract_entities_map(text, translation.text)
        }
        
        # Cache result
        self.cache[cache_key] = result
        
        return result
    
    def _extract_entities_map(self, original: str, translated: str) -> dict:
        """
        Map translated entities back to original language
        Example: {"comprar leche": "buy milk"}
        """
        # Simplified: extract noun phrases
        # In production, use spaCy or similar for better extraction
        entities_map = {}
        
        # This is a placeholder - implement proper entity alignment
        # using word alignment models or NER in both languages
        
        return entities_map
```

**Usage in Chatbot Agent**:

```python
async def process_user_message(message: str, user_context: dict):
    # Step 1: Detect language
    detected_lang = detect_language(message)
    user_lang = get_user_language(user_context["user_id"], detected_lang)
    
    # Step 2: Translate to English for NLU
    translation = await input_translator.translate_for_nlu(
        message, 
        user_lang
    )
    
    # Step 3: Process in English
    english_text = translation["translated"]
    intent, entities = classify_intent(english_text)
    
    # Step 4: Preserve original language in entities
    if "title" in entities and user_lang != "en":
        # Use original language title from user input
        entities["title"] = extract_title_from_original(
            translation["original"]
        )
    
    # Step 5: Execute tool (with original language content)
    result = await orchestrator.execute(intent, entities, user_context)
    
    # Step 6: Translate response back to user's language
    response = await translate_response(result, user_lang)
    
    return response
```

---

### Layer 2: Storage Layer (Content Preservation)

**Critical Rule**: NEVER auto-translate user-created content

```python
class Task(SQLModel, table=True):
    """Task model - stores content in user's language"""
    
    id: int
    user_id: int
    title: str  # ✅ Store in original language: "comprar leche"
    description: str  # ✅ Store in original language
    
    # Metadata in English for system processing
    status: str  # "pending", "completed"
    priority: str  # "low", "medium", "high"
    tags: List[str]  # Can be multilingual
    
    # Language metadata
    content_language: str  # "es" - for future features
    
    created_at: datetime
    updated_at: datetime
```

**Storage Strategy**:

```python
async def create_task(user_input: dict, user_lang: str):
    """
    Create task preserving original language
    """
    task = Task(
        user_id=user_input["user_id"],
        title=user_input["title"],  # ✅ Original: "comprar leche"
        description=user_input.get("description", ""),  # ✅ Original
        status="pending",  # ✅ English metadata
        priority=user_input.get("priority", "medium"),  # ✅ English
        tags=user_input.get("tags", []),  # Can be multilingual
        content_language=user_lang  # Store for future reference
    )
    
    db.add(task)
    await db.commit()
    
    return task
```

---

### Layer 3: Output Translation (Responses)

**Strategy**: Translate system messages, preserve user content

```python
class ResponseTranslator:
    def __init__(self):
        self.translator = Translator()
        self.templates = load_response_templates()
    
    async def translate_response(
        self, 
        response: dict, 
        target_lang: str
    ) -> str:
        """
        Translate system response to user's language
        Preserve user content (task titles, descriptions)
        """
        if target_lang == "en":
            return response
        
        # Use pre-translated templates for common messages
        if response.get("template_key"):
            return self._use_template(
                response["template_key"], 
                response.get("params", {}),
                target_lang
            )
        
        # Dynamic translation for complex responses
        return await self._translate_dynamic(response, target_lang)
    
    def _use_template(
        self, 
        template_key: str, 
        params: dict, 
        target_lang: str
    ) -> str:
        """
        Use pre-translated template
        
        Example templates:
            en: "Task created: {title}"
            es: "Tarea creada: {title}"
            fr: "Tâche créée : {title}"
        """
        template = self.templates[target_lang][template_key]
        
        # DO NOT translate user content in params
        # params["title"] stays in original language
        
        return template.format(**params)
    
    async def _translate_dynamic(self, response: dict, target_lang: str):
        """Translate complex responses"""
        
        # Identify system text vs user content
        system_parts = []
        user_content_parts = []
        
        for key, value in response.items():
            if key in ["title", "description", "tags"]:
                # User content - don't translate
                user_content_parts.append(value)
            else:
                # System message - translate
                system_parts.append(value)
        
        # Translate only system parts
        translated_system = self.translator.translate(
            "\n".join(system_parts),
            dest=target_lang
        )
        
        # Reconstruct response with original user content
        # ... implementation details
        
        return reconstructed_response
```

**Example Usage**:

```python
# English response
response = {
    "template_key": "task_created",
    "params": {
        "title": "comprar leche",  # Spanish - user content
        "task_id": 5
    }
}

# Translate to Spanish
translated = await response_translator.translate_response(
    response, 
    target_lang="es"
)

# Result: "Tarea creada: comprar leche"
# Note: "comprar leche" stays in Spanish (user's original input)
```

---

### Layer 4: UI Translation (Static Elements)

**Technology**: Next.js + i18next

**File Structure**:
```
frontend/
├── locales/
│   ├── en/
│   │   ├── common.json
│   │   ├── chat.json
│   │   └── tasks.json
│   ├── es/
│   │   ├── common.json
│   │   ├── chat.json
│   │   └── tasks.json
│   ├── fr/
│   │   └── ...
│   └── ...
├── i18n.config.ts
└── components/
    └── LanguageSwitcher.tsx
```

**Configuration** (`i18n.config.ts`):

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enCommon from './locales/en/common.json';
import enChat from './locales/en/chat.json';
import enTasks from './locales/en/tasks.json';
import esCommon from './locales/es/common.json';
import esChat from './locales/es/chat.json';
import esTasks from './locales/es/tasks.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: enCommon,
        chat: enChat,
        tasks: enTasks,
      },
      es: {
        common: esCommon,
        chat: esChat,
        tasks: esTasks,
      },
      // ... more languages
    },
    fallbackLng: 'en',
    defaultNS: 'common',
    interpolation: {
      escapeValue: false, // React already escapes
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n;
```

**Translation Files** (`locales/en/common.json`):

```json
{
  "app_name": "Evolution of Todo",
  "nav": {
    "tasks": "Tasks",
    "chat": "Chat",
    "settings": "Settings",
    "logout": "Logout"
  },
  "buttons": {
    "add": "Add",
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit"
  },
  "status": {
    "pending": "Pending",
    "completed": "Completed"
  },
  "priority": {
    "low": "Low",
    "medium": "Medium",
    "high": "High"
  }
}
```

**Translation Files** (`locales/es/common.json`):

```json
{
  "app_name": "Evolución de Tareas",
  "nav": {
    "tasks": "Tareas",
    "chat": "Chat",
    "settings": "Configuración",
    "logout": "Cerrar sesión"
  },
  "buttons": {
    "add": "Añadir",
    "save": "Guardar",
    "cancel": "Cancelar",
    "delete": "Eliminar",
    "edit": "Editar"
  },
  "status": {
    "pending": "Pendiente",
    "completed": "Completada"
  },
  "priority": {
    "low": "Baja",
    "medium": "Media",
    "high": "Alta"
  }
}
```

**Usage in Components**:

```typescript
import { useTranslation } from 'react-i18next';

export function TaskList() {
  const { t } = useTranslation('tasks');
  
  return (
    <div>
      <h1>{t('title')}</h1>
      <button>{t('common:buttons.add')}</button>
      
      {tasks.map(task => (
        <div key={task.id}>
          {/* User content - NOT translated */}
          <h3>{task.title}</h3>
          
          {/* System labels - translated */}
          <span>{t(`common:status.${task.status}`)}</span>
          <span>{t(`common:priority.${task.priority}`)}</span>
        </div>
      ))}
    </div>
  );
}
```

**Language Switcher Component**:

```typescript
import { useTranslation } from 'react-i18next';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  
  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
  ];
  
  const changeLanguage = async (langCode: string) => {
    await i18n.changeLanguage(langCode);
    
    // Save preference to backend
    await fetch('/api/user/preferences', {
      method: 'PATCH',
      body: JSON.stringify({ preferred_language: langCode }),
    });
  };
  
  return (
    <select 
      value={i18n.language} 
      onChange={(e) => changeLanguage(e.target.value)}
    >
      {languages.map(lang => (
        <option key={lang.code} value={lang.code}>
          {lang.flag} {lang.name}
        </option>
      ))}
    </select>
  );
}
```

---

## ChatKit Locale Support

**Integration with Chat Interface**:

```typescript
import { ChatProvider } from '@chatscope/chat-ui-kit-react';
import { useTranslation } from 'react-i18next';

export function ChatInterface() {
  const { i18n } = useTranslation();
  
  return (
    <ChatProvider locale={i18n.language}>
      <ChatContainer>
        <MessageList>
          {messages.map(msg => (
            <Message
              key={msg.id}
              model={{
                message: msg.content,
                direction: msg.role === 'user' ? 'outgoing' : 'incoming',
              }}
            />
          ))}
        </MessageList>
        
        <MessageInput 
          placeholder={t('chat:input_placeholder')}
          attachButton={false}
        />
      </ChatContainer>
    </ChatProvider>
  );
}
```

**Chat Translations** (`locales/en/chat.json`):

```json
{
  "input_placeholder": "Type your message...",
  "thinking": "Thinking...",
  "error": "Something went wrong. Please try again.",
  "welcome": "Hi! I'm your AI assistant. How can I help you today?",
  "suggestions": {
    "add_task": "Add a task",
    "list_tasks": "Show my tasks",
    "complete_task": "Complete a task"
  }
}
```

**Chat Translations** (`locales/es/chat.json`):

```json
{
  "input_placeholder": "Escribe tu mensaje...",
  "thinking": "Pensando...",
  "error": "Algo salió mal. Por favor, inténtalo de nuevo.",
  "welcome": "¡Hola! Soy tu asistente de IA. ¿Cómo puedo ayudarte hoy?",
  "suggestions": {
    "add_task": "Añadir una tarea",
    "list_tasks": "Mostrar mis tareas",
    "complete_task": "Completar una tarea"
  }
}
```

---

## RTL (Right-to-Left) Language Support

**Supported RTL Languages**: Arabic (ar), Hebrew (he), Urdu (ur)

**CSS Strategy**:

```css
/* globals.css */
[dir="rtl"] {
  direction: rtl;
  text-align: right;
}

[dir="rtl"] .task-item {
  padding-left: 0;
  padding-right: 1rem;
}

[dir="rtl"] .icon-arrow {
  transform: scaleX(-1);
}
```

**React Implementation**:

```typescript
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const RTL_LANGUAGES = ['ar', 'he', 'ur'];

export function useRTL() {
  const { i18n } = useTranslation();
  
  useEffect(() => {
    const isRTL = RTL_LANGUAGES.includes(i18n.language);
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  }, [i18n.language]);
}

// Usage in root component
export function App() {
  useRTL();
  
  return (
    <div>
      {/* Your app */}
    </div>
  );
}
```

---

## Complete Example Flow

### Example: Spanish User Adding Task

**Step 1: User Input (Spanish)**
```
User: "Añade comprar leche para mañana con prioridad alta"
```

**Step 2: Language Detection**
```python
detected_lang = detect_language("Añade comprar leche...")
# Result: "es"

user_lang = get_user_language(user_id=123, auto_detected="es")
# Result: "es" (saved as preference)
```

**Step 3: Input Translation for NLU**
```python
translation = await input_translator.translate_for_nlu(
    "Añade comprar leche para mañana con prioridad alta",
    source_lang="es"
)

# Result:
# {
#     "original": "Añade comprar leche para mañana con prioridad alta",
#     "translated": "Add buy milk for tomorrow with high priority",
#     "source_lang": "es",
#     "entities_map": {}
# }
```

**Step 4: Intent Classification (English)**
```python
intent, entities = classify_intent(translation["translated"])

# Result:
# intent = "add_task"
# entities = {
#     "title": "buy milk",  # ❌ English translation
#     "due_date": "2025-12-26",
#     "priority": "high"
# }

# ✅ FIX: Use original Spanish title
entities["title"] = extract_title_from_original(translation["original"])
# entities["title"] = "comprar leche"  # ✅ Original Spanish
```

**Step 5: MCP Tool Execution**
```python
result = await call_mcp_tool("add_task", {
    "title": "comprar leche",  # ✅ Spanish preserved
    "due_date": "2025-12-26",
    "priority": "high"
})

# Result:
# {
#     "task_id": 5,
#     "status": "created",
#     "message": "Task created: comprar leche"
# }
```

**Step 6: Response Translation to Spanish**
```python
response = await response_translator.translate_response(
    {
        "template_key": "task_created",
        "params": {
            "title": "comprar leche",  # ✅ Spanish preserved
            "task_id": 5
        }
    },
    target_lang="es"
)

# Result: "Tarea creada: comprar leche (ID: 5)"
```

**Step 7: User Sees Response (Spanish)**
```
Assistant: "Tarea creada: comprar leche (ID: 5)"
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│  User: "Añade comprar leche mañana" (Spanish)              │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │   Detect Language: "es"       │
        │   Save Preference             │
        └───────────┬───────────────────┘
                    │
                    ▼
        ┌───────────────────────────────┐
        │  Translate to English (NLU)   │
        │  "Add buy milk tomorrow"      │
        └───────────┬───────────────────┘
                    │
                    ▼
        ┌───────────────────────────────┐
        │  Extract Intent & Entities    │
        │  intent: "add_task"           │
        │  entities: {title: "...", ...}│
        └───────────┬───────────────────┘
                    │
                    ▼
        ┌───────────────────────────────┐
        │  ✅ FIX: Use Original Title   │
        │  title: "comprar leche" (es)  │
        └───────────┬───────────────────┘
                    │
                    ▼
        ┌───────────────────────────────┐
        │  Call MCP Tool                │
        │  add_task("comprar leche")    │
        └───────────┬───────────────────┘
                    │
                    ▼
        ┌───────────────────────────────┐
        │  Store in Database            │
        │  title: "comprar leche" (es)  │
        │  content_language: "es"       │
        └───────────┬───────────────────┘
                    │
                    ▼
        ┌───────────────────────────────┐
        │  Translate Response to Spanish│
        │  "Tarea creada: comprar leche"│
        └───────────┬───────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  Assistant: "Tarea creada: comprar leche" (Spanish)        │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Checklist

### Backend (FastAPI + Translation Middleware)

- [ ] Install language detection: `pip install langdetect googletrans==4.0.0-rc1`
- [ ] Create `middleware/translate.py` with translation layers
- [ ] Add `content_language` field to Task model
- [ ] Implement language detection in chatbot endpoint
- [ ] Preserve original language in task titles/descriptions
- [ ] Translate system responses using templates
- [ ] Add user language preference to User model
- [ ] Create language preference API endpoint

### Frontend (Next.js + i18next)

- [ ] Install i18next: `npm install i18next react-i18next i18next-browser-languagedetector`
- [ ] Create translation files for each language (common, chat, tasks)
- [ ] Configure i18n in `i18n.config.ts`
- [ ] Create LanguageSwitcher component
- [ ] Implement RTL support for Arabic/Hebrew
- [ ] Update ChatKit with locale support
- [ ] Test all UI elements with each language
- [ ] Ensure user content (task titles) are NOT translated

### Database

- [ ] Add migration: `user.preferred_language` (VARCHAR(5))
- [ ] Add migration: `task.content_language` (VARCHAR(5))
- [ ] Index on `user.preferred_language` for analytics

### Testing

- [ ] Unit tests: language detection
- [ ] Unit tests: translation layers
- [ ] Integration tests: Spanish → English → Spanish flow
- [ ] E2E tests: UI language switching
- [ ] RTL layout tests for Arabic
- [ ] Performance tests: translation caching

---

## Related Agents

- **AI Chatbot Agent** (`.claude/agents/ai-chatbot.md`): Implements multilingual NLU
- **Frontend UI Agent** (`.claude/agents/frontend-ui.md`): Implements i18next UI
- **Backend / FastAPI Pro Agent** (`.claude/agents/backend-fastapi.md`): Implements translation middleware
- **Spec Architect Agent** (`.claude/agents/spec-architect.md`): Designs i18n architecture

---

## Skill Invocation

**For i18n Design**:
```
Act as Spec Architect Agent and design multilingual support for the application
```

**For Backend Implementation**:
```
Act as Backend / FastAPI Pro Agent and implement translation middleware
```

**For Frontend Implementation**:
```
Act as Frontend UI Agent and implement i18next multilingual UI
```

---

## Success Metrics

A well-designed multilingual system has:
- ✅ Automatic language detection (95%+ accuracy)
- ✅ User language preference persistence
- ✅ Original language preservation for user content
- ✅ System message translation with templates
- ✅ Bilingual UI with i18next
- ✅ RTL support for Arabic/Hebrew/Urdu
- ✅ Fast translation caching (< 100ms)
- ✅ Comprehensive language coverage (8+ languages)

---

## Revision History

| **Version** | **Date**       | **Changes**                                      |
|-------------|----------------|--------------------------------------------------|
| 1.0.0       | 2025-12-25     | Initial skill documentation                      |

---

## References

- **Constitution**: `.specify/memory/constitution.md` (Principle IX: Accessibility)
- **AI Chatbot Agent**: `.claude/agents/ai-chatbot.md`
- **Frontend UI Agent**: `.claude/agents/frontend-ui.md`
- **i18next Documentation**: https://www.i18next.com/
- **langdetect**: https://pypi.org/project/langdetect/
- **googletrans**: https://py-googletrans.readthedocs.io/

---

**Status**: Ready for Phase II implementation
**Activation**: See skill invocation section above
