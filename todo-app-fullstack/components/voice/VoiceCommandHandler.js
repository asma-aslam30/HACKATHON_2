import { useRouter } from 'next/router'
import { useCallback } from 'react'
import { parseCommand, speak, detectLang } from '../../lib/voiceCommands'
import VoiceButton from './VoiceButton'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

/**
 * VoiceCommandHandler — processes voice transcripts into app actions
 * Wraps VoiceButton and provides full app control via voice
 */
export default function VoiceCommandHandler({
  userId,
  onAddTask,
  onFilterChange,
  onSearch,
  onDeleteTask,
  onCompleteTask,
  todos = [],
  disabled,
  size,
}) {
  const router = useRouter()

  const findTaskByQuery = useCallback((query) => {
    const q = query.toLowerCase()
    // Try exact ID first
    if (/^\d+$/.test(q)) return todos.find(t => String(t.id) === q)
    // Then title match
    return todos.find(t => t.title.toLowerCase().includes(q))
  }, [todos])

  const handleTranscript = useCallback(async (transcript) => {
    const lang = detectLang(transcript)
    const { action, params } = parseCommand(transcript)

    switch (action) {
      case 'ADD_TASK': {
        const { title, priority = 'medium' } = params
        try {
          await onAddTask({ title, priority, description: '' })
          speak(`Added: ${title}`, lang)
        } catch {
          speak('Sorry, I could not add that task.', lang)
        }
        break
      }

      case 'LIST_TASKS': {
        onFilterChange?.(params.filter || 'all')
        const labels = {
          all: 'Showing all tasks',
          active: 'Showing pending tasks',
          completed: 'Showing completed tasks',
          overdue: 'Showing overdue tasks',
          due_today: 'Showing tasks due today',
          due_this_week: 'Showing tasks due this week',
        }
        speak(labels[params.filter] || 'Showing tasks', lang)
        break
      }

      case 'SEARCH': {
        onSearch?.(params.query)
        speak(`Searching for ${params.query}`, lang)
        break
      }

      case 'COMPLETE_TASK': {
        const task = findTaskByQuery(params.query)
        if (task) {
          await onCompleteTask?.(task.id, task.completed)
          speak(`Marked "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`, lang)
        } else {
          speak(`Could not find task: ${params.query}`, lang)
        }
        break
      }

      case 'DELETE_TASK': {
        const task = findTaskByQuery(params.query)
        if (task) {
          await onDeleteTask?.(task.id)
          speak(`Deleted: ${task.title}`, lang)
        } else {
          speak(`Could not find task: ${params.query}`, lang)
        }
        break
      }

      case 'NAVIGATE': {
        speak(`Opening ${params.path === '/chat' ? 'chat' : 'task board'}`, lang)
        setTimeout(() => router.push(params.path), 800)
        break
      }

      case 'OPEN_CREATE': {
        speak('Opening new task form', lang)
        // Trigger keyboard shortcut N
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'n', bubbles: true }))
        break
      }

      case 'AI_CHAT': {
        // Send unrecognized commands to AI chat backend
        try {
          const res = await fetch(`${BACKEND_URL}/api/${userId}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: transcript }),
          })
          if (res.ok) {
            const data = await res.json()
            speak(data.response, lang)
          } else {
            speak('I did not understand that command. Try saying "show tasks" or "add task"', lang)
          }
        } catch {
          speak('Command not recognized. Try: add task, show tasks, or go to chat.', lang)
        }
        break
      }

      default:
        speak('Command not recognized', lang)
    }
  }, [findTaskByQuery, onAddTask, onFilterChange, onSearch, onCompleteTask, onDeleteTask, router, userId])

  return (
    <VoiceButton
      onTranscript={handleTranscript}
      disabled={disabled}
      size={size}
    />
  )
}
