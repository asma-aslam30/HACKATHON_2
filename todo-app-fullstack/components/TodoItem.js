import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrashIcon, PencilIcon, CheckIcon, XIcon } from '@heroicons/react/outline'

export default function TodoItem({ todo, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(todo.title)
  const [isCompleting, setIsCompleting] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (showConfetti) {
      const confetti = require('canvas-confetti')
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#10b981', '#34d399', '#6ee7b7'],
      })
      const timer = setTimeout(() => setShowConfetti(false), 1000)
      return () => clearTimeout(timer)
    }
  }, [showConfetti])

  const handleSave = () => {
    onUpdate(todo.id, editText)
    setIsEditing(false)
  }

  const handleComplete = () => {
    if (!todo.completed) {
      setIsCompleting(true)
      setShowConfetti(true)
      setTimeout(() => {
        onUpdate(todo.id, todo.title, !todo.completed)
        setIsCompleting(false)
      }, 600)
    } else {
      onUpdate(todo.id, todo.title, !todo.completed)
    }
  }

  return (
    <motion.li
      className="bg-white px-4 py-4 shadow rounded-md flex items-center justify-between"
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={handleComplete}
            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
          />
        </motion.div>

        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div
              key="edit"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex items-center ml-3"
            >
              <input
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                autoFocus
              />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleSave}
                className="ml-2 p-1 text-green-600 hover:text-green-800"
              >
                <CheckIcon className="h-4 w-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setEditText(todo.title)
                  setIsEditing(false)
                }}
                className="ml-1 p-1 text-red-600 hover:text-red-800"
              >
                <XIcon className="h-4 w-4" />
              </motion.button>
            </motion.div>
          ) : (
            <motion.span
              key={`text-${todo.id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`ml-3 text-gray-700 ${
                todo.completed ? 'line-through text-gray-400' : ''
              }`}
              style={{
                filter: isCompleting ? 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.5))' : 'none',
                transition: 'filter 0.3s ease'
              }}
            >
              {todo.title}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div className="flex space-x-2">
        {!isEditing && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsEditing(true)}
            className="text-blue-600 hover:text-blue-900"
          >
            <PencilIcon className="h-4 w-4" />
          </motion.button>
        )}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onDelete(todo.id)}
          className="text-red-600 hover:text-red-900"
        >
          <TrashIcon className="h-4 w-4" />
        </motion.button>
      </div>
    </motion.li>
  )
}