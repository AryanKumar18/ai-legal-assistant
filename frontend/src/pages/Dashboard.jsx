import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import StatsCard from '../components/StatsCard'
import UploadModal from '../components/UploadModal'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)
  const [deleteDocId, setDeleteDocId] = useState(null)

  const fetchDocuments = async () => {
    try {
      const response = await api.get('/documents/')
      setDocuments(response.data.documents)
    } catch (err) {
      console.error('Failed to fetch documents', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (e, documentId) => {
    e.stopPropagation()
    setDeleteDocId(documentId)
  }

  const confirmDelete = async () => {
    try {
      await api.delete(`/documents/${deleteDocId}`)
      setDeleteDocId(null)
      fetchDocuments()
    } catch (err) {
      console.error('Delete failed', err)
    }
  }

  useEffect(() => {
    fetchDocuments()
  }, [])

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="w-64 flex-shrink-0"></div>  {/* spacer for fixed sidebar */}

      <Sidebar />

      <div className="flex-1 p-8">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 mt-1">Welcome back, {user?.full_name}!</p>
          </div>
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
          >
            <span>+</span>
            Upload Document
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          <StatsCard
            label="Total Documents"
            value={documents.length}
            icon="📄"
            color="blue"
          />
          <StatsCard
            label="Summaries Generated"
            value={documents.filter(d => d.summary).length}
            icon="📝"
            color="green"
          />
          <StatsCard
            label="Questions Asked"
            value={0}
            icon="💬"
            color="purple"
          />
          <StatsCard
            label="Risky Clauses"
            value={0}
            icon="⚠️"
            color="red"
          />
        </div>

        <div className="bg-white rounded-xl border border-gray-200">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Documents</h2>
            <span className="text-sm text-gray-400">{documents.length} total</span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-400">Loading documents...</div>
          ) : documents.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-gray-500 font-medium">No documents yet</p>
              <p className="text-gray-400 text-sm mt-1">Upload your first document to get started</p>
              <button
                onClick={() => setShowUpload(true)}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition"
              >
                Upload Document
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Document Name</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Type</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Size</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Uploaded On</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Status</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50 transition">
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

                      {/* Action Buttons */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/documents/${doc.id}`)}
                            className="text-xs px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                          >
                            Open →
                          </button>
                          <button
                            onClick={(e) => handleDelete(e, doc.id)}
                            className="text-xs px-2 py-1.5 bg-gray-50 text-red-400 rounded-lg hover:bg-red-50 transition"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onUploadSuccess={fetchDocuments}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteDocId && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4 shadow-xl">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🗑️</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
              Delete Document
            </h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              Are you sure you want to delete this document? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteDocId(null)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}