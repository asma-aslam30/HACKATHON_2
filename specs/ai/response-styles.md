# Response Styles Specification

**Version**: 1.0.0
**Phase**: III (AI Chatbot with Personality)
**Last Updated**: 2025-12-25
**Owner**: Spec Architect Agent

---

## Overview

This specification defines the response style system for the Evolution of Todo AI chatbot, enabling users to customize the tone and verbosity of AI responses to match their personal preferences and use cases.

**Goal**: Provide 12 distinct response styles (4 tones × 3 verbosity levels) with consistent personality and user preference persistence.

---

## Style Dimensions

### Dimension 1: Tone

| **Tone** | **Description** | **Use Case** | **Emoji Usage** |
|----------|----------------|--------------|-----------------|
| **Friendly** | Warm, enthusiastic, supportive | Personal productivity, beginners | High (✅ ✨ 🎉 ❤️) |
| **Professional** | Formal, clear, business-appropriate | Work tasks, executive users | Minimal |
| **Casual** | Relaxed, conversational, informal | Everyday tasks, tech-savvy users | Moderate (😊 👍 ✌️) |
| **Sarcastic** | Witty, playful, humorous | Entertainment, adventurous users | Strategic (😏 🙄 😅) |

### Dimension 2: Verbosity

| **Level** | **Length** | **Detail** | **Use Case** |
|-----------|------------|------------|--------------|
| **Concise** | 1 sentence | Essential only | Power users, voice |
| **Normal** | 2-3 sentences | Balanced | Default, most users |
| **Verbose** | 3+ sentences | Explanatory | Beginners, learning |

---

## Complete Style Matrix

### Task Created Responses

| **Tone** | **Concise** | **Normal** | **Verbose** |
|----------|-------------|------------|-------------|
| **Friendly** | "Milk added! ✅" | "Got it! 🥛 Milk added to your list!" | "Awesome! I've added 'Buy milk' to your task list. It's marked as high priority and due tomorrow. You're all set! ✨" |
| **Professional** | "Task created." | "Task created: Buy milk (Priority: HIGH, Due: Tomorrow)" | "Task has been successfully created. Title: 'Buy milk', Priority: HIGH, Due date: Tomorrow. The task is now in your pending list." |
| **Casual** | "Done! 👍" | "Milk? Done and done!" | "Alright, I've got you covered! Added 'Buy milk' to your list. It's set to high priority and due tomorrow!" |
| **Sarcastic** | "Milk. Again. 🙄" | "Sure, another milk reminder. As if you'd forget! 😏" | "Oh, absolutely! Let me add 'Buy milk' to your ever-growing list of very important tasks. High priority, no less! ✨" |

---

### Task Completed Responses

| **Tone** | **Concise** | **Normal** | **Verbose** |
|----------|-------------|------------|-------------|
| **Friendly** | "Done! 🎉" | "Yay! 🎉 Milk is complete! Great work!" | "Fantastic! You've completed 'Buy milk'! That's one less thing on your plate. Keep up the great work! 💪" |
| **Professional** | "Task completed." | "Task 'Buy milk' marked as completed." | "The task 'Buy milk' has been successfully marked as completed and moved to your completed tasks list." |
| **Casual** | "Nice! ✌️" | "Nice! Milk is checked off. ✌️" | "Sweet! You knocked out 'Buy milk'. One down, keep the momentum going!" |
| **Sarcastic** | "Finally. 😏" | "Milk is done. Shocking, I know. 🙄" | "Well, well! You actually completed 'Buy milk'. I'm impressed. And only slightly surprised. 😅" |

---

### Task List Responses

| **Tone** | **Concise** | **Normal** | **Verbose** |
|----------|-------------|------------|-------------|
| **Friendly** | "3 tasks! 📝" | "Here are your tasks! 📝 You have 3 items:" | "Let me show you your task list! 📋 You currently have 3 tasks. Here's what's on your plate:" |
| **Professional** | "3 pending tasks." | "You have 3 pending tasks. Details:" | "Your task list contains 3 pending items. The following tasks are organized by priority:" |
| **Casual** | "3 tasks. 👀" | "You've got 3 tasks on your plate." | "Alright, let's see what you're working with. You've got 3 tasks right now. Here's the rundown:" |
| **Sarcastic** | "3 tasks. Thrilling. 📋" | "Let me read your thrilling to-do list: 3 tasks await." | "Brace yourself! You have a whopping 3 tasks. I know, try to contain your excitement. Let's dive in:" |

