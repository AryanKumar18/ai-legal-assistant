import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import api from '../services/api'

export default function Search() {
  const [query, setQuery] = useState('')
  const [fileType, setFileType] = useState('')
  const [status, setStatus] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const navigate = useNavigate()

  // Search on filter change
  useEffect(() => {
    if (query || fileType || status) {
      handleSearch()
    }
  }, [fileType, status])

  const handleSearch = async () => {
    setLoading(true)
    setSearched(true)
    try {
      const params = new URLSearchParams()
      if (query) params.append('q', query)
      if (fileType) params.append('file_type', fileType)
      if (status) params.append('status', status)

      const response = await api.get(`/documents/search?${params}`)
      setResults(response.data.documents)
    } catch (err) {
      console.error('Search failed', err)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch()
  }

  const clearFilters = () => {
    setQuery('')
    setFileType('')
    setStatus('')
    setResults([])
    setSearched(false)
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
  <div className="w-64 flex-shrink-0"></div>  {/* spacer for fixed sidebar */}
      <Sidebar />

      <div className="flex-1 p-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Search Documents</h1>
          <p className="text-gray-500 mt-1">Find documents by name or filter by type</p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                🔍
              </span>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search by document name..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* File Type Filter */}
            <select
              value={fileType}
              onChange={(e) => setFileType(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">All Types</option>
              <option value="pdf">PDF</option>
              <option value="docx">DOCX</option>
            </select>

            {/* Status Filter */}
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">All Status</option>
              <option value="uploaded">Uploaded</option>
              <option value="processed">Processed</option>
            </select>

            <button
              onClick={handleSearch}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
            >
              Search
            </button>

            {(query || fileType || status) && (
              <button
                onClick={clearFilters}
                className="px-4 py-2.5 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="bg-white rounded-xl border border-gray-200">
          {/* Results Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">
              {searched ? `Results (${results.length})` : 'All Documents'}
            </h2>
            {searched && query && (
              <p className="text-sm text-gray-400">
                Showing results for "<span className="text-indigo-600">{query}</span>"
              </p>
            )}
          </div>

          {/* Loading */}
          {loading && (
            <div className="p-12 text-center text-gray-400">
              Searching...
            </div>
          )}

          {/* No Results */}
          {!loading && searched && results.length === 0 && (
            <div className="p-12 text-center">
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-gray-500 font-medium">No documents found</p>
              <p className="text-gray-400 text-sm mt-1">
                Try a different search term or clear filters
              </p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !searched && (
            <div className="p-12 text-center">
              <div className="text-4xl mb-3">📂</div>
              <p className="text-gray-500 font-medium">Search your documents</p>
              <p className="text-gray-400 text-sm mt-1">
                Type a filename or use filters above
              </p>
            </div>
          )}

          {/* Results Table */}
          {!loading && results.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">
                      Document Name
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">
                      Type
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">
                      Size
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">
                      Uploaded On
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">
                      Status
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">
                      Summary
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {results.map((doc) => (
                    <tr
                      key={doc.id}
                      onClick={() => navigate(`/documents/${doc.id}`)}
                      className="hover:bg-gray-50 transition cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span>{doc.file_type === 'pdf' ? '📄' : '📝'}</span>
                          <span className="text-sm font-medium text-gray-900">
                            {doc.original_filename}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded-full uppercase">
                          {doc.file_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {doc.file_size} KB
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(doc.uploaded_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${
                          doc.status === 'processed'
                            ? 'bg-green-50 text-green-600'
                            : 'bg-yellow-50 text-yellow-600'
                        }`}>
                          {doc.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          doc.summary
                            ? 'bg-indigo-50 text-indigo-600'
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                          {doc.summary ? '✓ Available' : 'Not generated'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}