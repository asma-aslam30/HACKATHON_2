# Voice Interaction Specification

**Version**: 1.0.0
**Phase**: III (AI Chatbot with Voice)
**Last Updated**: 2025-12-25
**Owner**: Spec Architect Agent

---

## Overview

This specification defines voice interaction capabilities for the Evolution of Todo application, enabling hands-free task management through speech recognition and text-to-speech responses integrated with the Phase III AI Chatbot.

**Goal**: Enable users to manage tasks using voice commands with <500ms response latency and >95% accuracy.

---

## Voice UX Modes

### Mode 1: Push-to-Talk (Default)

```
User Action: Click 🎤 button or press Space
   ↓
System: Start listening (visual: pulsing mic icon)
   ↓
User: Speaks command
   ↓
System: Auto-stop after 1s silence
   ↓
Processing: NLU + Tool execution
   ↓
Response: TTS output + visual text
```

**Advantages**: Privacy-friendly, explicit control, battery efficient

---

### Mode 2: Continuous Listening

```
User Action: Enable "Continuous Mode" toggle
   ↓
System: Listen for wake word ("Hey todo")
   ↓
User: "Hey todo, add buy milk"
   ↓
System: Strip wake word → Process command
   ↓
Response: TTS + visual → Return to listening
```

**Advantages**: Hands-free, natural conversation
**Trade-offs**: Battery drain, privacy concerns

---

## Technical Specification

### Speech Recognition (Input)

**API**: Web Speech API (`SpeechRecognition`)

**Configuration**:
```typescript
const config = {
  lang: 'en-US',  // From user preference
  continuous: false,  // Single utterance (push-to-talk)
  interimResults: true,  // Show live transcript
  maxAlternatives: 1
};
```

**Language Support**:
| Language | Speech Recognition Code |
|----------|------------------------|
| English | en-US |
| Spanish | es-ES |
| French | fr-FR |
| German | de-DE |
| Portuguese | pt-BR |
| Chinese | zh-CN |
| Japanese | ja-JP |
| Arabic | ar-SA |
| Hindi | hi-IN |

**Browser Support**:
- ✅ Chrome/Edge: Full support
- ✅ Safari: Full support  
- ⚠️ Firefox: Limited (requires polyfill)

---

### Text-to-Speech (Output)

**API**: Web Speech API (`SpeechSynthesis`)

**Configuration**:
```typescript
const utterance = new SpeechSynthesisUtterance(text);
utterance.lang = 'en-US';
utterance.rate = 1.0;   // Speed (0.1-10)
utterance.pitch = 1.0;  // Pitch (0-2)
utterance.volume = 1.0; // Volume (0-1)
```

**Voice Selection Priority**:
1. User-selected voice (if configured)
2. Local voice for user's language
3. First available voice for language
4. Fallback to English

**Browser Support**: ✅ All modern browsers

---

## Voice Response Optimization

### Text vs Voice Format

| Context | Text Response | Voice Response |
|---------|---------------|----------------|
| Task created | "Task created: Buy milk (ID: 5)" | "Got it! Milk added." |
| List 3 tasks | "You have 3 tasks:\n1. Buy milk\n2. Call dentist\n3. Finish report" | "You have 3 tasks. Buy milk, call dentist, and finish report." |
| Task complete | "Task 'Buy milk' marked as completed" | "Done! Milk is complete." |
| Error | "Task not found. Please check the task ID." | "Sorry, I couldn't find that task." |
| Confirmation | "Are you sure you want to delete this task?" | "Delete this task? Say yes or no." |

### Formatting Rules

1. **Brevity**: Max 2-3 sentences
2. **Natural**: Use contractions ("I've" vs "I have")
3. **Clear**: Remove IDs, timestamps, technical details
4. **Confirmatory**: Add "Got it!", "Done!", "Okay!"
5. **Action-oriented**: End with clear prompts

**Implementation**:
```typescript
function formatForVoice(response: string, context: string): string {
  // Remove technical details
  let voice = response
    .replace(/\(ID: \d+\)/g, '')
    .replace(/\d{4}-\d{2}-\d{2}T[\d:]+Z/g, 'today');
  
  // Add confirmation prefix
  if (context === 'task_created') {
    voice = `Got it! ${extractTaskName(voice)} added.`;
  }
  
  return voice;
}
```

---

## Wake Word Detection

**Supported Wake Phrases**:
- "Hey todo"
- "Okay todo"  
- "Hello todo"

