# Response Style Control Skill

**Skill Type**: AI Personality & Tone Configuration
**Version**: 1.0.0
**Created**: 2025-12-25
**Owner**: Spec Architect Agent

---

## Overview

The **Response Style Control** skill provides comprehensive design patterns for customizable AI chatbot personality and response tone in Phase III of the Evolution of Todo application. This skill enables users to personalize their AI assistant's communication style, making interactions feel more natural and tailored to individual preferences.

**Purpose**: Design and implement configurable response styles (tone + verbosity) that allow users to customize how the AI chatbot communicates, from friendly and casual to professional and concise.

**Output**:
- `specs/ai/response-styles.md` - Response style specification
- Response templates for each style combination
- User preference storage and application logic
- Style switching UI components

---

## Skill Components

### 1. Tone Dimensions
- **Friendly**: Warm, enthusiastic, uses emojis
- **Professional**: Formal, clear, business-appropriate
- **Casual**: Relaxed, conversational, informal
- **Sarcastic**: Witty, playful, humorous (advanced)

### 2. Verbosity Levels
- **Concise**: Short, direct responses (1 sentence)
- **Normal**: Balanced detail (2-3 sentences)
- **Verbose**: Detailed, explanatory responses

### 3. Style Combinations
- Matrix of tone × verbosity = 12 distinct styles
- User preference stored in profile
- Real-time style switching
- Context-aware style application

### 4. Response Templates
- Pre-formatted templates for common actions
- Dynamic template selection based on style
- Emoji and punctuation rules per style
- Confirmation patterns

---

## Style Matrix

### Tone × Verbosity Combinations

| **Tone** | **Concise** | **Normal** | **Verbose** |
|----------|-------------|------------|-------------|
| **Friendly** | "Milk added! ✅" | "Got it! 🥛 Milk added to your list!" | "Awesome! I've added 'Buy milk' to your task list. It's marked as high priority and due tomorrow. You're all set! ✨" |
| **Professional** | "Task created." | "Task created: Buy milk (Priority: HIGH)" | "Task has been successfully created. Title: 'Buy milk', Priority: HIGH, Due date: Tomorrow. The task is now in your pending list." |
| **Casual** | "Done! 👍" | "Milk? Done and done!" | "Alright, I've got you covered! Added 'Buy milk' to your list. It's set to high priority and due tomorrow, so you won't forget!" |
| **Sarcastic** | "Milk. Again. 🙄" | "Sure, another milk reminder. As if you'd forget! 😏" | "Oh, absolutely! Let me add 'Buy milk' to your ever-growing list of very important tasks. High priority, no less! Because clearly, milk is life-or-death. 🥛✨" |

---

## Tone Specifications

### Friendly Tone

**Characteristics**:
- Warm, enthusiastic language
- Frequent use of emojis (✅ ✨ 🎉 ❤️ 👍)
- Exclamation marks
- Encouraging phrases ("Great job!", "You got this!")
- Personal touch ("your tasks", "you're all set")

**Example Responses**:
```
Task Created: "Got it! 🥛 Milk added to your HIGH priority list! ✨"
Task Completed: "Yay! 🎉 Milk is complete! Great work!"
Task Listed: "Here are your tasks! 📝 You have 3 items on your list:"
Error: "Oops! 😅 I couldn't find that task. Want to try again?"
```

**Voice Characteristics**: Supportive friend, cheerleader

---

### Professional Tone

**Characteristics**:
- Formal, business-appropriate language
- No emojis or minimal use
- Complete sentences
- Technical details included (IDs, timestamps)
- Clear, unambiguous phrasing

**Example Responses**:
```
Task Created: "Task created: Buy milk (Priority: HIGH, Due: Tomorrow)"
Task Completed: "Task 'Buy milk' marked as completed."
Task Listed: "You have 3 pending tasks. Details: Buy milk (High), Call dentist (Medium), Finish report (High)."
Error: "Task not found. Please verify the task ID or title."
```

**Voice Characteristics**: Executive assistant, business consultant

---

### Casual Tone

**Characteristics**:
- Relaxed, conversational language
- Moderate emoji use (😊 👍 ✌️)
- Contractions ("you're", "I've")
- Informal phrasing ("got it", "all set")
- Friendly but not overly enthusiastic

