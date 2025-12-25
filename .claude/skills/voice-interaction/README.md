# Voice Interaction Skill

**Skill Type**: Voice UX & Web Speech API Design
**Version**: 1.0.0
**Created**: 2025-12-25
**Owner**: Spec Architect Agent

---

## Overview

The **Voice Interaction** skill provides comprehensive design patterns for voice-enabled task management in Phase III of the Evolution of Todo application. This skill leverages the Web Speech API to enable hands-free interaction through speech recognition and text-to-speech responses, integrated with the AI Chatbot Agent and ChatKit interface.

**Purpose**: Design and implement voice-to-text input, voice commands, and text-to-speech responses for an accessible, hands-free task management experience.

**Output**:
- `specs/ui/voice.md` - Voice interaction specification
- `components/VoiceChat.tsx` - Voice chat component implementation
- Voice UX flow and interaction patterns
- Accessibility features for screen readers

---

## Skill Components

### 1. Voice Input (Speech Recognition)
- Web Speech API integration (SpeechRecognition)
- Continuous listening mode with toggle
- Multi-language speech recognition
- Noise cancellation and accuracy optimization
- Visual feedback during listening

### 2. Voice Output (Text-to-Speech)
- Web Speech API synthesis (SpeechSynthesis)
- Voice-optimized response formatting (shorter, clearer)
- Confirmation prompts for critical actions
- Multi-language voice synthesis
- Voice personality configuration

### 3. Voice UX Flow
- Push-to-talk button (🎤)
- Continuous listening mode
- Wake word detection ("Hey Todo")
- Voice command shortcuts
- Error handling and fallbacks

### 4. Accessibility
- Screen reader compatibility
- Keyboard shortcuts for voice activation
- Visual indicators for deaf/hard-of-hearing users
- ARIA labels and semantic HTML
- Voice fallback to text input

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      User speaks                            │
│              "Hey todo, add buy milk"                       │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              Web Speech API (SpeechRecognition)             │
│  - Detect voice input                                       │
│  - Convert speech to text                                   │
│  - Handle errors (no speech, not allowed)                   │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              Wake Word Detection (Optional)                 │
│  - Check for "hey todo" prefix                              │
│  - Strip wake word from command                             │
│  - Activate continuous listening                            │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                   NLU Processing                            │
│  - Intent classification: "add_task"                        │
│  - Entity extraction: {title: "buy milk"}                   │
│  - Multilingual support                                     │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              Tool Orchestrator + MCP Tools                  │
│  - Execute: add_task(title="buy milk")                      │
│  - Get result: {task_id: 5, status: "created"}             │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│            Voice Response Formatter                         │
│  - Optimize for voice: Short, clear sentences              │
│  - Add confirmation: "Got it!"                              │
│  - Format: "Milk added to your list"                        │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│         Web Speech API (SpeechSynthesis)                    │
│  - Convert text to speech                                   │
│  - Select voice (language, gender, pitch)                   │
│  - Play audio response                                      │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                 User hears response                         │
│              "Milk added to your list"                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Voice UX Flow

### Interaction Modes

#### Mode 1: Push-to-Talk (Default)

```
User clicks 🎤 button
   ↓
Microphone activates
   ↓
Visual feedback: "Listening..." (pulsing animation)
   ↓
User speaks: "Add buy milk"
   ↓
Speech stops (1 second silence)
   ↓
Microphone deactivates automatically
   ↓
Processing: "Processing..." (spinner)
   ↓
NLU + Tool execution
   ↓
TTS Response: "Milk added to your list"
   ↓
Visual: Text appears in chat + checkmark animation
```

**Advantages**:
- Explicit control
- Privacy-friendly (clear start/stop)
- Battery efficient

---

#### Mode 2: Continuous Listening

```
User enables "Continuous Listening" toggle
   ↓
System listens for wake word: "Hey todo"
   ↓
User says: "Hey todo, add buy milk"
   ↓
Wake word detected → Strip "hey todo"
   ↓
Process: "add buy milk"
   ↓
TTS Response + Visual feedback
   ↓
Return to listening for wake word
```