**Detection Logic**:
```typescript
function detectWakeWord(transcript: string): { 
  detected: boolean; 
  command: string 
} {
  const normalized = transcript.toLowerCase();
  const wakeWords = ['hey todo', 'okay todo', 'hello todo'];
  
  for (const wake of wakeWords) {
    if (normalized.startsWith(wake)) {
      const command = normalized.substring(wake.length).trim();
      return { detected: true, command };
    }
  }
  
  return { detected: false, command: transcript };
}
```

---

## Accessibility Features

### Visual Indicators

**Listening State**:
```tsx
<div className="listening-indicator">
  <div className="pulse-circle" />  {/* Pulsing animation */}
  <span>Listening...</span>
</div>
```

**Processing State**:
```tsx
<div className="processing-indicator">
  <Spinner />
  <span>Processing...</span>
</div>
```

**Speaking State**:
```tsx
<div className="speaking-indicator">
  <SoundWaveAnimation />  {/* Animated bars */}
  <span>Speaking...</span>
</div>
```

**Live Transcript** (for deaf/hard-of-hearing):
```tsx
<div className="live-transcript" aria-live="polite">
  <strong>You said:</strong> "{transcript}"
</div>
```

---

### ARIA Labels

```tsx
<button
  onClick={toggleVoice}
  aria-label="Activate voice input"
  aria-pressed={isListening}
  aria-live="polite"
>
  🎤 {isListening ? 'Listening...' : 'Press to speak'}
</button>

<div 
  role="status" 
  aria-live="assertive" 
  aria-atomic="true"
>
  {statusMessage}
</div>
```

---

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + Shift + V` | Toggle voice input |
| `Space` (hold) | Push-to-talk |
| `Esc` | Stop voice input |

**Implementation**:
```typescript
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'V') {
      e.preventDefault();
      toggleVoiceInput();
    }
    
    if (e.code === 'Space' && !isTypingInInput) {
      e.preventDefault();
      if (e.type === 'keydown') startListening();
      else if (e.type === 'keyup') stopListening();
    }
  };
  
  window.addEventListener('keydown', handleKeyPress);
  window.addEventListener('keyup', handleKeyPress);
  
  return () => {
    window.removeEventListener('keydown', handleKeyPress);
    window.removeEventListener('keyup', handleKeyPress);
  };
}, []);
```

---

## Error Handling

### Error Types and Solutions

| Error | Cause | Solution | User Message |
|-------|-------|----------|--------------|
| `not-allowed` | Mic permission denied | Request permission | "Please allow microphone access" |
| `no-speech` | No speech detected | Auto-retry | "I didn't hear anything. Try again?" |
| `audio-capture` | Mic not available | Disable voice | "Microphone not available" |
| `network` | Network error | Retry with backoff | "Connection issue. Retrying..." |
| `aborted` | User interrupted | Restart | Silent (no error) |

**Error Handler**:
```typescript
function handleSpeechError(error: SpeechRecognitionError) {
  const handlers = {
    'not-allowed': () => {
      showPermissionError();
      disableVoice();
    },
    'no-speech': () => {
      setTimeout(startListening, 500);  // Silent retry
    },
    'audio-capture': () => {
      showError('Microphone not available');
      disableVoice();
    },
    'network': () => {
      showError('Connection issue. Retrying...');
      setTimeout(startListening, 2000);
    },
    'aborted': () => {
      // User interrupted, ignore
    }
  };
  
  const handler = handlers[error.error] || (() => {
    showError('Voice input failed. Please try again.');
  });
  
  handler();
}
```

---

## Confirmation Prompts

**Critical Actions** (require voice confirmation):
- delete_task
- delete_all_tasks
- clear_completed

**Flow**:
```typescript
async function executeVoiceCommand(intent: string, entities: any) {
  if (CRITICAL_ACTIONS.includes(intent)) {
    // Ask confirmation
    const confirmed = await askVoiceConfirmation(
      `Delete ${entities.taskName}? Say yes or no.`
    );
    
    if (confirmed === 'yes') {
      return execute(intent, entities);
    } else {
      return { message: "Okay, cancelled." };
    }
  }
  
  // Execute directly for non-critical actions
  return execute(intent, entities);
}