**Example Responses**:
```
Task Created: "Milk? Done and done! 👍"
Task Completed: "Nice! Milk is checked off. ✌️"
Task Listed: "You've got 3 tasks on your plate right now."
Error: "Hmm, couldn't find that one. Try another?"
```

**Voice Characteristics**: Helpful colleague, friend

---

### Sarcastic Tone (Advanced)

**Characteristics**:
- Witty, playful language
- Subtle humor and irony
- Strategic emoji use (😏 🙄 😅)
- Exaggeration for comedic effect
- Still helpful, just amusing

**Example Responses**:
```
Task Created: "Sure, another milk reminder. As if you'd forget! 😏"
Task Completed: "Milk is done. Shocking, I know. 🙄"
Task Listed: "Let me read your thrilling to-do list: 3 life-changing tasks await."
Error: "Task not found. Did you imagine it? 😅"
```

**Voice Characteristics**: Sassy assistant, witty friend

**⚠️ Warning**: Use with caution. Not appropriate for all users or contexts.

---

## Verbosity Levels

### Concise (1 sentence)

**Characteristics**:
- Maximum brevity
- Essential information only
- No elaboration
- Perfect for power users

**Examples**:
```
Friendly: "Milk added! ✅"
Professional: "Task created."
Casual: "Done! 👍"
Sarcastic: "Milk. Again. 🙄"
```

---

### Normal (2-3 sentences)

**Characteristics**:
- Balanced detail
- Key information included
- Natural conversation flow
- Default for most users

**Examples**:
```
Friendly: "Got it! 🥛 Milk added to your list!"
Professional: "Task created: Buy milk (Priority: HIGH, Due: Tomorrow)"
Casual: "Milk? Done and done! Set to high priority."
Sarcastic: "Sure, another milk reminder. As if you'd forget! 😏"
```

---

### Verbose (3+ sentences)

**Characteristics**:
- Detailed explanations
- Context and next steps
- Educational tone
- Best for beginners

**Examples**:
```
Friendly: "Awesome! I've added 'Buy milk' to your task list. It's marked as high priority and due tomorrow. You're all set! ✨"

Professional: "Task has been successfully created. Title: 'Buy milk', Priority: HIGH, Due date: Tomorrow. The task is now in your pending list and will appear in priority-sorted order."

Casual: "Alright, I've got you covered! Added 'Buy milk' to your list. It's set to high priority and due tomorrow, so you won't forget!"

Sarcastic: "Oh, absolutely! Let me add 'Buy milk' to your ever-growing list of very important tasks. High priority, no less! Because clearly, milk is life-or-death. 🥛✨"
```

---

## Response Templates

### Template Structure

```typescript
interface ResponseTemplate {
  action: string;
  tone: 'friendly' | 'professional' | 'casual' | 'sarcastic';
  verbosity: 'concise' | 'normal' | 'verbose';
  template: string;
  params: string[];
}
```

### Task Created Templates

**Friendly**:
```typescript
{
  concise: "{title} added! ✅",
  normal: "Got it! {emoji} {title} added to your {priority} priority list!",
  verbose: "Awesome! I've added '{title}' to your task list. It's marked as {priority} priority{due_date_phrase}. You're all set! ✨"
}
```

**Professional**:
```typescript
{
  concise: "Task created.",
  normal: "Task created: {title} (Priority: {priority}{due_date_phrase})",
  verbose: "Task has been successfully created. Title: '{title}', Priority: {priority}{due_date_phrase}. The task is now in your pending list."
}
```

**Casual**:
```typescript
{
  concise: "Done! 👍",
  normal: "{title}? Done and done!",
  verbose: "Alright, I've got you covered! Added '{title}' to your list. It's set to {priority} priority{due_date_phrase}!"
}
```

**Sarcastic**:
```typescript
{
  concise: "{title}. Again. 🙄",
  normal: "Sure, another {title} reminder. As if you'd forget! 😏",
  verbose: "Oh, absolutely! Let me add '{title}' to your ever-growing list of very important tasks. {priority} priority, no less! Because clearly, this is life-or-death. ✨"
}
```

---

### Task Completed Templates

**Friendly**:
```typescript
{
  concise: "Done! 🎉",
  normal: "Yay! 🎉 {title} is complete! Great work!",
  verbose: "Fantastic! You've completed '{title}'! That's one less thing on your plate. Keep up the great work! 💪"
}
```