**Advantages**:
- Hands-free operation
- Natural conversation flow
- Multi-turn dialogues

**Disadvantages**:
- Battery drain
- Privacy concerns
- False positives

---

#### Mode 3: Voice Command Shortcuts

```
User says quick command format:
  "Todo: [action]"
  
Examples:
  "Todo: add buy milk"
  "Todo: show my tasks"
  "Todo: complete task 5"
  
System detects "todo:" prefix
   ↓
Processes command immediately
   ↓
Shorter response (optimized for voice)
```

---

## Web Speech API Integration

### Speech Recognition (Input)

**Browser Support**:
- ✅ Chrome/Edge: Excellent (Web Speech API)
- ✅ Safari: Good (Web Speech API)
- ❌ Firefox: Limited (no native support, use polyfill)

**Implementation**:

```typescript
// VoiceSpeechRecognition.ts

interface SpeechRecognitionConfig {
  language: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
}

class VoiceSpeechRecognition {
  private recognition: SpeechRecognition | null = null;
  private isListening: boolean = false;
  
  constructor(config: SpeechRecognitionConfig) {
    // Check browser support
    const SpeechRecognition = 
      window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      throw new Error('Speech recognition not supported');
    }
    
    this.recognition = new SpeechRecognition();
    this.recognition.lang = config.language || 'en-US';
    this.recognition.continuous = config.continuous || false;
    this.recognition.interimResults = config.interimResults || true;
    this.recognition.maxAlternatives = config.maxAlternatives || 1;
  }
  
  start(onResult: (transcript: string, isFinal: boolean) => void) {
    if (!this.recognition) return;
    
    this.recognition.onresult = (event) => {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript;
      const isFinal = result.isFinal;
      
      onResult(transcript, isFinal);
    };
    
    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      this.handleError(event.error);
    };
    
    this.recognition.onend = () => {
      this.isListening = false;
    };
    
    this.recognition.start();
    this.isListening = true;
  }
  
  stop() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }
  
  private handleError(error: string) {
    switch (error) {
      case 'no-speech':
        // No speech detected
        break;
      case 'audio-capture':
        // Microphone not available
        break;
      case 'not-allowed':
        // User denied microphone permission
        break;
      default:
        console.error('Unknown error:', error);
    }
  }
}
```

---

### Speech Synthesis (Output)

**Browser Support**:
- ✅ Chrome/Edge: Excellent
- ✅ Safari: Excellent
- ✅ Firefox: Good

**Implementation**:

```typescript
// VoiceSpeechSynthesis.ts

interface VoiceConfig {
  language: string;
  rate: number;  // 0.1 to 10 (default: 1)
  pitch: number; // 0 to 2 (default: 1)
  volume: number; // 0 to 1 (default: 1)
  voiceName?: string;
}

class VoiceSpeechSynthesis {
  private synth: SpeechSynthesis;
  private config: VoiceConfig;
  private voices: SpeechSynthesisVoice[] = [];
  
  constructor(config: VoiceConfig) {
    this.synth = window.speechSynthesis;
    this.config = config;
    
    // Load available voices
    this.loadVoices();
  }
  
  private loadVoices() {
    this.voices = this.synth.getVoices();
    
    // Voices may load asynchronously
    if (this.voices.length === 0) {
      this.synth.onvoiceschanged = () => {
        this.voices = this.synth.getVoices();
      };
    }
  }
  
  speak(text: string, onEnd?: () => void) {
    // Cancel any ongoing speech
    this.synth.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Select voice
    const voice = this.selectVoice(this.config.language, this.config.voiceName);
    if (voice) {
      utterance.voice = voice;
    }
    
    utterance.lang = this.config.language;
    utterance.rate = this.config.rate;
    utterance.pitch = this.config.pitch;
    utterance.volume = this.config.volume;
    
    utterance.onend = () => {
      if (onEnd) onEnd();
    };
    
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
    };
    
    this.synth.speak(utterance);
  }
  
  private selectVoice(
    language: string, 
    voiceName?: string
  ): SpeechSynthesisVoice | null {
    // Try to find voice by name
    if (voiceName) {
      const voice = this.voices.find(v => v.name === voiceName);
      if (voice) return voice;
    }
    
    // Fallback: Find voice by language
    const langVoices = this.voices.filter(v => v.lang.startsWith(language));
    
    // Prefer local voices
    const localVoice = langVoices.find(v => v.localService);
    if (localVoice) return localVoice;
    
    // Return first matching voice
    return langVoices[0] || null;
  }
  
  stop() {
    this.synth.cancel();
  }
  
  pause() {
    this.synth.pause();
  }
  
  resume() {
    this.synth.resume();
  }
}
```

