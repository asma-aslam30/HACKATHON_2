# Internationalization (i18n) Specification

**Version**: 1.0.0
**Phase**: II (Web UI + Multilingual Support)
**Last Updated**: 2025-12-25
**Owner**: Spec Architect Agent

---

## Overview

This specification defines the internationalization (i18n) strategy for the Evolution of Todo application, enabling global Hackathon II users to interact with the system in their native language. The system supports 9 languages initially, with architecture for easy expansion.

**Key Principles**:
1. **Preserve User Content**: Never auto-translate task titles, descriptions, or user-generated content
2. **Translate System UI**: All buttons, labels, messages, and system text are localized
3. **Automatic Detection**: Detect user language automatically with manual override
4. **Consistent Experience**: Same features available in all languages

---

## Supported Languages

### Phase II Launch Languages

| **Language** | **Code** | **Native Name** | **Flag** | **RTL** | **Coverage** | **Priority** |
|--------------|----------|-----------------|----------|---------|--------------|--------------|
| English | en | English | 🇺🇸 | No | 100% | P0 (Primary) |
| Spanish | es | Español | 🇪🇸 | No | 100% | P1 |
| French | fr | Français | 🇫🇷 | No | 100% | P1 |
| German | de | Deutsch | 🇩🇪 | No | 100% | P1 |
| Portuguese | pt | Português | 🇵🇹 | No | 100% | P1 |
| Chinese (Simplified) | zh | 简体中文 | 🇨🇳 | No | 95% | P2 |
| Japanese | ja | 日本語 | 🇯🇵 | No | 95% | P2 |
| Arabic | ar | العربية | 🇸🇦 | Yes | 90% | P2 |
| Hindi | hi | हिन्दी | 🇮🇳 | No | 90% | P2 |

**Total**: 9 languages covering ~3.5 billion native speakers

**Future Expansion**: Russian, Korean, Italian, Turkish, Polish (based on user demand)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              i18next + react-i18next                 │   │
│  │  - Static UI translations (buttons, labels)          │   │
│  │  - Language detection (browser + user preference)    │   │
│  │  - RTL layout support                                │   │
│  └───────────────────┬──────────────────────────────────┘   │
└────────────────────────┼────────────────────────────────────┘
                        │
                        │ HTTP + Language Header
                        │