**Professional**:
```typescript
{
  concise: "Task completed.",
  normal: "Task '{title}' marked as completed.",
  verbose: "The task '{title}' has been successfully marked as completed and moved to your completed tasks list."
}
```

**Casual**:
```typescript
{
  concise: "Nice! ✌️",
  normal: "Nice! {title} is checked off. ✌️",
  verbose: "Sweet! You knocked out '{title}'. One down, keep the momentum going!"
}
```

**Sarcastic**:
```typescript
{
  concise: "Finally. 😏",
  normal: "{title} is done. Shocking, I know. 🙄",
  verbose: "Well, well! You actually completed '{title}'. I'm impressed. And only slightly surprised. 😅"
}
```

---

### Task List Templates

**Friendly**:
```typescript
{
  concise: "{count} tasks! 📝",
  normal: "Here are your tasks! 📝 You have {count} items:",
  verbose: "Let me show you your task list! 📋 You currently have {count} tasks. Here's what's on your plate:"
}
```

**Professional**:
```typescript
{
  concise: "{count} pending tasks.",
  normal: "You have {count} pending tasks. Details:",
  verbose: "Your task list contains {count} pending items. The following tasks are organized by priority:"
}
```

**Casual**:
```typescript
{
  concise: "{count} tasks. 👀",
  normal: "You've got {count} tasks on your plate.",
  verbose: "Alright, let's see what you're working with. You've got {count} tasks right now. Here's the rundown:"
}
```

**Sarcastic**:
```typescript
{
  concise: "{count} tasks. Thrilling. 📋",
  normal: "Let me read your thrilling to-do list: {count} tasks await.",
  verbose: "Brace yourself! You have a whopping {count} tasks. I know, try to contain your excitement. Let's dive into this fascinating list:"
}
```

---

### Error Templates

**Friendly**:
```typescript
{
  concise: "Oops! Not found. 😅",
  normal: "Oops! 😅 I couldn't find that task. Want to try again?",
  verbose: "Oh no! I searched everywhere but couldn't find that task. Maybe there's a typo? Feel free to try again or ask me to list your tasks! 🔍"
}
```

**Professional**:
```typescript
{
  concise: "Task not found.",
  normal: "Task not found. Please verify the task ID or title.",
  verbose: "The requested task could not be found in your task list. Please verify that the task ID or title is correct and try again."
}
```

**Casual**:
```typescript
{
  concise: "Not found. 🤷",
  normal: "Hmm, couldn't find that one. Try another?",
  verbose: "Hmm, I'm not seeing that task in your list. Maybe check the name or ID? Or just ask me to show all your tasks."
}
```

**Sarcastic**:
```typescript
{
  concise: "Imaginary task? 🙄",
  normal: "Task not found. Did you imagine it? 😅",
  verbose: "Interesting! The task you're looking for seems to have vanished into thin air. Either it never existed, or it's hiding really well. Want to try again? 🕵️"
}
```

---

## User Preference Storage

### Database Schema

```python
class User(SQLModel, table=True):
    id: int
    email: str
    name: str
    
    # Response style preferences
    response_tone: str = Field(
        default="friendly",
        description="friendly, professional, casual, sarcastic"
    )
    response_verbosity: str = Field(
        default="normal",
        description="concise, normal, verbose"
    )
    
    created_at: datetime
    updated_at: datetime
```

### API Endpoint

```http
PATCH /api/user/preferences
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "response_tone": "casual",
  "response_verbosity": "concise"
}
```

**Response**:
```json
{
  "user": {
    "id": 123,
    "response_tone": "casual",
    "response_verbosity": "concise"
  }
}
```

---

## Style Selection Logic

### Formatting Function

