import { useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Input from '../ui/Input'

export default function ShareModal({ isOpen, onClose, item, type = 'task' }) {
  const [shareLinks, setShareLinks] = useState([])
  const [loading, setLoading] = useState(false)
  const [accessType, setAccessType] = useState('view')
  const [expiresIn, setExpiresIn] = useState('7')
  const [copied, setCopied] = useState(null)

  const generateLink = async () => {
    setLoading(true)
    // Simulate link generation
    const newLink = {
      id: Date.now(),
      token: Math.random().toString(36).substring(2, 15),
      accessType,
      expiresAt: expiresIn === 'never' ? null : new Date(Date.now() + parseInt(expiresIn) * 24 * 60 * 60 * 1000).toISOString(),
      usageCount: 0,
      createdAt: new Date().toISOString(),
    }
    setShareLinks([newLink, ...shareLinks])
    setLoading(false)
  }

  const copyLink = (link) => {
    const url = `${window.location.origin}/share/${link.token}`
    navigator.clipboard.writeText(url)
    setCopied(link.id)
    setTimeout(() => setCopied(null), 2000)
  }

  const deleteLink = (linkId) => {
    setShareLinks(shareLinks.filter(l => l.id !== linkId))
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Share ${type}`} size="lg">
      <div className="space-y-6">
        {/* Create new link */}
        <div className="bg-gray-50 rounded-xl p-4">
          <h4 className="font-medium text-gray-900 mb-4">Create Share Link</h4>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Access Level
              </label>
              <select
                value={accessType}
                onChange={(e) => setAccessType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="view">View Only</option>
                <option value="comment">Can Comment</option>
                <option value="edit">Can Edit</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expires In
              </label>
              <select
                value={expiresIn}
                onChange={(e) => setExpiresIn(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="1">1 day</option>
                <option value="7">7 days</option>
                <option value="30">30 days</option>
                <option value="never">Never</option>
              </select>
            </div>
          </div>

          <Button onClick={generateLink} loading={loading}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Generate Link
          </Button>
        </div>

        {/* Existing links */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Active Links</h4>

          {shareLinks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <p>No share links yet</p>
              <p className="text-sm">Generate a link to share this {type}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {shareLinks.map((link) => (
                <div
                  key={link.id}
                  className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`
                        px-2 py-0.5 text-xs font-medium rounded-full
                        ${link.accessType === 'view' ? 'bg-gray-100 text-gray-700' : ''}
                        ${link.accessType === 'comment' ? 'bg-blue-100 text-blue-700' : ''}
                        ${link.accessType === 'edit' ? 'bg-green-100 text-green-700' : ''}
                      `}>
                        {link.accessType}
                      </span>
                      <span className="text-xs text-gray-500">
                        {link.usageCount} uses
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 truncate">
                      {window.location.origin}/share/{link.token}
                    </p>
                    {link.expiresAt && (
                      <p className="text-xs text-gray-400 mt-1">
                        Expires: {new Date(link.expiresAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => copyLink(link)}
                      className={`
                        p-2 rounded-lg transition-colors
                        ${copied === link.id
                          ? 'bg-green-100 text-green-600'
                          : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                        }
                      `}
                    >
                      {copied === link.id ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={() => deleteLink(link.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Invite by email */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Invite by Email</h4>
          <div className="flex gap-2">
            <Input
              placeholder="Enter email address"
              type="email"
              className="flex-1"
            />
            <Button>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Invite
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
