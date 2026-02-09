import { useState } from 'react'
import { PlusIcon } from '@heroicons/react/outline'

export default function TodoForm({ onSubmit, loading }) {
  const [input, setInput] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!input.trim()) return

    onSubmit(input)
    setInput('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex space-x-3">
      <div className="flex-1">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What needs to be done?"
          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-3"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        <PlusIcon className="h-5 w-5 mr-1" />
        Add
      </button>
    </form>
  )
}