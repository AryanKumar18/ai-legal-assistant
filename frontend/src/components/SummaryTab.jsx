import { useState } from 'react'
import api from '../services/api'

export default function SummaryTab({ document, onUpdate, darkMode }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const generateSummary = async () => {
    setLoading(true)
    setError('')
    try {
      await api.post(`/ai/${document.id}/summarize`)
      onUpdate()
    } catch (err) {
      setError('Failed to generate summary. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const formatSummary = (text) => {
    if (!text) return null
    return text.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return (
          <h3 key={i} className="text-base font-semibold text-gray-900 mt-4 mb-2">
            {line.replace(/\*\*/g, '')}
          </h3>
        )
      }
      if (line.startsWith('* ') || line.startsWith('- ')) {
        return (
          <li key={i} className="text-gray-700 text-sm ml-4 mb-1">
            {line.replace(/^\* |^- /, '').replace(/\*\*/g, '')}
          </li>
        )
      }
      if (line.trim()) {
        return (
          <p key={i} className="text-gray-700 text-sm mb-2">
            {line.replace(/\*\*/g, '')}
          </p>
        )
      }
      return null
    })
  }

  return (
    <div className="w-full">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">AI Summary</h2>
          <button
            onClick={generateSummary}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? 'Generating...' : document.summary ? 'Regenerate' : 'Generate Summary'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-3 text-gray-500 py-8 justify-center">
            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm">Analyzing document with AI...</span>
          </div>
        )}

        {!loading && document.summary && (
          <div className="prose max-w-none">
            {formatSummary(document.summary)}
          </div>
        )}

        {!loading && !document.summary && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">📝</div>
            <p className="text-gray-500 font-medium">No summary yet</p>
            <p className="text-gray-400 text-sm mt-1">
              Click "Generate Summary" to analyze this document
            </p>
          </div>
        )}
      </div>
    </div>
  )
}