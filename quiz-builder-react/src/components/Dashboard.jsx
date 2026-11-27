
import { useState } from 'react'

function Dashboard({
  isLoggedIn,
  onLogout,
  userName,
  userEmail,
  onNavigate
}) {
  const [allResults] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem('quizResults') || '[]'
      )
    } catch {
      return []
    }
  })

  // Get only the logged-in student's results
  const results = allResults.filter(
    (result) =>
      result.studentEmail?.toLowerCase() ===
      userEmail?.toLowerCase()
  )

  const totalAttempts = results.length

  const getPercentage = (result) => {
    return Number(
      result.percentage ??
      (result.totalMarks > 0
        ? (result.score / result.totalMarks) * 100
        : 0)
    )
  }

  const averageScore = totalAttempts > 0
    ? (
        results.reduce(
          (sum, result) => sum + getPercentage(result),
          0
        ) / totalAttempts
      ).toFixed(1)
    : 0

  const highestScore = totalAttempts > 0
    ? Math.max(
        ...results.map((result) => getPercentage(result))
      ).toFixed(1)
    : 0

  const recentResults = results.slice().reverse().slice(0, 3)

  if (!isLoggedIn) {
    return (
      <div className="dashboard">
        <p>Please log in to continue.</p>
      </div>
    )
  }

  return (
    <div className="dashboard student-dashboard">

      {/* WELCOME SECTION */}
      <div className="dashboard-header">
        <div className="dashboard-icon">🎓</div>

        <h2>Welcome, {userName}!</h2>

        <p>
          Keep learning, keep practicing and improve your coding skills!
        </p>
      </div>

      {/* STUDENT PROFILE */}
      <div className="student-profile-card">

        <div className="profile-avatar">
          {userName?.charAt(0).toUpperCase() || 'S'}
        </div>

        <div className="profile-details">
          <h3>{userName}</h3>
          <p>{userEmail}</p>
          <span className="student-role">Student Account</span>
        </div>

      </div>

      {/* PERFORMANCE OVERVIEW */}
      <h3 className="dashboard-heading">
        📊 Your Performance Overview
      </h3>

      <div className="student-stats">

        <div className="student-stat-card">
          <div className="stat-icon">📝</div>
          <h2>{totalAttempts}</h2>
          <p>Total Attempts</p>
        </div>

        <div className="student-stat-card">
          <div className="stat-icon">📈</div>
          <h2>{averageScore}%</h2>
          <p>Average Score</p>
        </div>

        <div className="student-stat-card">
          <div className="stat-icon">🏆</div>
          <h2>{highestScore}%</h2>
          <p>Highest Score</p>
        </div>

      </div>

      {/* STUDENT OPTIONS */}
      <h3 className="dashboard-heading">
        🚀 What Would You Like To Do?
      </h3>

      <div className="dashboard-options">

        <div className="dashboard-card attempt-card">
          <div className="option-icon">💻</div>

          <h3>Attempt Quiz</h3>

          <p>
            Test your programming knowledge by solving coding questions.
          </p>

          <button onClick={() => onNavigate('attemptQuiz')}>
            Start Quiz
          </button>
        </div>

        <div className="dashboard-card results-card">
          <div className="option-icon">🏆</div>

          <h3>View Results</h3>

          <p>
            Check your scores and review your quiz performance.
          </p>

          <button onClick={() => onNavigate('results')}>
            View Results
          </button>
        </div>

      </div>

      {/* RECENT ACTIVITY */}
      <div className="recent-activity-section">

        <h3>🕒 Recent Quiz Activity</h3>

        {recentResults.length === 0 ? (
          <div className="activity-empty">
            <p>
              No quiz activity yet. Start your first quiz!
            </p>
          </div>
        ) : (
          recentResults.map((result, index) => (
            <div
              className="activity-card"
              key={result.id || index}
            >

              <div>
                <h4>{result.quizTitle}</h4>

                <p>{result.date}</p>
              </div>

              <div className="activity-score">
                <strong>
                  {result.score} / {result.totalMarks}
                </strong>

                <span>
                  {getPercentage(result).toFixed(1)}%
                </span>
              </div>

            </div>
          ))
        )}

      </div>

      {/* LOGOUT */}
      <button
        className="logout-button"
        onClick={onLogout}
      >
        Logout
      </button>

    </div>
  )
}

export default Dashboard
