
import { useState } from 'react'

function readStorage(key) {
  try {
    const data = JSON.parse(localStorage.getItem(key) || '[]')
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

function AdminAnalytics() {
  const [students, setStudents] = useState(() =>
    readStorage('quizUsers')
  )

  const [quizzes, setQuizzes] = useState(() =>
    readStorage('quizzes')
  )

  const [results, setResults] = useState(() =>
    readStorage('quizResults')
  )

  const [violations, setViolations] = useState(() =>
    readStorage('violationHistory')
  )

  function refreshAnalytics() {
    setStudents(readStorage('quizUsers'))
    setQuizzes(readStorage('quizzes'))
    setResults(readStorage('quizResults'))
    setViolations(readStorage('violationHistory'))
  }

  // Count registered students
  const totalStudents = students.filter(
    user => user.role === 'student'
  ).length

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
      (Number(result.totalMarks) > 0
        ? (Number(result.score) / Number(result.totalMarks)) * 100
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
    violation => violation.status === 'Terminated'
  ).length

  const warningCount = violations.filter(
    violation => violation.status === 'Warning'
  ).length

  // Calculate performance for each quiz
  const quizPerformance = quizzes.map(quiz => {
    const quizResults = results.filter(
      result => result.quizTitle === quiz.title
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
      average: average
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

        <button onClick={refreshAnalytics}>
          🔄 Refresh Analytics
        </button>
      </div>

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

    </div>
  )
}

export default AdminAnalytics
