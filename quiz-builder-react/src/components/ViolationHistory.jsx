
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function ViolationHistory() {
  const [violations, setViolations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function refreshHistory() {
    setLoading(true)
    setError('')

    const { data, error } = await supabase
      .from('violation_history')
      .select('*')
      .order('occurred_at', { ascending: false })

    if (error) {
      console.error('Error fetching violation history:', error)
      setError('Unable to load violation history. Please try again.')
      setViolations([])
    } else {
      setViolations(data || [])
    }

    setLoading(false)
  }

  useEffect(() => {
    refreshHistory()
  }, [])

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="dashboard-icon">🛡️</div>
        <h2>Violation History</h2>
        <p>
          Monitor student activity and examination security violations.
        </p>
      </div>

      <div className="recent-activity-section">
        <h3>📋 Recorded Violations</h3>

        <button onClick={refreshHistory} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh History'}
        </button>

        {loading ? (
          <div className="activity-empty">
            <p>Loading violation records...</p>
          </div>
        ) : error ? (
          <div className="activity-empty">
            <p>{error}</p>
          </div>
        ) : violations.length === 0 ? (
          <div className="activity-empty">
            <p>No violations recorded yet.</p>
          </div>
        ) : (
          violations.map((violation) => (
            <div
              className="activity-card"
              key={violation.id}
            >
              <div>
                <h4>
                  {violation.student_name || 'Unknown Student'}
                </h4>

                <p>
                  Email: {violation.student_email || 'Not available'}
                </p>

                <p>
                  Quiz: {violation.quiz_title || 'Unknown Quiz'}
                </p>

                <p>
                  Reason: {violation.reason || 'Not specified'}
                </p>

                <p>
                  Date: {violation.occurred_at
                    ? new Date(violation.occurred_at).toLocaleString()
                    : 'Not available'}
                </p>

                <p>
                  Violation Number: {violation.violation_number || '-'}
                </p>
              </div>

              <div className="activity-score">
                <strong>
                  {violation.status || 'Warning'}
                </strong>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default ViolationHistory