---

## Voice-Optimized Responses

### Response Formatting Guidelines

**Text vs Voice Responses**:

| **Scenario** | **Text Response** | **Voice Response** |
|--------------|-------------------|-------------------|
| Task created | "Task created: Buy milk (ID: 5)" | "Got it! Milk added to your list." |
| Task list (3 items) | "You have 3 tasks:\n1. Buy milk\n2. Call dentist\n3. Finish report" | "You have 3 tasks. Buy milk, call dentist, and finish report." |
| Task completed | "Task 'Buy milk' marked as completed" | "Done! Milk is complete." |
| Error | "Task not found. Please check the task ID." | "Sorry, I couldn't find that task." |
| Confirmation | "Are you sure you want to delete this task?" | "Delete this task? Say yes or no." |

**Formatting Rules**:
1. **Shorter**: Max 2-3 sentences
2. **Conversational**: Use contractions ("I've" vs "I have")
3. **Clear**: Avoid jargon and IDs
4. **Confirmatory**: Add acknowledgments ("Got it!", "Done!")
5. **Question format**: End with clear prompts ("Say yes or no")

---

### Voice Response Formatter

```typescript
// VoiceResponseFormatter.ts

class VoiceResponseFormatter {
  /**
   * Convert standard response to voice-optimized format
   */
  formatForVoice(response: string, context: string): string {
    // Remove technical details (IDs, timestamps)
    let voiceResponse = response
      .replace(/\(ID: \d+\)/g, '')
      .replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z/g, 'today');
    
    // Shorten based on context
    switch (context) {
      case 'task_created':
        voiceResponse = this.shortenTaskCreated(voiceResponse);
        break;
      case 'task_list':
        voiceResponse = this.shortenTaskList(voiceResponse);
        break;
      case 'task_completed':
        voiceResponse = this.shortenTaskCompleted(voiceResponse);
        break;
      case 'error':
        voiceResponse = this.shortenError(voiceResponse);
        break;
    }
    
    // Add confirmation
    if (!voiceResponse.match(/^(Got it|Done|Okay|Sure)/)) {
      voiceResponse = this.addConfirmation(voiceResponse, context);
    }
    
    return voiceResponse;
  }
  
  private shortenTaskCreated(response: string): string {
    // "Task created: Buy milk (ID: 5)" → "Got it! Milk added."
    const match = response.match(/Task created: (.+?)(?:\s*\(ID:|$)/i);
    if (match) {
      const taskName = match[1].trim();
      return `Got it! ${taskName} added to your list.`;
    }
    return response;
  }
  
  private shortenTaskList(response: string): string {
    // Limit to 5 tasks max in voice
    const lines = response.split('\n');
    const tasks = lines.slice(1, 6); // First 5 tasks
    
    if (tasks.length === 0) {
      return "You don't have any tasks yet.";
    }
    
    const taskNames = tasks.map(t => 
      t.replace(/^\d+\.\s*/, '').trim()
    );
    
    if (tasks.length === 1) {
      return `You have one task: ${taskNames[0]}.`;
    } else if (tasks.length <= 3) {
      const last = taskNames.pop();
      return `You have ${tasks.length} tasks. ${taskNames.join(', ')}, and ${last}.`;
    } else {
      return `You have ${tasks.length} tasks. ${taskNames.slice(0, 3).join(', ')}, and more.`;
    }
  }
  
  private shortenTaskCompleted(response: string): string {
    // "Task 'Buy milk' marked as completed" → "Done! Milk is complete."
    const match = response.match(/Task ['"](.+?)['"] marked as completed/i);
    if (match) {
      const taskName = match[1].trim();
      return `Done! ${taskName} is complete.`;
    }
    return "Done!";
  }
  
  private shortenError(response: string): string {
    // Make errors friendlier
    return response
      .replace(/Please check/gi, 'Try again')
      .replace(/Error:/gi, 'Oops,')
      .replace(/Invalid/gi, "I couldn't understand");
  }
  
  private addConfirmation(response: string, context: string): string {
    const confirmations = ['Got it!', 'Done!', 'Okay!', 'Sure thing!'];
    const random = confirmations[Math.floor(Math.random() * confirmations.length)];
    
    if (context.includes('created') || context.includes('added')) {
      return `${random} ${response}`;
    }
    
    return response;
  }
}
```