async function askVoiceConfirmation(prompt: string): Promise<'yes' | 'no'> {
  await speak(prompt);
  
  return new Promise((resolve) => {
    startListening((transcript) => {
      const normalized = transcript.toLowerCase();
      const isYes = /\b(yes|yeah|yep|sure|okay)\b/.test(normalized);
      const isNo = /\b(no|nope|cancel)\b/.test(normalized);
      
      if (isYes) resolve('yes');
      else if (isNo) resolve('no');
      else resolve('no');  // Default to no for safety
    });
  });
}
```

---

## Performance Optimizations

### 1. Lazy Loading
```typescript
const useSpeechRecognition = () => {
  const [recognition, setRecognition] = useState(null);
  
  const init = async () => {
    if (!recognition) {
      const { VoiceSpeechRecognition } = await import('./VoiceSpeechRecognition');
      setRecognition(new VoiceSpeechRecognition(config));
    }
  };
  
  return { recognition, init };
};
```

### 2. Debouncing Interim Results
```typescript
const debouncedTranscript = useMemo(
  () => debounce(setInterimTranscript, 300),
  []
);
```

### 3. Audio Context Reuse
```typescript
const audioContext = useRef<AudioContext | null>(null);

const getAudioContext = () => {
  if (!audioContext.current) {
    audioContext.current = new AudioContext();
  }
  return audioContext.current;
};
```

---

## Testing Strategy

### Unit Tests
```typescript
describe('Voice Interaction', () => {
  it('should detect wake word', () => {
    const result = detectWakeWord('hey todo add milk');
    expect(result.detected).toBe(true);
    expect(result.command).toBe('add milk');
  });
  
  it('should format response for voice', () => {
    const text = 'Task created: Buy milk (ID: 5)';
    const voice = formatForVoice(text, 'task_created');
    expect(voice).toBe('Got it! Buy milk added.');
  });
});
```

### E2E Tests
```typescript
test('voice input creates task', async ({ page }) => {
  // Enable voice
  await page.click('[aria-label="Activate voice input"]');
  
  // Simulate speech recognition
  await page.evaluate(() => {
    window.mockSpeechRecognition('add buy milk');
  });
  
  // Wait for task creation
  await expect(page.locator('.task-item')).toContainText('buy milk');
  
  // Check TTS response
  await expect(page.locator('.chat-message')).toContainText('Got it!');
});
```

---

## UI Component Structure

```
VoiceChat.tsx
├── VoiceButton (🎤 button)
├── VoiceStatusIndicator (listening/processing/speaking)
├── LiveTranscript (shows what user said)
├── ContinuousModeToggle (enable/disable continuous listening)
└── VoiceSettingsMenu
    ├── LanguageSelect
    ├── VoiceSelect (TTS voice)
    ├── SpeechRate (0.5x - 2x)
    └── TestVoice button
```

---

## Validation Checklist

Before launching voice features:

### Core Functionality
- [ ] Push-to-talk works (button + Space key)
- [ ] Continuous listening with wake word detection
- [ ] Speech recognition accuracy > 95% (quiet environment)
- [ ] TTS response latency < 500ms
- [ ] Multi-language support (9 languages)

### Accessibility
- [ ] Screen reader compatible (ARIA labels)
- [ ] Keyboard shortcuts work
- [ ] Visual indicators for all states
- [ ] Live transcript for deaf users
- [ ] Text fallback always available

### Error Handling
- [ ] Microphone permission handling
- [ ] No-speech auto-retry
- [ ] Network error retry with backoff
- [ ] User-friendly error messages

### Voice Optimization
- [ ] Responses are short and clear
- [ ] Confirmation prompts for critical actions
- [ ] Voice format different from text
- [ ] Natural, conversational tone

### Performance
- [ ] Lazy loading of voice libraries
- [ ] Debounced interim results
- [ ] Audio context reused
- [ ] No memory leaks

---

## Revision History

| **Version** | **Date**       | **Changes**                                      |
|-------------|----------------|--------------------------------------------------|
| 1.0.0       | 2025-12-25     | Initial specification                            |

---

## References

- **Voice Interaction Skill**: `.claude/skills/voice-interaction/README.md`
- **VoiceChat Component**: `components/VoiceChat.tsx`
- **Frontend UI Agent**: `.claude/agents/frontend-ui.md`
- **Web Speech API MDN**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
- **WCAG 2.1 Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/

---

**Status**: ✅ Specification Complete
**Next Steps**:
1. Implement VoiceChat.tsx component
2. Add voice response formatting to AI Chatbot Agent
3. Test with all supported languages
4. Conduct accessibility audit
5. Deploy to Phase III environment
