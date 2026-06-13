import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import api from '../services/api'
import SummaryTab from '../components/SummaryTab'
import ChatTab from '../components/ChatTab'
import RiskTab from '../components/RiskTab'

const TABS = ['Overview', 'Summary', 'Chat', 'Risks', 'Metadata']

export default function DocumentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [document, setDocument] = useState(null)
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'Overview')
  const [loading, setLoading] = useState(true)
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    fetchDocument()
  }, [id])

  const fetchDocument = async () => {
    try {
      const response = await api.get(`/documents/${id}`)
      setDocument(response.data)
    } catch (err) {
      console.error('Failed to fetch document', err)
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading document...</p>
      </div>
    )
  }

  const headerBg = darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
  const headerText = darkMode ? 'text-gray-100' : 'text-gray-900'
  const headerMuted = darkMode ? 'text-gray-400' : 'text-gray-400'
  const tabActive = darkMode ? 'border-indigo-400 text-indigo-400' : 'border-indigo-600 text-indigo-600'
  const tabInactive = darkMode ? 'border-transparent text-gray-500 hover:text-gray-300' : 'border-transparent text-gray-500 hover:text-gray-700'
  const pageBg = darkMode ? 'bg-gray-800' : 'bg-gray-50'

  return (
    <div className={`min-h-screen ${pageBg} transition-colors duration-200`}>

      {/* Header */}
      <div className={`${headerBg} border-b px-8 py-4 transition-colors duration-200`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className={`text-sm flex items-center gap-1 ${headerMuted} hover:text-indigo-500 transition`}
            >
              ← Back to Documents
            </button>
            <h1 className={`text-lg font-semibold ${headerText}`}>
              {document?.original_filename}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
              document?.status === 'processed'
                ? 'bg-green-50 text-green-600'
                : 'bg-yellow-50 text-yellow-600'
            }`}>
              {document?.status}
            </span>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`px-3 py-1.5 rounded-lg text-sm border transition ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? '☀️ Light' : '🌙 Dark'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 mt-4">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-sm pb-2 font-medium border-b-2 transition ${
                activeTab === tab ? tabActive : tabInactive
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className={`p-8 transition-colors duration-200`}>
        {activeTab === 'Overview' && <OverviewTab document={document} darkMode={darkMode} />}
        {activeTab === 'Summary' && <SummaryTab document={document} onUpdate={fetchDocument} darkMode={darkMode} />}
        {activeTab === 'Chat' && <ChatTab document={document} darkMode={darkMode} />}
        {activeTab === 'Risks' && <RiskTab document={document} darkMode={darkMode} />}
        {activeTab === 'Metadata' && <MetadataTab document={document} darkMode={darkMode} />}
      </div>
    </div>
  )
}

function OverviewTab({ document, darkMode }) {
  const cardBg = darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
  const labelText = darkMode ? 'text-gray-400' : 'text-gray-500'
  const valueText = darkMode ? 'text-gray-100' : 'text-gray-900'
  const divider = darkMode ? 'border-gray-700' : 'border-gray-100'
  const heading = darkMode ? 'text-gray-100' : 'text-gray-900'

  return (
    <div className="w-full">
      <div className={`rounded-xl border p-6 ${cardBg}`}>
        <h2 className={`text-lg font-semibold mb-4 ${heading}`}>Document Overview</h2>
        <div className="space-y-3">
          {[
            { label: 'File Name', value: document.original_filename },
            { label: 'File Type', value: document.file_type.toUpperCase() },
            { label: 'File Size', value: `${document.file_size} KB` },
            { label: 'Status', value: document.status },
            { label: 'Uploaded', value: new Date(document.uploaded_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) },
          ].map(({ label, value }) => (
            <div key={label} className={`flex justify-between py-2 border-b ${divider}`}>
              <span className={`text-sm ${labelText}`}>{label}</span>
              <span className={`text-sm font-medium ${valueText}`}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function MetadataTab({ document, darkMode }) {
  const cardBg = darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
  const heading = darkMode ? 'text-gray-100' : 'text-gray-900'
  const codeBg = darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-50 text-gray-600'

  return (
    <div className="w-full">
      <div className={`rounded-xl border p-6 ${cardBg}`}>
        <h2 className={`text-lg font-semibold mb-4 ${heading}`}>Metadata</h2>
        <pre className={`text-sm rounded-lg p-4 overflow-auto ${codeBg}`}>
          {JSON.stringify(document, null, 2)}
        </pre>
      </div>
    </div>
  )
}