---

## Wake Word Detection

**Wake Phrases**:
- "Hey todo"
- "Okay todo"
- "Hello todo"

**Implementation**:

```typescript
// WakeWordDetector.ts

class WakeWordDetector {
  private wakeWords = ['hey todo', 'okay todo', 'hello todo'];
  
  detect(transcript: string): { detected: boolean; command: string } {
    const normalized = transcript.toLowerCase().trim();
    
    for (const wakeWord of this.wakeWords) {
      if (normalized.startsWith(wakeWord)) {
        // Strip wake word from command
        const command = normalized
          .substring(wakeWord.length)
          .replace(/^[,.\s]+/, '') // Remove leading punctuation
          .trim();
        
        return { detected: true, command };
      }
    }
    
    return { detected: false, command: transcript };
  }
  
  shouldActivate(transcript: string): boolean {
    const normalized = transcript.toLowerCase().trim();
    return this.wakeWords.some(word => normalized.includes(word));
  }
}
```

---

## Accessibility Features

### Screen Reader Compatibility

**ARIA Labels**:

```tsx
<button
  onClick={startListening}
  aria-label="Activate voice input"
  aria-pressed={isListening}
  aria-live="polite"
>
  {isListening ? '🎤 Listening...' : '🎤 Press to speak'}
</button>

<div
  role="status"
  aria-live="assertive"
  aria-atomic="true"
>
  {statusMessage}
</div>
```

**Keyboard Shortcuts**:

```typescript
// Keyboard shortcuts for voice activation
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    // Ctrl/Cmd + Shift + V: Toggle voice input
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'V') {
      e.preventDefault();
      toggleVoiceInput();
    }
    
    // Space: Push-to-talk (hold to speak)
    if (e.code === 'Space' && !isTyping) {
      e.preventDefault();
      if (e.type === 'keydown') {
        startListening();
      } else if (e.type === 'keyup') {
        stopListening();
      }
    }
  };
  
  window.addEventListener('keydown', handleKeyPress);
  window.addEventListener('keyup', handleKeyPress);
  
  return () => {
    window.removeEventListener('keydown', handleKeyPress);
    window.removeEventListener('keyup', handleKeyPress);
  };
}, [isListening]);
```

---

### Visual Indicators (Deaf/Hard-of-Hearing)

```tsx
// Visual feedback for voice states

<div className="voice-status">
  {/* Listening state */}
  {isListening && (
    <div className="listening-indicator">
      <div className="pulse-animation" />
      <span>Listening...</span>
    </div>
  )}
  
  {/* Processing state */}
  {isProcessing && (
    <div className="processing-indicator">
      <Spinner />
      <span>Processing...</span>
    </div>
  )}
  
  {/* Speaking state (TTS active) */}
  {isSpeaking && (
    <div className="speaking-indicator">
      <SoundWaveAnimation />
      <span>Speaking...</span>
    </div>
  )}
  
  {/* Live transcript */}
  {transcript && (
    <div className="live-transcript">
      <span>You said: "{transcript}"</span>
    </div>
  )}
</div>
```

