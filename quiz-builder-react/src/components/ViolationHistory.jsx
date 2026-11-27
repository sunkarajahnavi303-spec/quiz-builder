
import { useState } from 'react'

function ViolationHistory() {
  const [violations, setViolations] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem('violationHistory') || '[]'
      ).reverse()
    } catch {
      return []
    }
  })

  function refreshHistory() {
    try {
      setViolations(
        JSON.parse(
          localStorage.getItem('violationHistory') || '[]'
        ).reverse()
      )
    } catch {
      setViolations([])
    }
  }

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

        <button onClick={refreshHistory}>
          Refresh History
        </button>

        {violations.length === 0 ? (
          <div className="activity-empty">
            <p>No violations recorded yet.</p>
          </div>
        ) : (
          violations.map((violation, index) => (
            <div
              className="activity-card"
              key={violation.id || index}
            >
              <div>
                <h4>
                  {violation.studentName || 'Unknown Student'}
                </h4>

                <p>
                  Email: {violation.studentEmail || 'Not available'}
                </p>

                <p>
                  Quiz: {violation.quizTitle || 'Unknown Quiz'}
                </p>

                <p>
                  Reason: {violation.reason || 'Not specified'}
                </p>

                <p>
                  Date: {violation.date || 'Not available'}
                </p>

                <p>
                  Violation Number: {violation.violationNumber || '-'}
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
