
import { useState, useEffect, useRef } from 'react'
import {
  FaceDetector,
  FilesetResolver
} from '@mediapipe/tasks-vision'

function AttemptQuiz({ currentUser }) {
  const [quizzes] = useState(() => {
    try {
      const savedQuizzes = JSON.parse(
        localStorage.getItem('quizzes') || '[]'
      )

      return savedQuizzes.filter(
        quiz =>
          quiz &&
          Array.isArray(quiz.questions) &&
          quiz.questions.length > 0
      )
    } catch {
      return []
    }
  })

  const [selectedQuiz, setSelectedQuiz] = useState(null)
  const [selectedQuestion, setSelectedQuestion] = useState(0)
  const [code, setCode] = useState('')
  const [programOutput, setProgramOutput] = useState('')
  const [answers, setAnswers] = useState({})
  const [finished, setFinished] = useState(false)
  const [terminated, setTerminated] = useState(false)

  // CAMERA MONITORING
  const [cameraStream, setCameraStream] = useState(null)
  const [cameraMessage, setCameraMessage] = useState('')
  const videoRef = useRef(null)
  const cameraStreamRef = useRef(null)

  // FACE DETECTION
  const [faceStatus, setFaceStatus] = useState(
    'Waiting for face detection...'
  )

  const faceDetectorRef = useRef(null)

  // EXAM SECURITY
  const [tabSwitchCount, setTabSwitchCount] = useState(0)
  const [tabWarning, setTabWarning] = useState('')

  const violationCountRef = useRef(0)
  const terminatedRef = useRef(false)
  const securityActiveRef = useRef(false)
  const recordViolationRef = useRef(null)

  // VIOLATION HISTORY
  const examSessionIdRef = useRef(null)

  // DISPLAY CAMERA STREAM
  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream
    }
  }, [cameraStream])

  // STOP CAMERA WHEN COMPONENT IS REMOVED
  useEffect(() => {
    return () => {
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach(track => {
          track.stop()
        })

        cameraStreamRef.current = null
      }

      if (faceDetectorRef.current) {
        faceDetectorRef.current.close()
        faceDetectorRef.current = null
      }
    }
  }, [])

  // STOP CAMERA
  function stopCamera() {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(track => {
        track.stop()
      })

      cameraStreamRef.current = null
    }

    setCameraStream(null)
  }

  // TERMINATE EXAM
  function terminateExam() {
    if (terminatedRef.current) return

    terminatedRef.current = true
    securityActiveRef.current = false

    setTerminated(true)

    setTabWarning(
      'Examination terminated due to repeated security violations.'
    )

    stopCamera()

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {})
    }
  }

  // RECORD SECURITY VIOLATION
  function recordViolation(message) {
    if (
      terminatedRef.current ||
      !securityActiveRef.current
    ) {
      return
    }

    violationCountRef.current += 1

    const count = violationCountRef.current

    setTabSwitchCount(count)

    const violation = {
      id: `${Date.now()}-${count}`,

      sessionId: examSessionIdRef.current,

      studentName: currentUser?.name || 'Student',
      studentEmail: currentUser?.email || '',

      quizTitle: selectedQuiz?.title || 'Unknown Quiz',

      reason: message,

      violationNumber: count,

      date: new Date().toLocaleString(),

      timestamp: new Date().toISOString(),

      status: count >= 3 ? 'Terminated' : 'Warning'
    }

    // SAVE VIOLATION HISTORY
    try {
      const previousHistory = JSON.parse(
        localStorage.getItem('violationHistory') || '[]'
      )

      previousHistory.push(violation)

      localStorage.setItem(
        'violationHistory',
        JSON.stringify(previousHistory)
      )
    } catch (error) {
      console.error(
        'Unable to save violation history:',
        error
      )
    }

    if (count >= 3) {
      terminateExam()
    } else {
      setTabWarning(
        `${message} Warning ${count} of 3.`
      )
    }
  }

  recordViolationRef.current = recordViolation

  // TAB AND FULLSCREEN MONITORING
  useEffect(() => {
    if (!selectedQuiz || finished || terminated) return

    function handleVisibilityChange() {
      if (document.hidden) {
        recordViolationRef.current?.(
          'You switched away from the examination tab.'
        )
      }
    }

    function handleFullscreenChange() {
      if (!document.fullscreenElement) {
        recordViolationRef.current?.(
          'You exited fullscreen mode.'
        )
      }
    }

    document.addEventListener(
      'visibilitychange',
      handleVisibilityChange
    )

    document.addEventListener(
      'fullscreenchange',
      handleFullscreenChange
    )

    return () => {
      document.removeEventListener(
        'visibilitychange',
        handleVisibilityChange
      )

      document.removeEventListener(
        'fullscreenchange',
        handleFullscreenChange
      )
    }
  }, [selectedQuiz, finished, terminated])

  // CONTINUOUS AI FACE DETECTION
  useEffect(() => {
    if (
      !selectedQuiz ||
      !cameraStream ||
      finished ||
      terminated
    ) {
      return
    }

    let detector = null
    let animationId = null
    let cancelled = false

    let noFaceStart = null
    let multipleFaceStart = null

    let noFaceViolationRecorded = false
    let multipleFaceViolationRecorded = false

    let currentStatus = ''

    function updateFaceStatus(message) {
      if (currentStatus !== message) {
        currentStatus = message
        setFaceStatus(message)
      }
    }

    async function initializeFaceDetection() {
      try {
        updateFaceStatus(
          'Initializing AI face detection...'
        )

        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
        )

        if (cancelled) return

        detector = await FaceDetector.createFromOptions(
          vision,
          {
            baseOptions: {
              modelAssetPath:
                'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite'
            },

            runningMode: 'VIDEO',

            minDetectionConfidence: 0.5
          }
        )

        if (cancelled) {
          detector.close()
          detector = null
          return
        }

        faceDetectorRef.current = detector

        updateFaceStatus(
          'AI face monitoring is active.'
        )

        function detectFaces() {
          if (cancelled || !detector) return

          const video = videoRef.current

          if (video && video.readyState >= 2) {
            try {
              const results = detector.detectForVideo(
                video,
                performance.now()
              )

              const faces = results.detections || []
              const now = Date.now()

              // NO FACE DETECTED
              if (faces.length === 0) {
                updateFaceStatus(
                  '⚠️ No face detected.'
                )

                multipleFaceStart = null
                multipleFaceViolationRecorded = false

                if (noFaceStart === null) {
                  noFaceStart = now
                }

                if (
                  now - noFaceStart >= 8000 &&
                  !noFaceViolationRecorded
                ) {
                  noFaceViolationRecorded = true

                  recordViolationRef.current?.(
                    'No face detected for an extended period.'
                  )
                }
              }

              // ONE FACE DETECTED
              else if (faces.length === 1) {
                updateFaceStatus(
                  '🟢 One face detected. Monitoring active.'
                )

                noFaceStart = null
                multipleFaceStart = null

                noFaceViolationRecorded = false
                multipleFaceViolationRecorded = false
              }

              // MULTIPLE FACES DETECTED
              else {
                updateFaceStatus(
                  `⚠️ Multiple faces detected: ${faces.length}`
                )

                noFaceStart = null
                noFaceViolationRecorded = false

                if (multipleFaceStart === null) {
                  multipleFaceStart = now
                }

                if (
                  now - multipleFaceStart >= 3000 &&
                  !multipleFaceViolationRecorded
                ) {
                  multipleFaceViolationRecorded = true

                  recordViolationRef.current?.(
                    'Multiple faces detected in the camera.'
                  )
                }
              }
            } catch (error) {
              console.error(
                'Face detection error:',
                error
              )

              updateFaceStatus(
                'Face detection encountered an error.'
              )
            }
          }

          if (!cancelled) {
            animationId = requestAnimationFrame(detectFaces)
          }
        }

        detectFaces()
      } catch (error) {
        console.error(
          'Unable to initialize face detection:',
          error
        )

        updateFaceStatus(
          'AI face detection could not be initialized. Check your internet connection.'
        )
      }
    }

    initializeFaceDetection()

    return () => {
      cancelled = true

      if (animationId !== null) {
        cancelAnimationFrame(animationId)
      }

      if (detector) {
        detector.close()
      }

      if (faceDetectorRef.current === detector) {
        faceDetectorRef.current = null
      }
    }
  }, [selectedQuiz, cameraStream, finished, terminated])

  // NORMALIZE OUTPUT
  function normalize(value) {
    return String(value ?? '').trim().replace(/\s+/g, ' ')
  }

  // CALCULATE SCORE
  function calculateScore() {
    return Object.values(answers).reduce(
      (total, answer) => total + answer.earnedMarks,
      0
    )
  }

  // TOTAL MARKS
  function getTotalMarks(quiz) {
    return quiz.questions.reduce(
      (total, question) =>
        total + Number(question.marks || 0),
      0
    )
  }

  // START QUIZ
  async function startQuiz(quiz) {
    // CREATE UNIQUE EXAM SESSION
    examSessionIdRef.current = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`

    setSelectedQuestion(0)
    setAnswers({})
    setCode('')
    setProgramOutput('')

    setFinished(false)
    setTerminated(false)

    setTabSwitchCount(0)
    setTabWarning('')

    setFaceStatus('Waiting for face detection...')
    setCameraMessage('Requesting camera permission...')

    violationCountRef.current = 0
    terminatedRef.current = false
    securityActiveRef.current = false

    // REQUEST FULLSCREEN
    if (document.documentElement.requestFullscreen) {
      try {
        await document.documentElement.requestFullscreen()
      } catch (error) {
        console.log(
          'Fullscreen request failed:',
          error
        )
      }
    }

    try {
      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        throw new Error('Camera is not supported.')
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      })

      cameraStreamRef.current = stream

      setCameraStream(stream)

      setCameraMessage(
        'Camera monitoring is active.'
      )

      // DETECT CAMERA DISCONNECTION
      stream.getVideoTracks().forEach(track => {
        track.addEventListener('ended', () => {
          if (securityActiveRef.current) {
            setCameraMessage(
              'Camera connection interrupted.'
            )

            recordViolationRef.current?.(
              'Camera connection was interrupted.'
            )
          }
        })
      })

      securityActiveRef.current = true
      setSelectedQuiz(quiz)

    } catch (error) {
      console.error(
        'Camera access error:',
        error
      )

      setCameraMessage(
        'Camera permission is required. Please allow camera access.'
      )

      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {})
      }

      setSelectedQuiz(null)
    }
  }

  // SUBMIT ANSWER
  function submitAnswer() {
    if (!code.trim()) {
      alert('Please write your code first.')
      return
    }

    if (!programOutput.trim()) {
      alert('Please enter your program output.')
      return
    }

    if (answers[selectedQuestion]) {
      alert('You have already submitted this answer.')
      return
    }

    const question = selectedQuiz.questions[selectedQuestion]

    const isCorrect =
      normalize(programOutput) ===
      normalize(question.sampleOutput)

    const earnedMarks = isCorrect
      ? Number(question.marks || 0)
      : 0

    setAnswers(previous => ({
      ...previous,
      [selectedQuestion]: {
        code,
        programOutput,
        isCorrect,
        earnedMarks
      }
    }))

    alert(
      isCorrect
        ? `Correct! You earned ${earnedMarks} marks.`
        : 'Incorrect answer. You earned 0 marks.'
    )
  }

  // FINISH QUIZ
  function finishQuiz() {
    if (
      Object.keys(answers).length !==
      selectedQuiz.questions.length
    ) {
      alert(
        'Please submit all questions before finishing.'
      )
      return
    }

    const totalMarks = getTotalMarks(selectedQuiz)
    const score = calculateScore()

    const result = {
      id: Date.now(),
      quizTitle: selectedQuiz.title,

      studentName: currentUser?.name || 'Student',
      studentEmail: currentUser?.email || '',

      score,
      totalMarks,

      percentage: totalMarks > 0
        ? Number(
            ((score / totalMarks) * 100).toFixed(2)
          )
        : 0,

      answers,

      date: new Date().toLocaleString(),

      tabSwitchCount,

      sessionId: examSessionIdRef.current
    }

    try {
      const previousResults = JSON.parse(
        localStorage.getItem('quizResults') || '[]'
      )

      previousResults.push(result)

      localStorage.setItem(
        'quizResults',
        JSON.stringify(previousResults)
      )

      const savedResults = JSON.parse(
        localStorage.getItem('quizResults') || '[]'
      )

      if (
        savedResults.some(
          item => item.id === result.id
        )
      ) {
        securityActiveRef.current = false

        stopCamera()

        setFinished(true)

        alert('Result saved successfully!')

        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {})
        }
      } else {
        alert(
          'Result could not be saved. Please try again.'
        )
      }
    } catch (error) {
      console.error(
        'Error saving result:',
        error
      )

      alert(
        'Unable to save result. Check browser storage.'
      )
    }
  }

  // RESET QUIZ
  function resetQuiz() {
    securityActiveRef.current = false

    stopCamera()

    setSelectedQuiz(null)
    setSelectedQuestion(0)
    setAnswers({})
    setCode('')
    setProgramOutput('')

    setFinished(false)
    setTerminated(false)

    setTabSwitchCount(0)
    setTabWarning('')

    setCameraMessage('')
    setFaceStatus(
      'Waiting for face detection...'
    )

    violationCountRef.current = 0
    terminatedRef.current = false

    examSessionIdRef.current = null

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {})
    }
  }

  // NO QUIZZES
  if (quizzes.length === 0) {
    return (
      <div className="attempt-page">
        <div className="attempt-header">
          <div className="attempt-icon">💻</div>
          <h2>Attempt Coding Quiz</h2>
          <p>
            Challenge yourself and improve your coding skills!
          </p>
        </div>

        <div className="attempt-empty-card">
          <div className="empty-icon">📚</div>
          <h3>No Quizzes Available</h3>
          <p>
            Please ask the Admin to create a quiz first.
          </p>
        </div>
      </div>
    )
  }

  // AVAILABLE QUIZZES
  if (!selectedQuiz) {
    return (
      <div className="attempt-page">
        <div className="attempt-header">
          <div className="attempt-icon">💻</div>
          <h2>Available Coding Quizzes</h2>
          <p>
            Select a quiz and test your programming knowledge.
          </p>
        </div>

        <div className="available-quiz-grid">
          {quizzes.map((quiz, index) => (
            <div
              className="available-quiz-card"
              key={quiz.id || index}
            >
              <div className="available-quiz-icon">📝</div>

              <span className="quiz-card-label">
                CODING CHALLENGE
              </span>

              <h3>{quiz.title}</h3>
              <p>{quiz.description}</p>

              <div className="quiz-info">
                <span>
                  📋 {quiz.questions.length} Questions
                </span>

                <span>
                  ⭐ {getTotalMarks(quiz)} Marks
                </span>
              </div>

              <button
                className="start-quiz-button"
                onClick={() => startQuiz(quiz)}
              >
                Start Quiz →
              </button>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // TERMINATED EXAM
  if (terminated) {
    return (
      <div className="attempt-page">
        <div className="completion-card">
          <div className="completion-icon">🚫</div>

          <h2>Examination Terminated!</h2>

          <p>
            Your examination was terminated because of repeated
            security violations.
          </p>

          <h3>Security Report</h3>

          <p>
            Violations detected: {tabSwitchCount}
          </p>

          <button
            className="start-quiz-button"
            onClick={resetQuiz}
          >
            Back to Quizzes
          </button>
        </div>
      </div>
    )
  }

  // COMPLETED EXAM
  if (finished) {
    const totalMarks = getTotalMarks(selectedQuiz)
    const score = calculateScore()

    const percentage = totalMarks > 0
      ? ((score / totalMarks) * 100).toFixed(2)
      : 0

    return (
      <div className="attempt-page">
        <div className="completion-card">
          <div className="completion-icon">🏆</div>

          <h2>Quiz Completed!</h2>

          <p className="completion-subtitle">
            Great effort! Here is your performance summary.
          </p>

          <h3>{selectedQuiz.title}</h3>

          <div className="score-circle">
            <strong>{percentage}%</strong>
            <span>Your Score</span>
          </div>

          <div className="score-details">
            <div>
              <h3>{score}</h3>
              <p>Marks Obtained</p>
            </div>

            <div>
              <h3>{totalMarks}</h3>
              <p>Total Marks</p>
            </div>

            <div>
              <h3>{selectedQuiz.questions.length}</h3>
              <p>Questions</p>
            </div>
          </div>

          <div className="attempt-review">
            <h3>📋 Question-wise Results</h3>

            {selectedQuiz.questions.map((question, index) => (
              <div
                className="review-question-card"
                key={question.id || index}
              >
                <h4>
                  Question {index + 1}: {question.title}
                </h4>

                <p>
                  Status:{' '}
                  <strong
                    className={
                      answers[index]?.isCorrect
                        ? 'correct-status'
                        : 'incorrect-status'
                    }
                  >
                    {answers[index]?.isCorrect
                      ? 'Correct ✓'
                      : 'Incorrect ✗'}
                  </strong>
                </p>

                <p>
                  Marks: {answers[index]?.earnedMarks || 0} / {question.marks}
                </p>
              </div>
            ))}
          </div>

          <button
            className="start-quiz-button"
            onClick={resetQuiz}
          >
            Back to Quizzes
          </button>
        </div>
      </div>
    )
  }

  const question = selectedQuiz.questions[selectedQuestion]

  const alreadySubmitted = Boolean(
    answers[selectedQuestion]
  )

  const progress = (
    ((selectedQuestion + 1) /
      selectedQuiz.questions.length) * 100
  )

  return (
    <div className="attempt-page">

      {/* TOP BAR */}
      <div className="attempt-top-bar">
        <button
          className="back-quiz-button"
          onClick={() => {
            securityActiveRef.current = false

            stopCamera()
            setSelectedQuiz(null)

            if (document.fullscreenElement) {
              document.exitFullscreen().catch(() => {})
            }
          }}
        >
          ← Back to Quizzes
        </button>

        <span className="question-counter">
          Question {selectedQuestion + 1} of {selectedQuiz.questions.length}
        </span>
      </div>

      {/* HEADER */}
      <div className="attempt-header">
        <div className="attempt-icon">🚀</div>
        <h2>{selectedQuiz.title}</h2>
        <p>
          Read the problem carefully and write your solution.
        </p>
      </div>

      {/* CAMERA MONITORING */}
      <div
        className="camera-monitor-card"
        style={{
          background: '#ffffff',
          padding: '20px',
          margin: '20px 0',
          borderRadius: '15px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
          textAlign: 'center'
        }}
      >
        <h3>🎥 Exam Camera Monitoring</h3>

        <p>{cameraMessage}</p>

        {cameraStream && (
          <div>
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              style={{
                width: '100%',
                maxWidth: '320px',
                borderRadius: '12px',
                border: '3px solid #22c55e',
                marginTop: '10px'
              }}
            />

            <p style={{
              color: '#16a34a',
              fontWeight: 'bold'
            }}>
              🟢 Camera is active
            </p>
          </div>
        )}

        {/* FACE DETECTION STATUS */}
        <div
          style={{
            background: '#f0f9ff',
            padding: '12px',
            borderRadius: '10px',
            marginTop: '15px'
          }}
        >
          <h4>🤖 AI Face Detection</h4>

          <p style={{
            fontWeight: 'bold',
            color: faceStatus.includes('⚠️')
              ? '#dc2626'
              : '#0284c7'
          }}>
            {faceStatus}
          </p>
        </div>
      </div>

      {/* SECURITY MONITORING */}
      <div
        className="tab-monitor-card"
        style={{
          background: tabWarning ? '#fff1f2' : '#f0f9ff',
          padding: '15px',
          marginBottom: '20px',
          borderRadius: '12px',
          border: `1px solid ${
            tabWarning ? '#ef4444' : '#38bdf8'
          }`
        }}
      >
        <h3>🛡️ Exam Activity Monitoring</h3>

        <p>
          Security violations:{' '}
          <strong>{tabSwitchCount} / 3</strong>
        </p>

        {tabWarning && (
          <p style={{
            color: '#dc2626',
            fontWeight: 'bold'
          }}>
            ⚠️ {tabWarning}
          </p>
        )}

        {!tabWarning && (
          <p style={{ color: '#0284c7' }}>
            Please remain on this tab and stay in fullscreen mode.
          </p>
        )}
      </div>

      {/* PROGRESS */}
      <div className="progress-section">
        <div className="progress-label">
          <span>Quiz Progress</span>
          <strong>{Math.round(progress)}%</strong>
        </div>

        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* QUESTION */}
      <div className="question-details-card">
        <div className="question-heading">
          <span className="question-number">
            Question {selectedQuestion + 1}
          </span>

          <span className="marks-badge">
            ⭐ {question.marks} Marks
          </span>
        </div>

        <h3>{question.title}</h3>

        <p className="question-description">
          {question.description}
        </p>

        <div className="question-meta">
          <span>💻 Language: {question.language}</span>
        </div>

        <h4>Sample Input</h4>

        <pre className="sample-code">
          {question.sampleInput}
        </pre>
      </div>

      {/* CODE EDITOR */}
      <div className="coding-editor-card">
        <div className="editor-heading">
          <h3>⌨️ Write Your Code</h3>
          <span>{question.language}</span>
        </div>

        <p className="editor-subtitle">
          Write your solution in {question.language}.
        </p>

        <textarea
          className="code-editor"
          rows="12"
          placeholder="// Write your program here..."
          value={code}
          disabled={alreadySubmitted}
          onChange={e => setCode(e.target.value)}
          spellCheck="false"
          onPaste={e => e.preventDefault()}
          onCopy={e => e.preventDefault()}
          onCut={e => e.preventDefault()}
        />

        <h3>📤 Enter Your Program Output</h3>

        <p className="editor-subtitle">
          Enter the output produced by your program.
        </p>

        <textarea
          className="output-editor"
          rows="4"
          placeholder="Enter your program output..."
          value={programOutput}
          disabled={alreadySubmitted}
          onChange={e => setProgramOutput(e.target.value)}
          onPaste={e => e.preventDefault()}
        />

        {!alreadySubmitted ? (
          <button
            className="submit-answer-button"
            onClick={submitAnswer}
          >
            Submit Answer ✓
          </button>
        ) : (
          <div className={
            answers[selectedQuestion].isCorrect
              ? 'answer-feedback correct-feedback'
              : 'answer-feedback incorrect-feedback'
          }>
            {answers[selectedQuestion].isCorrect
              ? `✓ Correct Answer! You earned ${answers[selectedQuestion].earnedMarks} marks.`
              : '✗ Incorrect Answer! You earned 0 marks.'}
          </div>
        )}
      </div>

      {/* QUESTION NAVIGATION */}
      <div className="question-navigation">
        {selectedQuestion > 0 && (
          <button
            className="previous-button"
            onClick={() => {
              const previous = selectedQuestion - 1

              setSelectedQuestion(previous)
              setCode(answers[previous]?.code || '')
              setProgramOutput(
                answers[previous]?.programOutput || ''
              )
            }}
          >
            ← Previous
          </button>
        )}

        {selectedQuestion < selectedQuiz.questions.length - 1 ? (
          <button
            className="next-button"
            disabled={!alreadySubmitted}
            onClick={() => {
              const next = selectedQuestion + 1

              setSelectedQuestion(next)
              setCode(answers[next]?.code || '')
              setProgramOutput(
                answers[next]?.programOutput || ''
              )
            }}
          >
            Next Question →
          </button>
        ) : (
          <button
            className="finish-quiz-button"
            onClick={finishQuiz}
            disabled={!alreadySubmitted}
          >
            Finish Quiz 🏆
          </button>
        )}
      </div>

    </div>
  )
}

export default AttemptQuiz
