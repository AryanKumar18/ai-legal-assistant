import { useState } from 'react'
import api from '../services/api'

const severityConfig = {
  High: 'bg-red-50 text-red-600 border-red-200',
  Medium: 'bg-yellow-50 text-yellow-600 border-yellow-200',
  Low: 'bg-green-50 text-green-600 border-green-200'
}

export default function RiskTab({ document, darkMode }) {
  const [risks, setRisks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [analyzed, setAnalyzed] = useState(false)

  const analyzeRisks = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await api.post(`/ai/${document.id}/risks`)
      setRisks(response.data.risks)
      setAnalyzed(true)
    } catch (err) {
      setError('Failed to analyze risks. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Risk Analysis</h2>
            <p className="text-sm text-gray-500 mt-1">
              AI identifies potentially risky clauses
            </p>
          </div>
          <button
            onClick={analyzeRisks}
            disabled={loading}
            className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition disabled:opacity-50"
          >
            {loading ? 'Analyzing...' : analyzed ? 'Re-analyze' : 'Analyze Risks'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-3 text-gray-500 py-8 justify-center">
            <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm">Scanning for risky clauses...</span>
          </div>
        )}

        {!loading && analyzed && risks.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">✅</div>
            <p className="text-gray-500 font-medium">No risks detected</p>
            <p className="text-gray-400 text-sm mt-1">This document looks clean!</p>
          </div>
        )}

        {!loading && risks.length > 0 && (
          <div className="space-y-3">
            {risks.map((risk, i) => (
              <div
                key={i}
                className={`border rounded-xl p-4 ${severityConfig[risk.severity]}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-sm">{risk.clause}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${severityConfig[risk.severity]}`}>
                    {risk.severity}
                  </span>
                </div>
                <p className="text-sm opacity-80">{risk.description}</p>
              </div>
            ))}
          </div>
        )}

        {!loading && !analyzed && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">⚠️</div>
            <p className="text-gray-500 font-medium">Not analyzed yet</p>
            <p className="text-gray-400 text-sm mt-1">
              Click "Analyze Risks" to scan this document
            </p>
          </div>
        )}
      </div>
    </div>
  )
}