```typescript
interface StyleConfig {
  tone: 'friendly' | 'professional' | 'casual' | 'sarcastic';
  verbosity: 'concise' | 'normal' | 'verbose';
}

class ResponseStyleFormatter {
  private templates: Record<string, any>;
  
  format(
    action: string,
    params: Record<string, any>,
    style: StyleConfig
  ): string {
    // Get template for action + style
    const actionTemplates = this.templates[action];
    if (!actionTemplates) {
      return this.defaultResponse(action, params);
    }
    
    const toneTemplates = actionTemplates[style.tone];
    if (!toneTemplates) {
      return this.defaultResponse(action, params);
    }
    
    const template = toneTemplates[style.verbosity];
    if (!template) {
      return this.defaultResponse(action, params);
    }
    
    // Fill template with parameters
    return this.fillTemplate(template, params);
  }
  
  private fillTemplate(template: string, params: Record<string, any>): string {
    let result = template;
    
    for (const [key, value] of Object.entries(params)) {
      const placeholder = `{${key}}`;
      result = result.replace(new RegExp(placeholder, 'g'), String(value));
    }
    
    // Handle conditional phrases
    result = this.handleConditionals(result, params);
    
    return result;
  }
  
  private handleConditionals(template: string, params: Record<string, any>): string {
    // Example: {due_date_phrase} → ", due tomorrow" or ""
    if (params.due_date) {
      template = template.replace(
        '{due_date_phrase}',
        `, due ${this.formatDate(params.due_date)}`
      );
    } else {
      template = template.replace('{due_date_phrase}', '');
    }
    
    // Add emoji based on priority
    if (params.priority === 'high') {
      template = template.replace('{emoji}', '🔥');
    } else if (params.priority === 'medium') {
      template = template.replace('{emoji}', '📌');
    } else {
      template = template.replace('{emoji}', '📝');
    }
    
    return template;
  }
  
  private formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'tomorrow';
    } else {
      return date.toLocaleDateString();
    }
  }
  
  private defaultResponse(action: string, params: Record<string, any>): string {
    // Fallback response
    return `Action completed: ${action}`;
  }
}
```

---

## UI Components

### Style Settings Component

```tsx
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface StyleSettingsProps {
  currentTone: string;
  currentVerbosity: string;
  onStyleChange: (tone: string, verbosity: string) => void;
}

export function StyleSettings({
  currentTone,
  currentVerbosity,
  onStyleChange
}: StyleSettingsProps) {
  const { t } = useTranslation('settings');
  const [tone, setTone] = useState(currentTone);
  const [verbosity, setVerbosity] = useState(currentVerbosity);
  
  const tones = [
    { value: 'friendly', label: t('tone.friendly'), icon: '😊', description: 'Warm and enthusiastic' },
    { value: 'professional', label: t('tone.professional'), icon: '💼', description: 'Formal and clear' },
    { value: 'casual', label: t('tone.casual'), icon: '😎', description: 'Relaxed and conversational' },
    { value: 'sarcastic', label: t('tone.sarcastic'), icon: '😏', description: 'Witty and playful' }
  ];
  
  const verbosityLevels = [
    { value: 'concise', label: t('verbosity.concise'), description: 'Short and direct' },
    { value: 'normal', label: t('verbosity.normal'), description: 'Balanced detail' },
    { value: 'verbose', label: t('verbosity.verbose'), description: 'Detailed explanations' }
  ];
  
  const handleSave = async () => {
    await onStyleChange(tone, verbosity);
  };
  
  return (
    <div className="style-settings">
      <h2>{t('response_style.title')}</h2>
      
      {/* Tone Selection */}
      <div className="setting-group">
        <label>{t('response_style.tone_label')}</label>
        <div className="tone-options">
          {tones.map(option => (
            <button
              key={option.value}
              className={`tone-option ${tone === option.value ? 'selected' : ''}`}
              onClick={() => setTone(option.value)}
            >
              <span className="icon">{option.icon}</span>
              <span className="label">{option.label}</span>
              <span className="description">{option.description}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Verbosity Selection */}
      <div className="setting-group">
        <label>{t('response_style.verbosity_label')}</label>
        <div className="verbosity-slider">
          {verbosityLevels.map(level => (
            <button
              key={level.value}
              className={`verbosity-option ${verbosity === level.value ? 'selected' : ''}`}
              onClick={() => setVerbosity(level.value)}
            >
              <span className="label">{level.label}</span>
              <span className="description">{level.description}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Preview */}
      <div className="style-preview">
        <h3>{t('response_style.preview')}</h3>
        <StylePreview tone={tone} verbosity={verbosity} />
      </div>
      
      {/* Save Button */}
      <button onClick={handleSave} className="btn-primary">
        {t('common:buttons.save')}
      </button>
    </div>
  );
}
```

### Style Preview Component

