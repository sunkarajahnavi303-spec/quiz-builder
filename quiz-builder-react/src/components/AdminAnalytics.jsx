
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function AdminAnalytics() {
  const [students, setStudents] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [results, setResults] = useState([])
  const [violations, setViolations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function refreshAnalytics() {
    setLoading(true)
    setError('')

    const [
      studentsResponse,
      quizzesResponse,
      resultsResponse,
      violationsResponse
    ] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, role')
        .eq('role', 'student'),

      supabase
        .from('quizzes')
        .select('id, title'),

      supabase
        .from('quiz_results')
        .select('quiz_id, quiz_title, score, total_marks, percentage'),

      supabase
        .from('violation_history')
        .select('status, reason')
    ])

    const errors = [
      studentsResponse.error,
      quizzesResponse.error,
      resultsResponse.error,
      violationsResponse.error
    ].filter(Boolean)

    if (errors.length > 0) {
      console.error('Error loading analytics:', errors)
      setError(
        'Unable to load analytics. Please check your admin access and try again.'
      )
    } else {
      setStudents(studentsResponse.data || [])
      setQuizzes(quizzesResponse.data || [])
      setResults(resultsResponse.data || [])
      setViolations(violationsResponse.data || [])
    }

    setLoading(false)
  }

  useEffect(() => {
    refreshAnalytics()
  }, [])

  // Count registered students
  const totalStudents = students.length

  // Total quizzes
  const totalQuizzes = quizzes.length

  // Total attempts
  const totalAttempts = results.length

  // Total violations
  const totalViolations = violations.length

  // Calculate percentage
  function getPercentage(result) {
    const percentage = Number(
      result.percentage ??
      (Number(result.total_marks) > 0
        ? (Number(result.score) / Number(result.total_marks)) * 100
        : 0)
    )

    return Number.isFinite(percentage) ? percentage : 0
  }

  // Average score
  const averageScore = totalAttempts > 0
    ? (
        results.reduce(
          (sum, result) => sum + getPercentage(result),
          0
        ) / totalAttempts
      ).toFixed(1)
    : '0.0'

  // Violation categories
  const terminatedCount = violations.filter(
    violation =>
      violation.status?.toLowerCase() === 'terminated'
  ).length

  const warningCount = violations.filter(
    violation =>
      violation.status?.toLowerCase() === 'warning'
  ).length

  // Calculate performance for each quiz
  const quizPerformance = quizzes.map(quiz => {
    const quizResults = results.filter(
      result => result.quiz_id === quiz.id
    )

    const average = quizResults.length > 0
      ? quizResults.reduce(
          (sum, result) => sum + getPercentage(result),
          0
        ) / quizResults.length
      : 0

    return {
      title: quiz.title,
      attempts: quizResults.length,
      average
    }
  }).filter(quiz => quiz.attempts > 0).slice(0, 5)

  const maximumAverage = Math.max(
    ...quizPerformance.map(quiz => quiz.average),
    1
  )

  // Violation reason counts
  const violationReasons = violations.reduce((acc, violation) => {
    const reason = violation.reason || 'Other'
    acc[reason] = (acc[reason] || 0) + 1
    return acc
  }, {})

  const reasonEntries = Object.entries(violationReasons)
    .sort((a, b) => b[1] - a[1])

  const maximumReasonCount = Math.max(
    ...reasonEntries.map(item => item[1]),
    1
  )

  return (
    <div className="admin-analytics">

      {/* HEADER */}
      <div className="analytics-header">
        <div className="analytics-icon">📊</div>

        <h2>Admin Analytics Dashboard</h2>

        <p>
          Monitor students, quizzes, performance and exam security.
        </p>

        <button
          onClick={refreshAnalytics}
          disabled={loading}
        >
          {loading ? 'Loading...' : '🔄 Refresh Analytics'}
        </button>
      </div>

      {error ? (
        <p className="analytics-empty">{error}</p>
      ) : loading ? (
        <p className="analytics-empty">
          Loading analytics data...
        </p>
      ) : (
        <>

          {/* STATISTICS */}
          <div className="analytics-stats">

            <div className="analytics-card">
              <div className="analytics-card-icon">👨‍🎓</div>
              <h2>{totalStudents}</h2>
              <p>Total Students</p>
            </div>

            <div className="analytics-card">
              <div className="analytics-card-icon">📚</div>
              <h2>{totalQuizzes}</h2>
              <p>Total Quizzes</p>
            </div>

            <div className="analytics-card">
              <div className="analytics-card-icon">📝</div>
              <h2>{totalAttempts}</h2>
              <p>Total Attempts</p>
            </div>

            <div className="analytics-card">
              <div className="analytics-card-icon">🛡️</div>
              <h2>{totalViolations}</h2>
              <p>Total Violations</p>
            </div>

            <div className="analytics-card">
              <div className="analytics-card-icon">🏆</div>
              <h2>{averageScore}%</h2>
              <p>Average Score</p>
            </div>

          </div>

          {/* QUIZ PERFORMANCE */}
          <div className="analytics-section">
            <h3>📈 Quiz Performance</h3>

            {quizPerformance.length === 0 ? (
              <p className="analytics-empty">
                No quiz attempts available yet.
              </p>
            ) : (
              quizPerformance.map((quiz, index) => (
                <div className="analytics-bar-item" key={index}>
                  <div className="analytics-bar-heading">
                    <strong>{quiz.title}</strong>
                    <span>{quiz.average.toFixed(1)}%</span>
                  </div>

                  <div className="analytics-bar-track">
                    <div
                      className="analytics-bar-fill performance-fill"
                      style={{
                        width: `${Math.max(
                          0,
                          Math.min(100, (quiz.average / maximumAverage) * 100)
                        )}%`
                      }}
                    />
                  </div>

                  <small>{quiz.attempts} attempts</small>
                </div>
              ))
            )}
          </div>

          {/* VIOLATION STATISTICS */}
          <div className="analytics-section">
            <h3>🛡️ Examination Security Overview</h3>

            <div className="violation-summary">

              <div className="violation-stat warning-stat">
                <h2>{warningCount}</h2>
                <p>Warnings</p>
              </div>

              <div className="violation-stat terminated-stat">
                <h2>{terminatedCount}</h2>
                <p>Terminated Exams</p>
              </div>

            </div>

            <h4>Violation Reasons</h4>

            {reasonEntries.length === 0 ? (
              <p className="analytics-empty">
                No violations recorded yet.
              </p>
            ) : (
              reasonEntries.map(([reason, count]) => (
                <div className="analytics-bar-item" key={reason}>
                  <div className="analytics-bar-heading">
                    <strong>{reason}</strong>
                    <span>{count}</span>
                  </div>

                  <div className="analytics-bar-track">
                    <div
                      className="analytics-bar-fill violation-fill"
                      style={{
                        width: `${(count / maximumReasonCount) * 100}%`
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>

        </>
      )}

    </div>
  )
}

export default AdminAnalytics