---

### Error Responses

| **Tone** | **Concise** | **Normal** | **Verbose** |
|----------|-------------|------------|-------------|
| **Friendly** | "Oops! Not found. 😅" | "Oops! 😅 I couldn't find that task. Want to try again?" | "Oh no! I searched everywhere but couldn't find that task. Maybe there's a typo? Feel free to try again! 🔍" |
| **Professional** | "Task not found." | "Task not found. Please verify the task ID or title." | "The requested task could not be found in your task list. Please verify that the task ID or title is correct." |
| **Casual** | "Not found. 🤷" | "Hmm, couldn't find that one. Try another?" | "Hmm, I'm not seeing that task in your list. Maybe check the name? Or ask me to show all tasks." |
| **Sarcastic** | "Imaginary task? 🙄" | "Task not found. Did you imagine it? 😅" | "Interesting! The task seems to have vanished. Either it never existed, or it's hiding. Want to try again? 🕵️" |

---

## Template System

### Template Structure

```json
{
  "task_created": {
    "friendly": {
      "concise": "{title} added! ✅",
      "normal": "Got it! {emoji} {title} added to your {priority} priority list!",
      "verbose": "Awesome! I've added '{title}' to your task list. It's marked as {priority} priority{due_date_phrase}. You're all set! ✨"
    },
    "professional": {
      "concise": "Task created.",
      "normal": "Task created: {title} (Priority: {priority_upper}{due_date_phrase})",
      "verbose": "Task has been successfully created. Title: '{title}', Priority: {priority_upper}{due_date_phrase}. The task is now in your pending list."
    },
    "casual": {
      "concise": "Done! 👍",
      "normal": "{title}? Done and done!",
      "verbose": "Alright, I've got you covered! Added '{title}' to your list. It's set to {priority} priority{due_date_phrase}!"
    },
    "sarcastic": {
      "concise": "{title}. Again. 🙄",
      "normal": "Sure, another {title} reminder. As if you'd forget! 😏",
      "verbose": "Oh, absolutely! Let me add '{title}' to your ever-growing list of very important tasks. {priority} priority, no less! ✨"
    }
  }
}
```

### Template Parameters