```tsx
function StylePreview({ tone, verbosity }: { tone: string; verbosity: string }) {
  const examples = {
    task_created: {
      friendly: {
        concise: "Milk added! ✅",
        normal: "Got it! 🥛 Milk added to your list!",
        verbose: "Awesome! I've added 'Buy milk' to your task list. It's marked as high priority. You're all set! ✨"
      },
      professional: {
        concise: "Task created.",
        normal: "Task created: Buy milk (Priority: HIGH)",
        verbose: "Task has been successfully created. Title: 'Buy milk', Priority: HIGH. The task is now in your pending list."
      },
      casual: {
        concise: "Done! 👍",
        normal: "Milk? Done and done!",
        verbose: "Alright, I've got you covered! Added 'Buy milk' to your list with high priority!"
      },
      sarcastic: {
        concise: "Milk. Again. 🙄",
        normal: "Sure, another milk reminder. As if you'd forget! 😏",
        verbose: "Oh, absolutely! Let me add 'Buy milk' to your ever-growing list of very important tasks. High priority, no less!"
      }
    }
  };
  
  const preview = examples.task_created[tone]?.[verbosity] || "Preview not available";
  
  return (
    <div className="preview-bubble">
      <div className="preview-message assistant-message">
        {preview}
      </div>
    </div>
  );
}
```

---

## Context-Aware Style Application

### Automatic Style Adjustment

Some contexts may override user preferences for clarity:

```typescript
function getEffectiveStyle(
  userStyle: StyleConfig,
  context: string
): StyleConfig {
  // Critical errors: always professional + normal
  if (context === 'critical_error') {
    return { tone: 'professional', verbosity: 'normal' };
  }
  
  // Security warnings: always professional
  if (context === 'security_warning') {
    return { tone: 'professional', verbosity: userStyle.verbosity };
  }
  
  // First-time user: friendly + verbose
  if (context === 'onboarding') {
    return { tone: 'friendly', verbosity: 'verbose' };
  }
  
  // Voice responses: always concise
  if (context === 'voice_response') {
    return { tone: userStyle.tone, verbosity: 'concise' };
  }
  
  // Default: use user preference
  return userStyle;
}
```

---

## Testing Strategy

### Unit Tests

```typescript
describe('ResponseStyleFormatter', () => {
  const formatter = new ResponseStyleFormatter();
  
  it('should format friendly + concise correctly', () => {
    const result = formatter.format(
      'task_created',
      { title: 'Buy milk', priority: 'high' },
      { tone: 'friendly', verbosity: 'concise' }
    );
    expect(result).toBe('Buy milk added! ✅');
  });
  
  it('should format professional + verbose correctly', () => {
    const result = formatter.format(
      'task_created',
      { title: 'Buy milk', priority: 'high', due_date: '2025-12-26' },
      { tone: 'professional', verbosity: 'verbose' }
    );
    expect(result).toContain('successfully created');
    expect(result).toContain('Buy milk');
    expect(result).toContain('HIGH');
  });
});
```

### A/B Testing

Monitor user engagement by style:
- Response satisfaction ratings
- Feature usage frequency
- Session duration
- User retention

---

## Related Agents

- **AI Chatbot Agent** (`.claude/agents/ai-chatbot.md`): Implements response formatting
- **Frontend UI Agent** (`.claude/agents/frontend-ui.md`): Implements style settings UI
- **Spec Architect Agent** (`.claude/agents/spec-architect.md`): Designs response style architecture

---

## Skill Invocation

**For Response Style Design**:
```
Act as Spec Architect Agent and design response style control for the chatbot
```

**For Implementation**:
```
Act as AI Chatbot Agent and implement response style formatting
```

---

## Success Metrics

A well-designed response style system has:
- ✅ 4 distinct tones (friendly, professional, casual, sarcastic)
- ✅ 3 verbosity levels (concise, normal, verbose)
- ✅ 12 total style combinations
- ✅ User preference persistence
- ✅ Real-time style switching
- ✅ Context-aware overrides
- ✅ Consistent voice per style
- ✅ Template coverage for all actions

---

## Revision History

| **Version** | **Date**       | **Changes**                                      |
|-------------|----------------|--------------------------------------------------|
| 1.0.0       | 2025-12-25     | Initial skill documentation                      |

---

## References

- **Constitution**: `.specify/memory/constitution.md` (Principle X: User Experience)
- **AI Chatbot Agent**: `.claude/agents/ai-chatbot.md`
- **Response Styles Specification**: `specs/ai/response-styles.md`

---

**Status**: Ready for Phase III implementation
**Activation**: See skill invocation section above
