/**
 * ProgressUpdateModal Component
 * Modal for submitting progress updates in response to requests
 */

import { useState, useEffect } from 'react';
import { X, TrendingUp, CheckCircle } from 'lucide-react';

export default function ProgressUpdateModal({ task, onClose, onUpdateProgress }) {
  const [percentage, setPercentage] = useState(task?.progress || 0);
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Update percentage when task prop changes
  useEffect(() => {
    if (task?.progress !== undefined) {
      setPercentage(task.progress);
    }
  }, [task?.progress]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await onUpdateProgress(task.id, parseInt(percentage), note);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update progress');
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
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Update Progress
              </h2>
              <p className="text-sm text-gray-500">
                For task: {task.title}
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
            <label htmlFor="percentage" className="block text-sm font-medium text-gray-700 mb-1">
              Progress (%)
            </label>
            <input
              type="range"
              id="percentage"
              min="0"
              max="100"
              value={percentage}
              onChange={(e) => setPercentage(e.target.value)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between items-center mt-1">
              <span className="text-sm text-gray-600">{percentage}%</span>
              <div className="flex gap-2">
                {[0, 25, 50, 75, 100].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPercentage(value)}
                    className={`px-2 py-1 text-xs rounded ${
                      parseInt(percentage) === value
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {value}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
              Progress Note (Optional)
            </label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Describe what you've accomplished, challenges faced, or next steps..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
              disabled={isLoading}
            />
          </div>

          {/* Current Progress */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Current Progress</span>
              <span className="text-sm font-semibold text-gray-900">{task.progress || 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${task.progress || 0}%` }}
              ></div>
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
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              <CheckCircle className="w-4 h-4" />
              Update Progress
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}