**CSS Animations**:

```css
/* Pulsing microphone animation */
.pulse-animation {
  width: 60px;
  height: 60px;
  background: #3b82f6;
  border-radius: 50%;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.7;
  }
}

/* Sound wave animation */
.sound-wave {
  display: flex;
  gap: 4px;
  align-items: center;
}

.sound-wave-bar {
  width: 4px;
  background: #10b981;
  animation: wave 1s ease-in-out infinite;
}

.sound-wave-bar:nth-child(1) { animation-delay: 0s; }
.sound-wave-bar:nth-child(2) { animation-delay: 0.1s; }
.sound-wave-bar:nth-child(3) { animation-delay: 0.2s; }

@keyframes wave {
  0%, 100% { height: 10px; }
  50% { height: 30px; }
}
```

---

## Multi-Language Voice Support

### Language-Specific Speech Recognition

```typescript
// Language mapping for speech recognition
const SPEECH_RECOGNITION_LANGUAGES = {
  en: 'en-US',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
  pt: 'pt-BR',
  zh: 'zh-CN',
  ja: 'ja-JP',
  ar: 'ar-SA',
  hi: 'hi-IN',
};

function getSpeechRecognitionLanguage(userLanguage: string): string {
  return SPEECH_RECOGNITION_LANGUAGES[userLanguage] || 'en-US';
}
```

### Language-Specific Voice Selection

```typescript
// Preferred voices by language
const PREFERRED_VOICES = {
  'en-US': ['Samantha', 'Alex', 'Google US English'],
  'es-ES': ['Monica', 'Google español', 'Paulina'],
  'fr-FR': ['Amelie', 'Thomas', 'Google français'],
  'de-DE': ['Anna', 'Google Deutsch'],
  'pt-BR': ['Luciana', 'Google português do Brasil'],
  'zh-CN': ['Ting-Ting', 'Google 普通话（中国大陆）'],
  'ja-JP': ['Kyoko', 'Google 日本語'],
  'ar-SA': ['Maged', 'Google العربية'],
  'hi-IN': ['Lekha', 'Google हिन्दी'],
};
```

---

## Error Handling

### Common Errors and Solutions

| **Error** | **Cause** | **Solution** | **User Message** |
|-----------|-----------|--------------|------------------|
| `not-allowed` | User denied mic permission | Request permission again | "Please allow microphone access to use voice input" |
| `no-speech` | No speech detected | Auto-retry | "I didn't hear anything. Try again?" |
| `audio-capture` | Microphone not available | Show error, disable voice | "Microphone not available" |
| `network` | Network error during recognition | Retry with backoff | "Connection issue. Retrying..." |
| `aborted` | Recognition aborted | Restart | "Voice input interrupted. Try again?" |

**Error Handler**:

```typescript
function handleSpeechError(error: SpeechRecognitionError) {
  switch (error.error) {
    case 'not-allowed':
      showError('Please allow microphone access in your browser settings');
      setVoiceEnabled(false);
      break;
      
    case 'no-speech':
      // Silent retry
      setTimeout(() => startListening(), 500);
      break;
      
    case 'audio-capture':
      showError('Microphone not available. Please check your device.');
      setVoiceEnabled(false);
      break;
      
    case 'network':
      showError('Connection issue. Retrying...');
      setTimeout(() => startListening(), 2000);
      break;
      
    case 'aborted':
      // User interrupted, don't show error
      break;
      
    default:
      showError('Voice input failed. Please try again.');
  }
}
```

---

## Confirmation Prompts

### Critical Actions Require Confirmation

