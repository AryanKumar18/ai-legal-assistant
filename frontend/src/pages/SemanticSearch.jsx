import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import api from '../services/api'

export default function SemanticSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSearch = async () => {
    if (!query.trim()) return
    setLoading(true)
    setSearched(true)
    setError('')

    try {
      const response = await api.post('/ai/semantic-search', {
        query: query,
        limit: 8
      })
      setResults(response.data.results)
    } catch (err) {
      setError('Search failed. Make sure you have uploaded and processed documents.')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch()
  }

  const getRelevanceColor = (score) => {
    if (score >= 70) return 'bg-green-50 text-green-600'
    if (score >= 40) return 'bg-yellow-50 text-yellow-600'
    return 'bg-gray-50 text-gray-500'
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
  <div className="w-64 flex-shrink-0"></div>  {/* spacer for fixed sidebar */}
      <Sidebar />

      <div className="flex-1 p-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Semantic Search</h1>
          <p className="text-gray-500 mt-1">
            Search by meaning across all your documents using AI
          </p>
        </div>

        {/* Search Box */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                🧠
              </span>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder='Try: "termination clause", "payment terms", "liability"...'
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={!query.trim() || loading}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {/* How it works */}
          <div className="flex gap-6 mt-4 text-xs text-gray-400">
            <span>🔍 Searches document content, not just filenames</span>
            <span>🧠 Understands meaning, not just keywords</span>
            <span>📄 Searches across all your documents</span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Results */}
        <div className="space-y-4">

          {/* Loading */}
          {loading && (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-gray-500 text-sm">Searching across your documents...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !searched && (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <div className="text-4xl mb-3">🧠</div>
              <p className="text-gray-500 font-medium">AI-Powered Semantic Search</p>
              <p className="text-gray-400 text-sm mt-2 max-w-md mx-auto">
                Unlike regular search, this understands the meaning of your query
                and finds relevant content even if the exact words don't match.
              </p>
            </div>
          )}

          {/* No Results */}
          {!loading && searched && results.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-gray-500 font-medium">No relevant content found</p>
              <p className="text-gray-400 text-sm mt-1">
                Try a different search term or upload more documents
              </p>
            </div>
          )}

          {/* Results */}
          {!loading && results.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-500">
                  Found <span className="font-medium text-gray-900">{results.length}</span> relevant sections for
                  <span className="text-indigo-600 font-medium"> "{query}"</span>
                </p>
              </div>

              {results.map((result, i) => (
                <div
                  key={i}
                  onClick={() => navigate(`/documents/${result.document_id}`)}
                  className="bg-white rounded-xl border border-gray-200 p-6 cursor-pointer hover:border-indigo-300 hover:shadow-sm transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {result.file_type === 'pdf' ? '📄' : '📝'}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {result.document_name}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5 uppercase">
                          {result.file_type}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getRelevanceColor(result.relevance_score)}`}>
                        {result.relevance_score}% match
                      </span>
                      <span className="text-xs text-indigo-600 hover:underline">
                        Open →
                      </span>
                    </div>
                  </div>

                  {/* Excerpt */}
                  <div className="bg-gray-50 rounded-lg p-4 mt-2">
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {result.excerpt}
                    </p>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}