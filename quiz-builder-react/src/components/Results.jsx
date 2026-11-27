
import { useState } from 'react'

function Results({ currentUser }) {
  const [allResults] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem('quizResults') || '[]'
      )
    } catch {
      return []
    }
  })

  // Display only the logged-in student's results
  const results = allResults.filter(
    (result) =>
      result.studentEmail?.toLowerCase() ===
      currentUser?.email?.toLowerCase()
  )

  const sortedResults = results.slice().reverse()

  const totalAttempts = results.length

  const averagePercentage = totalAttempts > 0
    ? (
        results.reduce(
          (sum, result) =>
            sum + Number(
              result.percentage ??
              (result.totalMarks > 0
                ? (result.score / result.totalMarks) * 100
                : 0)
            ),
          0
        ) / totalAttempts
      ).toFixed(1)
    : 0

  const bestScore = totalAttempts > 0
    ? Math.max(
        ...results.map((result) =>
          result.totalMarks > 0
            ? (result.score / result.totalMarks) * 100
            : 0
        )
      ).toFixed(1)
    : 0

  function getPerformance(percentage) {
    if (percentage >= 90) return 'Excellent Performance! 🌟'
    if (percentage >= 70) return 'Great Job! 👏'
    if (percentage >= 50) return 'Good Effort! 👍'
    return 'Keep Practicing! 💪'
  }

  return (
    <div className="results-page">

      <div className="results-header">
        <div className="results-icon">🏆</div>

        <h2>My Quiz Results</h2>

        <p>
          Welcome, {currentUser?.name || 'Student'}!
          Track your progress and celebrate your achievements!
        </p>
      </div>

      {totalAttempts === 0 ? (
        <div className="results-empty">
          <div className="empty-results-icon">📊</div>

          <h3>No Results Yet</h3>

          <p>
            You haven't attempted any quizzes yet.
            Complete your first quiz to see your performance here.
          </p>
        </div>
      ) : (
        <>

          {/* SUMMARY CARDS */}
          <div className="results-summary">

            <div className="summary-card">
              <div className="summary-icon">📝</div>
              <h3>{totalAttempts}</h3>
              <p>Total Attempts</p>
            </div>

            <div className="summary-card">
              <div className="summary-icon">📈</div>
              <h3>{averagePercentage}%</h3>
              <p>Average Score</p>
            </div>

            <div className="summary-card">
              <div className="summary-icon">🥇</div>
              <h3>{bestScore}%</h3>
              <p>Best Performance</p>
            </div>

          </div>

          {/* QUIZ HISTORY */}
          <div className="results-list-section">

            <h3>📚 Your Quiz History</h3>

            {sortedResults.map((result, index) => {

              const percentage = Number(
                result.percentage ??
                (result.totalMarks > 0
                  ? (result.score / result.totalMarks) * 100
                  : 0)
              )

              return (
                <div
                  className="result-card"
                  key={result.id || index}
                >

                  <div className="result-card-header">

                    <div>
                      <h3>{result.quizTitle}</h3>

                      <p className="result-date">
                        📅 {result.date}
                      </p>
                    </div>

                    <span className="result-trophy">
                      🏆
                    </span>

                  </div>

                  {/* SCORE DETAILS */}
                  <div className="result-score-section">

                    <div className="result-score">
                      <h2>
                        {result.score} / {result.totalMarks}
                      </h2>

                      <p>Marks Obtained</p>
                    </div>

                    <div className="result-percentage">
                      {percentage.toFixed(1)}%
                    </div>

                  </div>

                  {/* PROGRESS BAR */}
                  <div className="result-progress-track">

                    <div
                      className="result-progress-fill"
                      style={{
                        width: `${Math.max(
                          0,
                          Math.min(100, percentage)
                        )}%`
                      }}
                    />

                  </div>

                  <h4 className="performance-message">
                    {getPerformance(percentage)}
                  </h4>

                  {/* QUESTION-WISE REVIEW */}
                  <div className="question-review-section">

                    <h4>📋 Question-wise Review</h4>

                    {Object.entries(
                      result.answers || {}
                    ).length === 0 ? (
                      <p>
                        No question-wise details available.
                      </p>
                    ) : (
                      Object.entries(
                        result.answers || {}
                      ).map(([questionIndex, answer]) => (

                        <div
                          className="review-result-item"
                          key={questionIndex}
                        >

                          <span>
                            Question {Number(questionIndex) + 1}
                          </span>

                          <span
                            className={
                              answer.isCorrect
                                ? 'review-correct'
                                : 'review-incorrect'
                            }
                          >
                            {answer.isCorrect
                              ? '✓ Correct'
                              : '✗ Incorrect'}
                          </span>

                          <strong>
                            {answer.earnedMarks} marks
                          </strong>

                        </div>

                      ))
                    )}

                  </div>

                </div>
              )
            })}

          </div>

        </>
      )}

    </div>
  )
}

export default Results
