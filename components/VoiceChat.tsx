/**
 * VoiceChat Component
 * 
 * Voice-enabled chat interface using Web Speech API
 * - Speech Recognition for voice input
 * - Speech Synthesis for voice responses
 * - Push-to-talk and continuous listening modes
 * - Multi-language support
 * - Accessibility features
 * 
 * @author Spec Architect Agent
 * @version 1.0.0
 * @date 2025-12-25
 */

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

// Types
interface VoiceState {
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  error: string | null;
}

interface VoiceConfig {
  language: string;
  continuousMode: boolean;
  voiceName?: string;
  rate: number;
  pitch: number;
  volume: number;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isVoice?: boolean;
}

interface VoiceChatProps {
  onMessageSend: (message: string) => Promise<string>;
  initialLanguage?: string;
  className?: string;
}

export default function VoiceChat({
  onMessageSend,
  initialLanguage = 'en-US',
  className = ''
}: VoiceChatProps) {
  const { t, i18n } = useTranslation(['chat', 'common']);

  // State
  const [voiceState, setVoiceState] = useState<VoiceState>({
    isListening: false,
    isProcessing: false,
    isSpeaking: false,
    error: null
  });

  const [voiceConfig, setVoiceConfig] = useState<VoiceConfig>({
    language: initialLanguage,
    continuousMode: false,
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0
  });

  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSupported, setIsSupported] = useState(true);

  // Refs
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);

  // Check browser support
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const SpeechSynthesis = window.speechSynthesis;

    if (!SpeechRecognition || !SpeechSynthesis) {
      setIsSupported(false);
      setVoiceState(prev => ({ 
        ...prev, 
        error: 'Voice features not supported in this browser' 
      }));
    } else {
      synthesisRef.current = SpeechSynthesis;
    }
  }, []);

  // Initialize speech recognition
  const initRecognition = useCallback(() => {
    if (recognitionRef.current) return recognitionRef.current;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.lang = voiceConfig.language;
    recognition.continuous = voiceConfig.continuousMode;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      if (interim) {
        setInterimTranscript(interim);
      }

      if (final) {
        setTranscript(final);
        setInterimTranscript('');
        handleVoiceCommand(final);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      handleRecognitionError(event.error);
    };

    recognition.onend = () => {
      setVoiceState(prev => ({ ...prev, isListening: false }));
    };

    recognitionRef.current = recognition;
    return recognition;
  }, [voiceConfig]);

  // Start listening
  const startListening = useCallback(() => {
    if (!isSupported) return;

    const recognition = initRecognition();
    if (!recognition) return;

    try {
      recognition.start();
      setVoiceState(prev => ({ ...prev, isListening: true, error: null }));
      setTranscript('');
      setInterimTranscript('');
    } catch (error) {
      console.error('Failed to start recognition:', error);
    }
  }, [isSupported, initRecognition]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setVoiceState(prev => ({ ...prev, isListening: false }));
    }
  }, []);

  // Toggle listening
  const toggleListening = useCallback(() => {
    if (voiceState.isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [voiceState.isListening, startListening, stopListening]);

  // Handle recognition errors
  const handleRecognitionError = (error: string) => {
    const errorMessages: Record<string, string> = {
      'not-allowed': 'Microphone permission denied',
      'no-speech': 'No speech detected',
      'audio-capture': 'Microphone unavailable',
      'network': 'Network error'
    };

    const message = errorMessages[error] || 'Voice input failed';
    setVoiceState(prev => ({ ...prev, error: message, isListening: false }));

    // Auto-retry for no-speech
    if (error === 'no-speech' && voiceConfig.continuousMode) {
      setTimeout(startListening, 500);
    }
  };

  // Detect wake word
  const detectWakeWord = (text: string): { detected: boolean; command: string } => {
    const normalized = text.toLowerCase().trim();
    const wakeWords = ['hey todo', 'okay todo', 'hello todo'];

    for (const wake of wakeWords) {
      if (normalized.startsWith(wake)) {
        const command = normalized.substring(wake.length).replace(/^[,.\s]+/, '').trim();
        return { detected: true, command };
      }
    }

    return { detected: false, command: text };
  };

  // Handle voice command
  const handleVoiceCommand = async (text: string) => {
    let command = text;
    if (voiceConfig.continuousMode) {
      const result = detectWakeWord(text);
      if (!result.detected) return;
      command = result.command;
    }

    if (!command.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: command,
      timestamp: new Date(),
      isVoice: true
    };
    setMessages(prev => [...prev, userMessage]);

    setVoiceState(prev => ({ ...prev, isProcessing: true }));

    try {
      const response = await onMessageSend(command);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        isVoice: true
      };
      setMessages(prev => [...prev, assistantMessage]);

      await speakText(response);
    } catch (error) {
      console.error('Failed to process command:', error);
      setVoiceState(prev => ({ ...prev, error: 'Processing failed' }));
    } finally {
      setVoiceState(prev => ({ ...prev, isProcessing: false }));
    }
  };

  // Speak text using TTS
  const speakText = useCallback(async (text: string): Promise<void> => {
    if (!synthesisRef.current) return;

    return new Promise((resolve) => {
      synthesisRef.current!.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = voiceConfig.language;
      utterance.rate = voiceConfig.rate;
      utterance.pitch = voiceConfig.pitch;
      utterance.volume = voiceConfig.volume;

      utterance.onstart = () => {
        setVoiceState(prev => ({ ...prev, isSpeaking: true }));
      };

      utterance.onend = () => {
        setVoiceState(prev => ({ ...prev, isSpeaking: false }));
        resolve();
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setVoiceState(prev => ({ ...prev, isSpeaking: false }));
        resolve();
      };

      synthesisRef.current!.speak(utterance);
    });
  }, [voiceConfig]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthesisRef.current) {
        synthesisRef.current.cancel();
      }
    };
  }, []);

  if (!isSupported) {
    return (
      <div className={`voice-chat-unsupported ${className}`}>
        <p>Voice features not supported in this browser</p>
        <p>Please use text input instead</p>
      </div>
    );
  }

  return (
    <div className={`voice-chat ${className}`}>
      <button
        onClick={toggleListening}
        disabled={voiceState.isProcessing}
        className={`voice-button ${voiceState.isListening ? 'listening' : ''}`}
        aria-label={voiceState.isListening ? 'Stop listening' : 'Start listening'}
        aria-pressed={voiceState.isListening}
      >
        {voiceState.isListening ? (
          <div className="mic-active">
            <div className="pulse-animation" />
            🎤
          </div>
        ) : (
          <>🎤</>
        )}
      </button>

      <div className="voice-status" role="status" aria-live="polite">
        {voiceState.isListening && <div className="status-listening">👂 Listening...</div>}
        {voiceState.isProcessing && <div className="status-processing">⚙️ Processing...</div>}
        {voiceState.isSpeaking && <div className="status-speaking">🔊 Speaking...</div>}
        {voiceState.error && <div className="status-error" role="alert">⚠️ {voiceState.error}</div>}
      </div>

      {(transcript || interimTranscript) && (
        <div className="live-transcript" aria-live="polite">
          <strong>You said:</strong> {transcript || interimTranscript}
          {interimTranscript && <span className="interim">...</span>}
        </div>
      )}

      <div className="continuous-mode-toggle">
        <label>
          <input
            type="checkbox"
            checked={voiceConfig.continuousMode}
            onChange={(e) => setVoiceConfig(prev => ({ 
              ...prev, 
              continuousMode: e.target.checked 
            }))}
          />
          <span>Continuous Listening (say "Hey todo" to activate)</span>
        </label>
      </div>

      <div className="voice-messages">
        {messages.map(message => (
          <div key={message.id} className={`message message-${message.role}`}>
            <div className="message-content">{message.content}</div>
            {message.isVoice && <span className="voice-badge" title="Voice message">🎤</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
