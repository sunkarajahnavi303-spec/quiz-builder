
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

function ManageQuizzes() {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)

  // Load quizzes and their questions from Supabase
  async function fetchQuizzes() {
    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select(`
          id,
          title,
          description,
          created_at,
          questions (
            id,
            title,
            description,
            language,
            marks,
            question_order,
            sample_input,
            sample_output
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      const formattedQuizzes = (data || []).map(quiz => ({
        ...quiz,
        questions: (quiz.questions || [])
          .sort((a, b) => a.question_order - b.question_order)
          .map(question => ({
            ...question,
            sampleInput: question.sample_input,
            sampleOutput: question.sample_output
          }))
      }))

      setQuizzes(formattedQuizzes)
    } catch (error) {
      console.error('Quiz loading error:', error)
      alert(error.message || 'Unable to load quizzes.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuizzes()
  }, [])

  // Delete a quiz from Supabase
  async function deleteQuiz(id) {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this quiz?'
    )

    if (!confirmDelete) return

    try {
      const { error } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', id)

      if (error) throw error

      setQuizzes(previous =>
        previous.filter(quiz => quiz.id !== id)
      )

      alert('Quiz deleted successfully!')
    } catch (error) {
      console.error('Quiz deletion error:', error)
      alert(error.message || 'Unable to delete quiz.')
    }
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

        {loading ? (
          <p>Loading quizzes...</p>
        ) : quizzes.length === 0 ? (
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