┌────────────────────────┼────────────────────────────────────┐
│                    Backend (FastAPI)                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           Translation Middleware                     │   │
│  │  - Language detection (Accept-Language + JWT)        │   │
│  │  - NLU translation (input → English)                 │   │
│  │  - Response translation (English → user language)    │   │
│  │  - Content preservation (task titles stay original) │   │
│  └───────────────────┬──────────────────────────────────┘   │
│                      │                                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Database (PostgreSQL)                   │   │
│  │  - task.title (user's original language)            │   │
│  │  - task.content_language (e.g., "es")               │   │
│  │  - user.preferred_language (e.g., "es")             │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Translation Namespaces

### Namespace Organization

```
locales/
├── en/
│   ├── common.json         # App-wide strings (nav, buttons)
│   ├── auth.json           # Authentication screens
│   ├── tasks.json          # Task management
│   ├── chat.json           # AI chatbot interface
│   ├── settings.json       # User settings
│   └── errors.json         # Error messages
├── es/
│   ├── common.json
│   ├── auth.json
│   ├── tasks.json
│   ├── chat.json
│   ├── settings.json
│   └── errors.json
└── ... (other languages)
```

---

## Translation Files

### common.json (App-Wide)

**English** (`locales/en/common.json`):
```json
{
  "app_name": "Evolution of Todo",
  "nav": {
    "tasks": "Tasks",
    "chat": "Chat",
    "settings": "Settings",
    "profile": "Profile",
    "logout": "Logout"
  },
  "buttons": {
    "add": "Add",
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "close": "Close",
    "confirm": "Confirm",
    "back": "Back",
    "next": "Next"
  },
  "status": {
    "pending": "Pending",
    "completed": "Completed",
    "loading": "Loading...",
    "saving": "Saving...",
    "deleting": "Deleting..."
  },
  "priority": {
    "low": "Low",
    "medium": "Medium",
    "high": "High"
  },
  "time": {
    "today": "Today",
    "tomorrow": "Tomorrow",
    "yesterday": "Yesterday",
    "this_week": "This Week",
    "next_week": "Next Week",
    "overdue": "Overdue"
  }
}
```

**Spanish** (`locales/es/common.json`):
```json
{
  "app_name": "Evolución de Tareas",
  "nav": {
    "tasks": "Tareas",
    "chat": "Chat",
    "settings": "Configuración",
    "profile": "Perfil",
    "logout": "Cerrar sesión"
  },
  "buttons": {
    "add": "Añadir",
    "save": "Guardar",
    "cancel": "Cancelar",
    "delete": "Eliminar",
    "edit": "Editar",
    "close": "Cerrar",
    "confirm": "Confirmar",
    "back": "Volver",
    "next": "Siguiente"
  },
  "status": {
    "pending": "Pendiente",
    "completed": "Completada",
    "loading": "Cargando...",
    "saving": "Guardando...",
    "deleting": "Eliminando..."
  },
  "priority": {
    "low": "Baja",
    "medium": "Media",
    "high": "Alta"
  },
  "time": {
    "today": "Hoy",
    "tomorrow": "Mañana",
    "yesterday": "Ayer",
    "this_week": "Esta Semana",
    "next_week": "Próxima Semana",
    "overdue": "Atrasada"
  }
}
```

**French** (`locales/fr/common.json`):
```json
{
  "app_name": "Évolution des Tâches",
  "nav": {
    "tasks": "Tâches",
    "chat": "Chat",
    "settings": "Paramètres",
    "profile": "Profil",
    "logout": "Déconnexion"
  },
  "buttons": {
    "add": "Ajouter",
    "save": "Enregistrer",
    "cancel": "Annuler",
    "delete": "Supprimer",
    "edit": "Modifier",
    "close": "Fermer",
    "confirm": "Confirmer",
    "back": "Retour",
    "next": "Suivant"
  },
  "status": {
    "pending": "En attente",
    "completed": "Terminée",
    "loading": "Chargement...",
    "saving": "Enregistrement...",
    "deleting": "Suppression..."
  },
  "priority": {
    "low": "Faible",
    "medium": "Moyenne",
    "high": "Élevée"
  },
  "time": {
    "today": "Aujourd'hui",
    "tomorrow": "Demain",
    "yesterday": "Hier",
    "this_week": "Cette Semaine",
    "next_week": "Semaine Prochaine",
    "overdue": "En retard"
  }
}
```

---

### auth.json (Authentication)

**English** (`locales/en/auth.json`):
```json
{
  "login": {
    "title": "Welcome Back",
    "subtitle": "Sign in to continue",
    "email_label": "Email",
    "password_label": "Password",
    "submit": "Sign In",
    "forgot_password": "Forgot password?",
    "no_account": "Don't have an account?",
    "sign_up_link": "Sign up"
  },
  "register": {
    "title": "Create Account",
    "subtitle": "Join Evolution of Todo",
    "name_label": "Full Name",
    "email_label": "Email",
    "password_label": "Password",
    "confirm_password_label": "Confirm Password",
    "submit": "Create Account",
    "have_account": "Already have an account?",
    "sign_in_link": "Sign in"
  },
  "validation": {
    "email_required": "Email is required",
    "email_invalid": "Please enter a valid email",
    "password_required": "Password is required",
    "password_min_length": "Password must be at least 8 characters",
    "password_mismatch": "Passwords do not match",
    "name_required": "Name is required"
  },
  "messages": {
    "login_success": "Welcome back!",
    "register_success": "Account created successfully!",
    "login_failed": "Invalid email or password",
    "register_failed": "Registration failed. Please try again."
  }
}
```

**Spanish** (`locales/es/auth.json`):
```json
{
  "login": {
    "title": "Bienvenido de Nuevo",
    "subtitle": "Inicia sesión para continuar",
    "email_label": "Correo electrónico",
    "password_label": "Contraseña",
    "submit": "Iniciar Sesión",
    "forgot_password": "¿Olvidaste tu contraseña?",
    "no_account": "¿No tienes una cuenta?",
    "sign_up_link": "Regístrate"
  },
  "register": {
    "title": "Crear Cuenta",
    "subtitle": "Únete a Evolución de Tareas",
    "name_label": "Nombre Completo",
    "email_label": "Correo electrónico",
    "password_label": "Contraseña",
    "confirm_password_label": "Confirmar Contraseña",
    "submit": "Crear Cuenta",
    "have_account": "¿Ya tienes una cuenta?",
    "sign_in_link": "Inicia sesión"
  },
  "validation": {
    "email_required": "El correo electrónico es obligatorio",
    "email_invalid": "Por favor ingresa un correo válido",
    "password_required": "La contraseña es obligatoria",
    "password_min_length": "La contraseña debe tener al menos 8 caracteres",
    "password_mismatch": "Las contraseñas no coinciden",
    "name_required": "El nombre es obligatorio"
  },
  "messages": {
    "login_success": "¡Bienvenido de nuevo!",
    "register_success": "¡Cuenta creada exitosamente!",
    "login_failed": "Correo o contraseña inválidos",
    "register_failed": "El registro falló. Por favor intenta de nuevo."
  }
}
```

---

### tasks.json (Task Management)

**English** (`locales/en/tasks.json`):
```json
{
  "title": "My Tasks",
  "empty_state": "No tasks yet. Add one to get started!",
  "add_task": "Add Task",
  "edit_task": "Edit Task",
  "delete_task": "Delete Task",
  "complete_task": "Mark Complete",
  "uncomplete_task": "Mark Incomplete",
  "form": {
    "title_label": "Title",
    "title_placeholder": "What needs to be done?",
    "description_label": "Description",
    "description_placeholder": "Add details...",
    "priority_label": "Priority",
    "due_date_label": "Due Date",
    "tags_label": "Tags",
    "tags_placeholder": "Add tags..."
  },
  "filters": {
    "all": "All Tasks",
    "pending": "Pending",
    "completed": "Completed",
    "high_priority": "High Priority",
    "overdue": "Overdue"
  },
  "messages": {
    "task_created": "Task created successfully",
    "task_updated": "Task updated successfully",
    "task_deleted": "Task deleted successfully",
    "task_completed": "Task marked as complete",
    "task_uncompleted": "Task marked as incomplete",
    "delete_confirm": "Are you sure you want to delete this task?"
  }
}
```

**Spanish** (`locales/es/tasks.json`):
```json
{
  "title": "Mis Tareas",
  "empty_state": "¡No hay tareas aún. Añade una para comenzar!",
  "add_task": "Añadir Tarea",
  "edit_task": "Editar Tarea",
  "delete_task": "Eliminar Tarea",
  "complete_task": "Marcar como Completada",
  "uncomplete_task": "Marcar como Pendiente",
  "form": {
    "title_label": "Título",
    "title_placeholder": "¿Qué necesitas hacer?",
    "description_label": "Descripción",
    "description_placeholder": "Añade detalles...",
    "priority_label": "Prioridad",
    "due_date_label": "Fecha de Vencimiento",
    "tags_label": "Etiquetas",
    "tags_placeholder": "Añadir etiquetas..."
  },
  "filters": {
    "all": "Todas las Tareas",
    "pending": "Pendientes",
    "completed": "Completadas",
    "high_priority": "Alta Prioridad",
    "overdue": "Atrasadas"
  },
  "messages": {
    "task_created": "Tarea creada exitosamente",
    "task_updated": "Tarea actualizada exitosamente",
    "task_deleted": "Tarea eliminada exitosamente",
    "task_completed": "Tarea marcada como completada",
    "task_uncompleted": "Tarea marcada como pendiente",
    "delete_confirm": "¿Estás seguro de que quieres eliminar esta tarea?"
  }
}
```

---

### chat.json (AI Chatbot)

**English** (`locales/en/chat.json`):
```json
{
  "title": "AI Assistant",
  "input_placeholder": "Type your message...",
  "send": "Send",
  "thinking": "Thinking...",
  "typing": "AI is typing...",
  "welcome": {
    "greeting": "Hi! I'm your AI assistant. 👋",
    "description": "I can help you manage your tasks. Try asking me to:",
    "suggestions": [
      "Add a task",
      "Show my tasks",
      "Complete a task",
      "Delete completed tasks"
    ]
  },
  "errors": {
    "network_error": "Connection error. Please try again.",
    "server_error": "Something went wrong. Please try again later.",
    "rate_limit": "Too many requests. Please wait a moment."
  },
  "actions": {
    "retry": "Retry",
    "clear_chat": "Clear Chat",
    "export_chat": "Export Chat"
  }
}
```

**Spanish** (`locales/es/chat.json`):
```json
{
  "title": "Asistente IA",
  "input_placeholder": "Escribe tu mensaje...",
  "send": "Enviar",
  "thinking": "Pensando...",
  "typing": "La IA está escribiendo...",
  "welcome": {
    "greeting": "¡Hola! Soy tu asistente de IA. 👋",
    "description": "Puedo ayudarte a gestionar tus tareas. Intenta pedirme que:",
    "suggestions": [
      "Añada una tarea",
      "Muestre mis tareas",
      "Complete una tarea",
      "Elimine tareas completadas"
    ]
  },
  "errors": {
    "network_error": "Error de conexión. Por favor intenta de nuevo.",
    "server_error": "Algo salió mal. Por favor intenta más tarde.",
    "rate_limit": "Demasiadas solicitudes. Por favor espera un momento."
  },
  "actions": {
    "retry": "Reintentar",
    "clear_chat": "Limpiar Chat",
    "export_chat": "Exportar Chat"
  }
}
```

---

### settings.json (User Settings)

**English** (`locales/en/settings.json`):
```json
{
  "title": "Settings",
  "sections": {
    "profile": "Profile",
    "preferences": "Preferences",
    "language": "Language",
    "theme": "Theme",
    "notifications": "Notifications",
    "privacy": "Privacy",
    "account": "Account"
  },
  "profile": {
    "name": "Name",
    "email": "Email",
    "avatar": "Profile Picture",
    "change_password": "Change Password"
  },
  "language": {
    "title": "Language",
    "description": "Choose your preferred language",
    "auto_detect": "Auto-detect from browser"
  },
  "theme": {
    "title": "Theme",
    "light": "Light",
    "dark": "Dark",
    "system": "System Default"
  },
  "notifications": {
    "email_notifications": "Email Notifications",
    "task_reminders": "Task Reminders",
    "due_date_alerts": "Due Date Alerts"
  },
  "account": {
    "delete_account": "Delete Account",
    "delete_warning": "This action cannot be undone.",
    "logout": "Logout"
  },
  "messages": {
    "saved": "Settings saved successfully",
    "save_failed": "Failed to save settings"
  }
}
```

**Spanish** (`locales/es/settings.json`):
```json
{
  "title": "Configuración",
  "sections": {
    "profile": "Perfil",
    "preferences": "Preferencias",
    "language": "Idioma",
    "theme": "Tema",
    "notifications": "Notificaciones",
    "privacy": "Privacidad",
    "account": "Cuenta"
  },
  "profile": {
    "name": "Nombre",
    "email": "Correo electrónico",
    "avatar": "Foto de Perfil",
    "change_password": "Cambiar Contraseña"
  },
  "language": {
    "title": "Idioma",
    "description": "Elige tu idioma preferido",
    "auto_detect": "Detectar automáticamente del navegador"
  },
  "theme": {
    "title": "Tema",
    "light": "Claro",
    "dark": "Oscuro",
    "system": "Predeterminado del Sistema"
  },
  "notifications": {
    "email_notifications": "Notificaciones por Correo",
    "task_reminders": "Recordatorios de Tareas",
    "due_date_alerts": "Alertas de Fecha de Vencimiento"
  },
  "account": {
    "delete_account": "Eliminar Cuenta",
    "delete_warning": "Esta acción no se puede deshacer.",
    "logout": "Cerrar Sesión"
  },
  "messages": {
    "saved": "Configuración guardada exitosamente",
    "save_failed": "Error al guardar la configuración"
  }
}
```

---

### errors.json (Error Messages)

**English** (`locales/en/errors.json`):
```json
{
  "general": {
    "unknown": "An unexpected error occurred",
    "network": "Network connection error",
    "timeout": "Request timed out",
    "server": "Server error. Please try again later."
  },
  "auth": {
    "unauthorized": "Please log in to continue",
    "session_expired": "Your session has expired. Please log in again.",
    "invalid_credentials": "Invalid email or password",
    "email_taken": "Email is already registered"
  },
  "tasks": {
    "not_found": "Task not found",
    "delete_failed": "Failed to delete task",
    "update_failed": "Failed to update task",
    "create_failed": "Failed to create task"
  },
  "validation": {
    "required": "This field is required",
    "invalid_email": "Invalid email format",
    "min_length": "Must be at least {{count}} characters",
    "max_length": "Must be at most {{count}} characters"
  }
}
```

**Spanish** (`locales/es/errors.json`):
```json
{
  "general": {
    "unknown": "Ocurrió un error inesperado",
    "network": "Error de conexión de red",
    "timeout": "La solicitud ha excedido el tiempo de espera",
    "server": "Error del servidor. Por favor intenta más tarde."
  },
  "auth": {
    "unauthorized": "Por favor inicia sesión para continuar",
    "session_expired": "Tu sesión ha expirado. Por favor inicia sesión de nuevo.",
    "invalid_credentials": "Correo o contraseña inválidos",
    "email_taken": "El correo ya está registrado"
  },
  "tasks": {
    "not_found": "Tarea no encontrada",
    "delete_failed": "Error al eliminar la tarea",
    "update_failed": "Error al actualizar la tarea",
    "create_failed": "Error al crear la tarea"
  },
  "validation": {
    "required": "Este campo es obligatorio",
    "invalid_email": "Formato de correo inválido",
    "min_length": "Debe tener al menos {{count}} caracteres",
    "max_length": "Debe tener como máximo {{count}} caracteres"
  }
}
```

---

## Backend Response Templates

### Template Structure

```python
# backend/src/i18n/response_templates.py

RESPONSE_TEMPLATES = {
    "en": {
        "task_created": "Task created: {title} (ID: {task_id})",
        "task_updated": "Task updated: {title}",
        "task_completed": "Task completed: {title}",
        "task_deleted": "Task deleted successfully",
        "tasks_listed": "Found {count} task(s)",
        "no_tasks": "No tasks found",
    },
    "es": {
        "task_created": "Tarea creada: {title} (ID: {task_id})",
        "task_updated": "Tarea actualizada: {title}",
        "task_completed": "Tarea completada: {title}",
        "task_deleted": "Tarea eliminada exitosamente",
        "tasks_listed": "Se encontraron {count} tarea(s)",
        "no_tasks": "No se encontraron tareas",
    },
    "fr": {
        "task_created": "Tâche créée : {title} (ID : {task_id})",
        "task_updated": "Tâche mise à jour : {title}",
        "task_completed": "Tâche terminée : {title}",
        "task_deleted": "Tâche supprimée avec succès",
        "tasks_listed": "{count} tâche(s) trouvée(s)",
        "no_tasks": "Aucune tâche trouvée",
    },
    # ... more languages
}

def get_template(language: str, key: str, **params) -> str:
    """
    Get translated template
    
    Args:
        language: ISO 639-1 code
        key: Template key
        **params: Template parameters (title, task_id, count, etc.)
        
    Returns:
        Formatted template string
        
    Example:
        >>> get_template("es", "task_created", title="comprar leche", task_id=5)
        "Tarea creada: comprar leche (ID: 5)"
    """
    template = RESPONSE_TEMPLATES.get(language, {}).get(key)
    
    if not template:
        # Fallback to English
        template = RESPONSE_TEMPLATES["en"][key]
    
    return template.format(**params)
```

---

## Database Schema Updates

### User Model (Language Preference)

```python
class User(SQLModel, table=True):
    """User model with language preference"""
    
    id: int
    email: str
    name: str
    password_hash: str
    
    # Language preference
    preferred_language: str = Field(
        default="en",
        max_length=5,
        description="ISO 639-1 language code"
    )
    
    created_at: datetime
    updated_at: datetime
```

### Task Model (Content Language)

```python
class Task(SQLModel, table=True):
    """Task model with content language tracking"""
    
    id: int
    user_id: int
    
    # User content (original language)
    title: str
    description: Optional[str]
    
    # Metadata (English)
    status: str  # "pending", "completed"
    priority: str  # "low", "medium", "high"
    tags: List[str]
    
    # Language metadata
    content_language: str = Field(
        default="en",
        max_length=5,
        description="Language of title/description"
    )
    
    due_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime
```

---

## API Endpoints for Language

### Get Supported Languages

```http
GET /api/languages
```

**Response**:
```json
{
  "languages": [
    {
      "code": "en",
      "name": "English",
      "native_name": "English",
      "flag": "🇺🇸",
      "rtl": false,
      "coverage": 100
    },
    {
      "code": "es",
      "name": "Spanish",
      "native_name": "Español",
      "flag": "🇪🇸",
      "rtl": false,
      "coverage": 100
    }
  ]
}
```

### Update User Language Preference

```http
PATCH /api/user/preferences
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "preferred_language": "es"
}
```

**Response**:
```json
{
  "user": {
    "id": 123,
    "email": "user@example.com",
    "name": "John Doe",
    "preferred_language": "es"
  }
}
```

---

## RTL (Right-to-Left) Support

### RTL Languages

- Arabic (ar)
- Hebrew (he)
- Urdu (ur)

### CSS Implementation

```css
/* global.css */

/* Default (LTR) */
[dir="ltr"] {
  direction: ltr;
  text-align: left;
}

/* RTL Override */
[dir="rtl"] {
  direction: rtl;
  text-align: right;
}

/* Spacing */
[dir="rtl"] .task-item {
  padding-left: 0;
  padding-right: 1rem;
}

[dir="ltr"] .task-item {
  padding-left: 1rem;
  padding-right: 0;
}

/* Icons */
[dir="rtl"] .icon-arrow-right {
  transform: scaleX(-1);
}

/* Margins */
[dir="rtl"] .ml-2 {
  margin-right: 0.5rem;
  margin-left: 0;
}

[dir="rtl"] .mr-2 {
  margin-left: 0.5rem;
  margin-right: 0;
}
```

---

## Testing Strategy

### Unit Tests

```typescript
// __tests__/i18n.test.ts

describe('i18n', () => {
  it('should load English translations', () => {
    i18n.changeLanguage('en');
    expect(t('common:app_name')).toBe('Evolution of Todo');
  });
  
  it('should load Spanish translations', () => {
    i18n.changeLanguage('es');
    expect(t('common:app_name')).toBe('Evolución de Tareas');
  });
  
  it('should preserve user content language', () => {
    const task = { title: 'comprar leche', content_language: 'es' };
    // title should NOT be translated
    expect(task.title).toBe('comprar leche');
  });
});
```

### E2E Tests

```typescript
// e2e/multilingual.spec.ts

test('should switch language and update UI', async ({ page }) => {
  await page.goto('/tasks');
  
  // Default English
  await expect(page.locator('h1')).toHaveText('My Tasks');
  
  // Switch to Spanish
  await page.selectOption('select[name="language"]', 'es');
  
  // UI should update
  await expect(page.locator('h1')).toHaveText('Mis Tareas');
  
  // User content should NOT change
  const taskTitle = page.locator('.task-title').first();
  const originalTitle = await taskTitle.textContent();
  await page.selectOption('select[name="language"]', 'fr');
  expect(await taskTitle.textContent()).toBe(originalTitle);
});
```

---

## Validation Checklist

Before launching multilingual support:

- [ ] All 9 languages have 100% translation coverage for P0/P1 features
- [ ] Language detection works (browser + auto-detect + user preference)
- [ ] User content (task titles) are NEVER auto-translated
- [ ] System messages are properly translated
- [ ] RTL layout works for Arabic/Hebrew
- [ ] Language switcher updates UI immediately
- [ ] User language preference persists (database + localStorage)
- [ ] Translation fallback to English works
- [ ] Performance: translations load < 100ms
- [ ] E2E tests pass for all languages

---

## Revision History

| **Version** | **Date**       | **Changes**                                      |
|-------------|----------------|--------------------------------------------------|
| 1.0.0       | 2025-12-25     | Initial specification                            |

---

## References

- **Multilingual Handling Skill**: `.claude/skills/multilingual-handling/README.md`
- **Translation Middleware**: `middleware/translate.py`
- **Frontend UI Agent**: `.claude/agents/frontend-ui.md`
- **i18next Documentation**: https://www.i18next.com/
- **ISO 639-1 Codes**: https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes

---

**Status**: ✅ Specification Complete
**Next Steps**:
1. Implement translation files for all 9 languages
2. Create translation middleware in backend
3. Integrate i18next in Next.js frontend
4. Add RTL support in CSS
5. Test with native speakers for accuracy