```typescript
// Actions that need voice confirmation
const CRITICAL_ACTIONS = ['delete_task', 'delete_all', 'clear_tasks'];

async function handleVoiceCommand(intent: string, entities: any) {
  if (CRITICAL_ACTIONS.includes(intent)) {
    // Ask for confirmation
    const confirmation = await askVoiceConfirmation(
      `Are you sure you want to ${intent.replace('_', ' ')}? Say yes or no.`
    );
    
    if (confirmation === 'yes') {
      return await executeCommand(intent, entities);
    } else {
      return { message: "Okay, cancelled." };
    }
  }
  
  // Non-critical: execute directly
  return await executeCommand(intent, entities);
}

async function askVoiceConfirmation(prompt: string): Promise<'yes' | 'no'> {
  // Speak prompt
  await voiceSynthesis.speak(prompt);
  
  // Listen for response
  return new Promise((resolve) => {
    const recognition = new VoiceSpeechRecognition({
      language: 'en-US',
      continuous: false,
      interimResults: false,
    });
    
    recognition.start((transcript, isFinal) => {
      if (isFinal) {
        const normalized = transcript.toLowerCase().trim();
        
        if (normalized.includes('yes') || normalized.includes('yeah') || normalized.includes('yep')) {
          resolve('yes');
        } else {
          resolve('no');
        }
        
        recognition.stop();
      }
    });
  });
}
```

---

## Performance Optimizations

### 1. Lazy Loading

```typescript
// Load speech recognition only when needed
const useSpeechRecognition = () => {
  const [recognition, setRecognition] = useState<VoiceSpeechRecognition | null>(null);
  
  const initRecognition = useCallback(async () => {
    if (!recognition) {
      // Lazy import
      const { VoiceSpeechRecognition } = await import('./VoiceSpeechRecognition');
      const instance = new VoiceSpeechRecognition({
        language: 'en-US',
        continuous: false,
        interimResults: true,
      });
      setRecognition(instance);
    }
  }, [recognition]);
  
  return { recognition, initRecognition };
};
```

### 2. Debouncing

```typescript
// Debounce interim results
const debouncedTranscript = useMemo(
  () => debounce((transcript: string) => {
    setInterimTranscript(transcript);
  }, 300),
  []
);
```

### 3. Audio Context Reuse

```typescript
// Reuse AudioContext to avoid creating multiple instances
const audioContextRef = useRef<AudioContext | null>(null);

const getAudioContext = () => {
  if (!audioContextRef.current) {
    audioContextRef.current = new AudioContext();
  }
  return audioContextRef.current;
};
```

---

## Related Agents

- **Frontend UI Agent** (`.claude/agents/frontend-ui.md`): Implements VoiceChat component
- **AI Chatbot Agent** (`.claude/agents/ai-chatbot.md`): Processes voice input commands
- **Spec Architect Agent** (`.claude/agents/spec-architect.md`): Designs voice UX architecture

---

## Skill Invocation

**For Voice UX Design**:
```
Act as Spec Architect Agent and design voice interaction for the chatbot
```

**For Frontend Implementation**:
```
Act as Frontend UI Agent and implement VoiceChat component with Web Speech API
```

**For Voice-Optimized Responses**:
```
Act as AI Chatbot Agent and format responses for voice output
```

---

## Success Metrics

A well-designed voice interaction system has:
- ✅ Speech recognition accuracy > 95% (quiet environment)
- ✅ Voice response latency < 500ms
- ✅ Multi-language support (9 languages)
- ✅ Accessibility (screen reader + keyboard shortcuts)
- ✅ Visual feedback for all voice states
- ✅ Error handling with graceful fallbacks
- ✅ Voice-optimized responses (short, clear)
- ✅ Confirmation prompts for critical actions

---

## Revision History

| **Version** | **Date**       | **Changes**                                      |
|-------------|----------------|--------------------------------------------------|
| 1.0.0       | 2025-12-25     | Initial skill documentation                      |

---

## References

- **Constitution**: `.specify/memory/constitution.md` (Principle IX: Accessibility)
- **Frontend UI Agent**: `.claude/agents/frontend-ui.md`
- **AI Chatbot Agent**: `.claude/agents/ai-chatbot.md`
- **Web Speech API**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
- **ARIA Practices**: https://www.w3.org/WAI/ARIA/apg/

---

**Status**: Ready for Phase III implementation
**Activation**: See skill invocation section above