| **Parameter** | **Type** | **Example** | **Description** |
|---------------|----------|-------------|-----------------|
| `{title}` | string | "Buy milk" | Task title (user's original text) |
| `{priority}` | string | "high" | Lowercase priority |
| `{priority_upper}` | string | "HIGH" | Uppercase priority (professional) |
| `{count}` | number | 3 | Number of tasks |
| `{emoji}` | string | "🔥" | Priority-based emoji |
| `{due_date_phrase}` | string | ", due tomorrow" | Conditional due date phrase |

### Conditional Logic

**Due Date Phrase**:
```typescript
function getDueDatePhrase(dueDate: string | null, style: StyleConfig): string {
  if (!dueDate) return '';
  
  const date = new Date(dueDate);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  let phrase = '';
  
  if (date.toDateString() === today.toDateString()) {
    phrase = 'today';
  } else if (date.toDateString() === tomorrow.toDateString()) {
    phrase = 'tomorrow';
  } else {
    phrase = date.toLocaleDateString();
  }
  
  // Format based on tone
  if (style.tone === 'professional') {
    return `, Due: ${phrase}`;
  } else if (style.verbosity === 'concise') {
    return '';  // Omit in concise mode
  } else {
    return ` and due ${phrase}`;
  }
}
```

**Priority Emoji**:
```typescript
function getPriorityEmoji(priority: string): string {
  const emojiMap = {
    high: '🔥',
    medium: '📌',
    low: '📝'
  };
  return emojiMap[priority] || '📝';
}
```

---

## Implementation

### ResponseStyleFormatter Class

```typescript
export class ResponseStyleFormatter {
  private templates: Record<string, any>;
  
  constructor() {
    this.templates = this.loadTemplates();
  }
  
  format(
    action: string,
    params: Record<string, any>,
    style: StyleConfig
  ): string {
    const template = this.getTemplate(action, style);
    if (!template) {
      return this.fallback(action, params);
    }
    
    return this.fillTemplate(template, params, style);
  }
  
  private getTemplate(action: string, style: StyleConfig): string | null {
    return this.templates[action]?.[style.tone]?.[style.verbosity];
  }
  
  private fillTemplate(
    template: string,
    params: Record<string, any>,
    style: StyleConfig
  ): string {
    let result = template;
    
    // Replace simple parameters
    for (const [key, value] of Object.entries(params)) {
      if (typeof value === 'string' || typeof value === 'number') {
        result = result.replace(
          new RegExp(`\\{${key}\\}`, 'g'),
          String(value)
        );
      }
    }
    
    // Handle conditional parameters
    result = result.replace(
      '{emoji}',
      this.getPriorityEmoji(params.priority)
    );
    
    result = result.replace(
      '{due_date_phrase}',
      this.getDueDatePhrase(params.due_date, style)
    );
    
    result = result.replace(
      '{priority_upper}',
      params.priority?.toUpperCase() || ''
    );
    
    return result;
  }
  
  private getPriorityEmoji(priority: string): string {
    const map: Record<string, string> = {
      high: '🔥',
      medium: '📌',
      low: '📝'
    };
    return map[priority] || '📝';
  }
  
  private getDueDatePhrase(dueDate: string | null, style: StyleConfig): string {
    if (!dueDate) return '';
    
    const date = new Date(dueDate);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    let phrase = '';
    
    if (date.toDateString() === today.toDateString()) {
      phrase = 'today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      phrase = 'tomorrow';
    } else {
      phrase = date.toLocaleDateString();
    }
    
    if (style.tone === 'professional') {
      return `, Due: ${phrase}`;
    } else if (style.verbosity === 'concise') {
      return '';
    } else {
      return ` and due ${phrase}`;
    }
  }
  
  private fallback(action: string, params: Record<string, any>): string {
    return `Action completed: ${action}`;
  }
}
```

---

### Usage in Chatbot

```typescript
// In AI Chatbot Agent

import { ResponseStyleFormatter } from './ResponseStyleFormatter';

async function handleUserMessage(
  message: string,
  userContext: { userId: number; style: StyleConfig }
) {
  const formatter = new ResponseStyleFormatter();
  
  // Process message
  const intent = classifyIntent(message);
  const result = await executeIntent(intent);
  
  // Format response based on user's style
  const response = formatter.format(
    intent.action,
    result,
    userContext.style
  );
  
  return response;
}
```

---

## User Preference Management

### Database Schema Update

```sql
ALTER TABLE users
ADD COLUMN response_tone VARCHAR(20) DEFAULT 'friendly',
ADD COLUMN response_verbosity VARCHAR(10) DEFAULT 'normal';

-- Add check constraints
ALTER TABLE users
ADD CONSTRAINT check_tone 
  CHECK (response_tone IN ('friendly', 'professional', 'casual', 'sarcastic'));

ALTER TABLE users
ADD CONSTRAINT check_verbosity
  CHECK (response_verbosity IN ('concise', 'normal', 'verbose'));
```

### API Endpoints

**Get User Preferences**:
```http
GET /api/user/preferences
Authorization: Bearer <jwt>
```

Response:
```json
{
  "response_tone": "casual",
  "response_verbosity": "concise",
  "other_preferences": { }
}
```

**Update Preferences**:
```http
PATCH /api/user/preferences
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "response_tone": "professional",
  "response_verbosity": "normal"
}
```

Response:
```json
{
  "success": true,
  "preferences": {
    "response_tone": "professional",
    "response_verbosity": "normal"
  }
}
```

---

## Context-Aware Overrides

Some contexts override user preferences for clarity and safety:

```typescript
function getEffectiveStyle(
  userStyle: StyleConfig,
  context: ResponseContext
): StyleConfig {
  // Critical errors: always professional + normal
  if (context.type === 'error' && context.severity === 'critical') {
    return { tone: 'professional', verbosity: 'normal' };
  }
  
  // Security warnings: always professional
  if (context.type === 'security_warning') {
    return { tone: 'professional', verbosity: userStyle.verbosity };
  }
  
  // Onboarding: friendly + verbose
  if (context.isFirstTime) {
    return { tone: 'friendly', verbosity: 'verbose' };
  }
  
  // Voice responses: always concise
  if (context.channel === 'voice') {
    return { tone: userStyle.tone, verbosity: 'concise' };
  }
  
  // Default: user preference
  return userStyle;
}
```

---

## UI Implementation

### Settings Page

```tsx
<div className="response-style-settings">
  <h2>Response Style</h2>
  <p>Customize how your AI assistant communicates with you.</p>
  
  {/* Tone Selection */}
  <div className="tone-selector">
    <h3>Tone</h3>
    <div className="tone-grid">
      <ToneOption 
        value="friendly" 
        icon="😊" 
        label="Friendly"
        description="Warm and enthusiastic"
        selected={tone === 'friendly'}
        onClick={() => setTone('friendly')}
      />
      <ToneOption 
        value="professional" 
        icon="💼" 
        label="Professional"
        description="Formal and clear"
        selected={tone === 'professional'}
        onClick={() => setTone('professional')}
      />
      <ToneOption 
        value="casual" 
        icon="😎" 
        label="Casual"
        description="Relaxed and conversational"
        selected={tone === 'casual'}
        onClick={() => setTone('casual')}
      />
      <ToneOption 
        value="sarcastic" 
        icon="😏" 
        label="Sarcastic"
        description="Witty and playful"
        selected={tone === 'sarcastic'}
        onClick={() => setTone('sarcastic')}
      />
    </div>
  </div>
  
  {/* Verbosity Slider */}
  <div className="verbosity-selector">
    <h3>Verbosity</h3>
    <div className="verbosity-slider">
      <button 
        className={verbosity === 'concise' ? 'active' : ''}
        onClick={() => setVerbosity('concise')}
      >
        Concise
      </button>
      <button 
        className={verbosity === 'normal' ? 'active' : ''}
        onClick={() => setVerbosity('normal')}
      >
        Normal
      </button>
      <button 
        className={verbosity === 'verbose' ? 'active' : ''}
        onClick={() => setVerbosity('verbose')}
      >
        Verbose
      </button>
    </div>
  </div>
  
  {/* Preview */}
  <div className="style-preview">
    <h3>Preview</h3>
    <div className="preview-messages">
      <div className="user-message">Add buy milk</div>
      <div className="assistant-message">
        {getPreviewResponse(tone, verbosity)}
      </div>
    </div>
  </div>
  
  <button onClick={handleSave}>Save Changes</button>
</div>
```

---

## Testing Strategy

### Unit Tests

```typescript
describe('ResponseStyleFormatter', () => {
  const formatter = new ResponseStyleFormatter();
  
  test.each([
    ['friendly', 'concise', 'Milk added! ✅'],
    ['professional', 'normal', 'Task created: Buy milk (Priority: HIGH)'],
    ['casual', 'verbose', /Alright, I've got you covered!/],
    ['sarcastic', 'concise', 'Milk. Again. 🙄']
  ])('formats %s + %s correctly', (tone, verbosity, expected) => {
    const result = formatter.format(
      'task_created',
      { title: 'Buy milk', priority: 'high' },
      { tone, verbosity }
    );
    
    if (typeof expected === 'string') {
      expect(result).toBe(expected);
    } else {
      expect(result).toMatch(expected);
    }
  });
});
```

### User Testing

Monitor metrics by style:
- User satisfaction ratings
- Style preference distribution
- Switch frequency
- Engagement levels

---

## Validation Checklist

Before launching response styles:

- [ ] All 12 style combinations have templates
- [ ] Templates cover all major actions (create, complete, list, delete, error)
- [ ] User preferences persist in database
- [ ] API endpoints for preference management
- [ ] UI for style selection with preview
- [ ] Context-aware overrides work
- [ ] Voice responses always use concise
- [ ] Critical errors always use professional
- [ ] Unit tests for all formatters
- [ ] User testing with diverse personas

---

## Revision History

| **Version** | **Date**       | **Changes**                                      |
|-------------|----------------|--------------------------------------------------|
| 1.0.0       | 2025-12-25     | Initial specification                            |

---

## References

- **Response Style Control Skill**: `.claude/skills/response-style-control/README.md`
- **AI Chatbot Agent**: `.claude/agents/ai-chatbot.md`
- **Frontend UI Agent**: `.claude/agents/frontend-ui.md`

---

**Status**: ✅ Specification Complete
**Next Steps**:
1. Implement ResponseStyleFormatter class
2. Create response templates JSON
3. Update User model with style preferences
4. Build style settings UI
5. Test all 12 style combinations
6. Deploy to Phase III environment
