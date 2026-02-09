/**
 * ProgressRequestModal Component
 * Modal for requesting progress updates from team members
 */

import { useState, useEffect } from 'react';
import { X, TrendingUp, Send } from 'lucide-react';

export default function ProgressRequestModal({ task, onClose, onRequestProgress }) {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset message when task changes
  useEffect(() => {
    setMessage('');
  }, [task]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await onRequestProgress(task.id, message);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to request progress update');
    } finally {
      setIsLoading(false);
    }
  };

  if (!task) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Request Progress Update
              </h2>
              <p className="text-sm text-gray-500">
                From {task.assignments?.length || 0} assignee{task.assignments?.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="task-title" className="block text-sm font-medium text-gray-700 mb-1">
              Task
            </label>
            <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900 border border-gray-200">
              {task.title}
            </div>
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              Message (Optional)
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter a custom message for the team members..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
              disabled={isLoading}
            />
          </div>

          <div className="text-sm text-gray-500">
            <p>Progress update requests will be sent to:</p>
            <div className="mt-1 flex flex-wrap gap-2">
              {task.assignments && task.assignments.length > 0 ? (
                task.assignments.map((assignment) => (
                  <span
                    key={assignment.id}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full"
                  >
                    {assignment.user?.name || assignment.user?.email?.split('@')[0]}
                  </span>
                ))
              ) : (
                <span className="text-gray-400 italic">No assignees</span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              <Send className="w-4 h-4" />
              Request Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}