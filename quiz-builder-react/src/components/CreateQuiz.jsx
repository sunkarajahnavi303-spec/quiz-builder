
import { useState } from 'react'

function CreateQuiz() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const [questionTitle, setQuestionTitle] = useState('')
  const [questionDescription, setQuestionDescription] = useState('')
  const [language, setLanguage] = useState('C')
  const [sampleInput, setSampleInput] = useState('')
  const [sampleOutput, setSampleOutput] = useState('')
  const [marks, setMarks] = useState(10)

  const [questions, setQuestions] = useState([])

  function addQuestion() {
    if (
      !questionTitle.trim() ||
      !questionDescription.trim() ||
      !sampleInput.trim() ||
      !sampleOutput.trim()
    ) {
      alert('Please fill in all question details.')
      return
    }

    const newQuestion = {
      id: Date.now(),
      title: questionTitle,
      description: questionDescription,
      language,
      sampleInput,
      sampleOutput,
      marks: Number(marks)
    }

    setQuestions([...questions, newQuestion])

    setQuestionTitle('')
    setQuestionDescription('')
    setLanguage('C')
    setSampleInput('')
    setSampleOutput('')
    setMarks(10)

    alert('Coding question added successfully!')
  }

  function saveQuiz() {
    if (!title.trim() || questions.length === 0) {
      alert('Enter a quiz title and add at least one question.')
      return
    }

    const quizzes = JSON.parse(
      localStorage.getItem('quizzes') || '[]'
    )

    const newQuiz = {
      id: Date.now(),
      title: title.trim(),
      description: description.trim(),
      questions: questions
    }

    quizzes.push(newQuiz)

    localStorage.setItem('quizzes', JSON.stringify(quizzes))

    alert('Coding quiz saved successfully!')

    setTitle('')
    setDescription('')
    setQuestions([])
  }

  return (
    <div className="create-quiz-page">

      <div className="create-quiz-header">
        <div className="create-quiz-icon">📝</div>
        <h2>Create Your Coding Quiz</h2>
        <p>Build your own programming challenges for students.</p>
      </div>

      {/* Quiz Details */}

      <div className="quiz-section">
        <h3>📚 Quiz Details</h3>

        <label>Quiz Title</label>
        <input
          type="text"
          placeholder="Enter Quiz Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />

        <label>Quiz Description</label>
        <textarea
          placeholder="Enter Quiz Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </div>

      {/* Coding Question */}

      <div className="quiz-section">
        <h3>💻 Add Coding Question</h3>

        <label>Question Title</label>
        <input
          type="text"
          placeholder="Enter Question Title"
          value={questionTitle}
          onChange={e => setQuestionTitle(e.target.value)}
        />

        <label>Problem Description</label>
        <textarea
          placeholder="Describe the coding problem"
          value={questionDescription}
          onChange={e => setQuestionDescription(e.target.value)}
        />

        <label>Programming Language</label>
        <select
          value={language}
          onChange={e => setLanguage(e.target.value)}
        >
          <option value="C">C</option>
          <option value="C++">C++</option>
          <option value="Java">Java</option>
          <option value="Python">Python</option>
        </select>

        <div className="sample-grid">
          <div>
            <label>Sample Input</label>
            <textarea
              placeholder="Enter sample input"
              value={sampleInput}
              onChange={e => setSampleInput(e.target.value)}
            />
          </div>

          <div>
            <label>Expected Output</label>
            <textarea
              placeholder="Enter expected output"
              value={sampleOutput}
              onChange={e => setSampleOutput(e.target.value)}
            />
          </div>
        </div>

        <label>Marks</label>
        <input
          type="number"
          min="1"
          value={marks}
          onChange={e => setMarks(e.target.value)}
        />

        <button
          type="button"
          className="add-question-button"
          onClick={addQuestion}
        >
          + Add Coding Question
        </button>
      </div>

      {/* Question Preview */}

      <div className="quiz-section preview-section">
        <h3>📋 Question Preview ({questions.length})</h3>

        {questions.length === 0 ? (
          <p className="empty-preview">
            No questions added yet. Start adding coding questions!
          </p>
        ) : (
          <div className="question-list">
            {questions.map((q, index) => (
              <div className="question-preview-card" key={q.id}>
                <h4>Question {index + 1}: {q.title}</h4>

                <p>{q.description}</p>

                <p><strong>Language:</strong> {q.language}</p>

                <p><strong>Sample Input:</strong></p>
                <pre>{q.sampleInput}</pre>

                <p><strong>Expected Output:</strong></p>
                <pre>{q.sampleOutput}</pre>

                <p><strong>Marks:</strong> {q.marks}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        className="save-quiz-button"
        onClick={saveQuiz}
      >
        💾 Save Quiz
      </button>

    </div>
  )
}

export default CreateQuiz
