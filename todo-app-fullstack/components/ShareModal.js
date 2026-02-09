/**
 * ShareModal Component - Share link management UI
 * Implements T016: Add share link management UI
 */

import { useState, useEffect } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { ShareLinkModel } from '../src/models/shareLinkModel.js'
import { SharedListModel } from '../src/models/sharedListModel.js'

export default function ShareModal({ isOpen, onClose, listId, listName, userId }) {
  const supabase = useSupabaseClient()
  const [shareLinks, setShareLinks] = useState([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [copied, setCopied] = useState(null)
  const [error, setError] = useState(null)

  // Form state for new share link
  const [accessType, setAccessType] = useState('private')
  const [permissions, setPermissions] = useState('read')
  const [expiresIn, setExpiresIn] = useState('never')
  const [maxUses, setMaxUses] = useState('')

  const shareLinkModel = new ShareLinkModel(supabase)

  useEffect(() => {
    if (isOpen && listId) {
      loadShareLinks()
    }
  }, [isOpen, listId])

  const loadShareLinks = async () => {
    setLoading(true)
    setError(null)
    try {
      const links = await shareLinkModel.getByListId(listId)
      setShareLinks(links)
    } catch (err) {
      setError('Failed to load share links')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const createShareLink = async (e) => {
    e.preventDefault()
    setCreating(true)
    setError(null)

    try {
      // Calculate expiration date
      let expiresAt = null
      if (expiresIn !== 'never') {
        expiresAt = new Date()
        switch (expiresIn) {
          case '1h':
            expiresAt.setHours(expiresAt.getHours() + 1)
            break
          case '24h':
            expiresAt.setHours(expiresAt.getHours() + 24)
            break
          case '7d':
            expiresAt.setDate(expiresAt.getDate() + 7)
            break
          case '30d':
            expiresAt.setDate(expiresAt.getDate() + 30)
            break
        }
      }

      const link = await shareLinkModel.create({
        listId,
        createdBy: userId,
        accessType,
        permissions,
        expiresAt: expiresAt?.toISOString() || null,
        maxUses: maxUses ? parseInt(maxUses) : null
      })

      setShareLinks([link, ...shareLinks])

      // Reset form
      setAccessType('private')
      setPermissions('read')
      setExpiresIn('never')
      setMaxUses('')
    } catch (err) {
      setError(err.message || 'Failed to create share link')
    } finally {
      setCreating(false)
    }
  }

  const deleteShareLink = async (linkId) => {
    if (!confirm('Are you sure you want to delete this share link?')) return

    try {
      await shareLinkModel.delete(linkId)
      setShareLinks(shareLinks.filter(l => l.id !== linkId))
    } catch (err) {
      setError('Failed to delete share link')
    }
  }

  const copyToClipboard = async (linkId) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    const url = shareLinkModel.generateShareUrl(linkId, baseUrl)

    try {
      await navigator.clipboard.writeText(url)
      setCopied(linkId)
      setTimeout(() => setCopied(null), 2000)
    } catch {
      setError('Failed to copy to clipboard')
    }
  }

  const formatExpiration = (expiresAt) => {
    if (!expiresAt) return 'Never'
    const date = new Date(expiresAt)
    if (date < new Date()) return 'Expired'
    return date.toLocaleDateString()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Share "{listName}"
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Create new link form */}
        <form onSubmit={createShareLink} className="px-6 py-4 border-b bg-gray-50">
          <h3 className="font-medium text-gray-900 mb-3">Create New Share Link</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Access Type
              </label>
              <select
                value={accessType}
                onChange={(e) => setAccessType(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="private">Private (Anyone with link)</option>
                <option value="public">Public (Discoverable)</option>
                <option value="team">Team Only</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Permissions
              </label>
              <select
                value={permissions}
                onChange={(e) => setPermissions(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="read">View only</option>
                <option value="read_write">Can edit</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expires
              </label>
              <select
                value={expiresIn}
                onChange={(e) => setExpiresIn(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="never">Never</option>
                <option value="1h">1 hour</option>
                <option value="24h">24 hours</option>
                <option value="7d">7 days</option>
                <option value="30d">30 days</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Uses (optional)
              </label>
              <input
                type="number"
                min="1"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                placeholder="Unlimited"
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={creating}
            className="mt-4 w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {creating ? 'Creating...' : 'Create Share Link'}
          </button>
        </form>

        {/* Existing share links */}
        <div className="px-6 py-4">
          <h3 className="font-medium text-gray-900 mb-3">Active Share Links</h3>

          {loading ? (
            <div className="text-center py-4 text-gray-500">Loading...</div>
          ) : shareLinks.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No share links yet. Create one above.
            </div>
          ) : (
            <div className="space-y-3">
              {shareLinks.map((link) => (
                <div
                  key={link.id}
                  className="border rounded-lg p-3 flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        link.permissions === 'read_write'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {link.permissions === 'read_write' ? 'Edit' : 'View'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {link.accessType}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-gray-600 truncate">
                      {typeof window !== 'undefined' && `${window.location.origin}/join/${link.id}`}
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      Used: {link.usageCount || 0}
                      {link.maxUses && ` / ${link.maxUses}`}
                      {' | '}
                      Expires: {formatExpiration(link.expiresAt)}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => copyToClipboard(link.id)}
                      className="p-2 text-gray-400 hover:text-indigo-600"
                      title="Copy link"
                    >
                      {copied === link.id ? (
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={() => deleteShareLink(link.id)}
                      className="p-2 text-gray-400 hover:text-red-600"
                      title="Delete link"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="w-full py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
