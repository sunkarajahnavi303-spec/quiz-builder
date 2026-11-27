
import { useState } from 'react'

function ManageQuizzes() {
  const [quizzes, setQuizzes] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem('quizzes') || '[]'
      )
    } catch {
      return []
    }
  })

  // Delete a quiz
  function deleteQuiz(id) {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this quiz?'
    )

    if (!confirmDelete) {
      return
    }

    const updatedQuizzes = quizzes.filter(
      (quiz) => quiz.id !== id
    )

    setQuizzes(updatedQuizzes)

    localStorage.setItem(
      'quizzes',
      JSON.stringify(updatedQuizzes)
    )

    alert('Quiz deleted successfully!')
  }

  return (
    <div className="create-quiz-page">

      {/* PAGE HEADER */}
      <div className="create-quiz-header">
        <div className="create-quiz-icon">📚</div>

        <h2>Manage Quizzes</h2>

        <p>
          View, monitor and manage all coding quizzes.
        </p>
      </div>

      {/* QUIZ SUMMARY */}
      <div className="quiz-section">

        <h3>
          Total Quizzes: {quizzes.length}
        </h3>

        {quizzes.length === 0 ? (
          <div className="results-empty">
            <div className="empty-results-icon">📭</div>

            <h3>No Quizzes Available</h3>

            <p>
              You haven't created any quizzes yet.
              Create your first coding quiz!
            </p>
          </div>
        ) : (

          <div className="question-list">

            {quizzes.map((quiz, index) => {

              const totalMarks = (
                quiz.questions || []
              ).reduce(
                (total, question) =>
                  total + Number(question.marks || 0),
                0
              )

              return (
                <div
                  className="question-preview-card"
                  key={quiz.id}
                >

                  <h3>
                    {index + 1}. {quiz.title}
                  </h3>

                  <p>
                    {quiz.description ||
                      'No description provided.'}
                  </p>

                  <div className="quiz-management-details">

                    <p>
                      <strong>Quiz ID:</strong> {quiz.id}
                    </p>

                    <p>
                      <strong>Total Questions:</strong>{' '}
                      {quiz.questions?.length || 0}
                    </p>

                    <p>
                      <strong>Total Marks:</strong>{' '}
                      {totalMarks}
                    </p>

                  </div>

                  {/* QUESTION DETAILS */}
                  <div className="question-review-section">

                    <h4>Questions in this Quiz</h4>

                    {(quiz.questions || []).map(
                      (question, questionIndex) => (
                        <div
                          className="review-result-item"
                          key={question.id || questionIndex}
                        >
                          <span>
                            Q{questionIndex + 1}. {question.title}
                          </span>

                          <span>
                            {question.language}
                          </span>

                          <span>
                            {question.marks} Marks
                          </span>
                        </div>
                      )
                    )}

                  </div>

                  {/* DELETE BUTTON */}
                  <button
                    type="button"
                    className="logout-button"
                    onClick={() => deleteQuiz(quiz.id)}
                  >
                    🗑️ Delete Quiz
                  </button>

                </div>
              )
            })}

          </div>
        )}

      </div>

    </div>
  )
}
export default ManageQuizzes
