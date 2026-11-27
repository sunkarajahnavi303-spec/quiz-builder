
import { useState, useEffect } from 'react'

import { supabase } from './lib/supabase'

import Navbar from './components/Navbar'
import Login from './components/Login'
import Signup from './components/Signup'
import Dashboard from './components/Dashboard'
import CreateQuiz from './components/CreateQuiz'
import AttemptQuiz from './components/AttemptQuiz'
import Results from './components/Results'
import ManageQuizzes from './components/ManageQuizzes'
import ViolationHistory from './components/ViolationHistory'
import AdminAnalytics from './components/AdminAnalytics'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [currentPage, setCurrentPage] = useState('login')
  const [authLoading, setAuthLoading] = useState(true)

  // Load user profile from Supabase
  useEffect(() => {
    let mounted = true

    async function loadUser(session, event) {
      if (!session) {
        if (mounted) {
          setCurrentUser(null)
          setIsLoggedIn(false)
          setCurrentPage('login')
          setAuthLoading(false)
        }
        return
      }

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('full_name, role')
          .eq('id', session.user.id)
          .single()

        if (error || !profile) {
          throw error || new Error('User profile not found.')
        }

        if (!mounted) return

        setCurrentUser({
          id: session.user.id,
          name: profile.full_name || session.user.email,
          email: session.user.email,
          role: profile.role
        })

        setIsLoggedIn(true)

        if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
          setCurrentPage('dashboard')
        }
      } catch (error) {
        console.error('Profile loading error:', error)

        await supabase.auth.signOut()

        if (mounted) {
          setCurrentUser(null)
          setIsLoggedIn(false)
          setCurrentPage('login')
          alert('Unable to load your profile. Please contact the administrator.')
        }
      } finally {
        if (mounted) {
          setAuthLoading(false)
        }
      }
    }

    // Restore existing login session
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error('Session error:', error)
      }

      loadUser(data?.session || null, 'INITIAL_SESSION')
    })

    // Listen for login and logout changes
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      setTimeout(() => {
        if (mounted) {
          loadUser(session, event)
        }
      }, 0)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // Handle successful login
  function handleLogin(user) {
    setCurrentUser(user)
    setIsLoggedIn(true)
    setCurrentPage('dashboard')
  }

  // Handle logout
  async function handleLogout() {
    const { error } = await supabase.auth.signOut()

    if (error) {
      alert('Logout failed: ' + error.message)
      return
    }

    setIsLoggedIn(false)
    setCurrentUser(null)
    setCurrentPage('login')
  }

  // Handle signup
  function handleSignup() {
    setCurrentPage('login')
  }

  if (authLoading) {
    return (
      <div className="app-container">
        <h2>Loading Quiz Builder...</h2>
      </div>
    )
  }

  return (
    <div>
      <Navbar />

      <div className="app-container">

        {!isLoggedIn ? (
          <>
            {currentPage === 'signup' ? (
              <Signup
                onSignup={handleSignup}
                onNavigate={setCurrentPage}
              />
            ) : (
              <Login
                onLogin={handleLogin}
                onNavigate={setCurrentPage}
              />
            )}
          </>
        ) : (
          <>

            {/* ADMIN DASHBOARD */}
            {currentPage === 'dashboard' &&
              currentUser?.role === 'admin' && (
                <div className="dashboard">

                  <div className="dashboard-header">
                    <div className="dashboard-icon">👨‍💻</div>

                    <h2>Welcome, Admin!</h2>

                    <p>
                      Manage quizzes and monitor the Quiz Builder platform.
                    </p>
                  </div>

                  <h3 className="dashboard-heading">
                    Admin Dashboard
                  </h3>

                  <div className="dashboard-options">

                    {/* CREATE QUIZ */}
                    <div className="dashboard-card create-card">
                      <div className="option-icon">📝</div>

                      <h3>Create Quiz</h3>

                      <p>
                        Create coding quizzes and add programming questions.
                      </p>

                      <button
                        onClick={() => setCurrentPage('createQuiz')}
                      >
                        Create Now
                      </button>
                    </div>

                    {/* MANAGE QUIZZES */}
                    <div className="dashboard-card results-card">
                      <div className="option-icon">📚</div>

                      <h3>Manage Quizzes</h3>

                      <p>
                        View and manage all created coding quizzes.
                      </p>

                      <button
                        onClick={() => setCurrentPage('manageQuizzes')}
                      >
                        Manage Quizzes
                      </button>
                    </div>

                    {/* VIOLATION HISTORY */}
                    <div className="dashboard-card">
                      <div className="option-icon">🛡️</div>

                      <h3>Violation History</h3>

                      <p>
                        Monitor student exam violations, warnings,
                        and terminated attempts.
                      </p>

                      <button
                        onClick={() => setCurrentPage('violationHistory')}
                      >
                        View Violations
                      </button>
                    </div>

                    {/* ADMIN ANALYTICS */}
                    <div className="dashboard-card">
                      <div className="option-icon">📊</div>

                      <h3>Admin Analytics</h3>

                      <p>
                        View student statistics, quiz performance
                        and examination analytics.
                      </p>

                      <button
                        onClick={() => setCurrentPage('adminAnalytics')}
                      >
                        View Analytics
                      </button>
                    </div>

                  </div>

                  <button
                    className="logout-button"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>

                </div>
              )}

            {/* STUDENT DASHBOARD */}
            {currentPage === 'dashboard' &&
              currentUser?.role === 'student' && (
                <Dashboard
                  isLoggedIn={isLoggedIn}
                  userName={currentUser.name}
                  userEmail={currentUser.email}
                  onLogout={handleLogout}
                  onNavigate={setCurrentPage}
                />
              )}

            {/* BACK TO DASHBOARD */}
            {currentPage !== 'dashboard' && (
              <button
                onClick={() => setCurrentPage('dashboard')}
              >
                Back to Dashboard
              </button>
            )}

            {/* ADMIN: CREATE QUIZ */}
            {currentPage === 'createQuiz' &&
              currentUser?.role === 'admin' && (
                <CreateQuiz />
              )}

            {/* ADMIN: MANAGE QUIZZES */}
            {currentPage === 'manageQuizzes' &&
              currentUser?.role === 'admin' && (
                <ManageQuizzes />
              )}

            {/* ADMIN: VIOLATION HISTORY */}
            {currentPage === 'violationHistory' &&
              currentUser?.role === 'admin' && (
                <ViolationHistory />
              )}

            {/* ADMIN: ANALYTICS */}
            {currentPage === 'adminAnalytics' &&
              currentUser?.role === 'admin' && (
                <AdminAnalytics />
              )}

            {/* STUDENT: ATTEMPT QUIZ */}
            {currentPage === 'attemptQuiz' &&
              currentUser?.role === 'student' && (
                <AttemptQuiz currentUser={currentUser} />
              )}

            {/* STUDENT: VIEW RESULTS */}
            {currentPage === 'results' &&
              currentUser?.role === 'student' && (
                <Results currentUser={currentUser} />
              )}

          </>
        )}

      </div>
    </div>
  )
}

export default App
