
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function Results({ currentUser }) {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchResults() {
      if (!currentUser?.id) {
        setResults([])
        setLoading(false)
        return
      }

      setLoading(true)
      setError('')

      const { data, error } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('student_id', currentUser.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching results:', error)
        setError('Unable to load your results. Please try again.')
        setResults([])
      } else {
        setResults(data || [])
      }

      setLoading(false)
    }

    fetchResults()
  }, [currentUser?.id])

  const totalAttempts = results.length

  const averagePercentage = totalAttempts > 0
    ? (
        results.reduce(
          (sum, result) =>
            sum + Number(result.percentage ?? (
              Number(result.total_marks) > 0
                ? (Number(result.score) / Number(result.total_marks)) * 100
                : 0
            )),
          0
        ) / totalAttempts
      ).toFixed(1)
    : 0

  const bestScore = totalAttempts > 0
    ? Math.max(
        ...results.map((result) =>
          Number(result.total_marks) > 0
            ? (Number(result.score) / Number(result.total_marks)) * 100
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

      {loading ? (
        <div className="results-empty">
          <h3>Loading your results...</h3>
        </div>
      ) : error ? (
        <div className="results-empty">
          <h3>{error}</h3>
        </div>
      ) : totalAttempts === 0 ? (
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

            {results.map((result) => {

              const percentage = Number(
                result.percentage ?? (
                  Number(result.total_marks) > 0
                    ? (Number(result.score) / Number(result.total_marks)) * 100
                    : 0
                )
              )

              const resultDate = result.created_at
                ? new Date(result.created_at).toLocaleString()
                : 'Date unavailable'

              return (
                <div
                  className="result-card"
                  key={result.id}
                >

                  <div className="result-card-header">

                    <div>
                      <h3>{result.quiz_title || 'Quiz'}</h3>

                      <p className="result-date">
                        📅 {resultDate}
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
                        {result.score} / {result.total_marks}
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
