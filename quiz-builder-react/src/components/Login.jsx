
import { useState } from 'react'

function Login({ onLogin, onNavigate }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function handleLogin(e) {
    e.preventDefault()

    const normalizedEmail = email.trim().toLowerCase()

    // Fixed Admin credentials
    const adminEmail = 'admin@quizbuilder.com'
    const adminPassword = 'Admin@123'

    if (
      normalizedEmail === adminEmail &&
      password === adminPassword
    ) {
      alert('Admin login successful!')

      onLogin({
        name: 'Administrator',
        email: adminEmail,
        role: 'admin'
      })

      return
    }

    // Student login
    const users = JSON.parse(
      localStorage.getItem('quizUsers') || '[]'
    )

    const validUser = users.find(
      (user) =>
        user.email === normalizedEmail &&
        user.password === password &&
        user.role === 'student'
    )

    if (validUser) {
      alert('Student login successful! Welcome ' + validUser.name)

      onLogin(validUser)
    } else {
      alert('Invalid email or password. Please try again.')
    }

    setEmail('')
    setPassword('')
  }

  return (
    <div className="login-card">
      <div className="login-icon">🎓</div>

      <h2>Welcome Back!</h2>

      <p className="card-subtitle">
        Login to continue your Quiz Builder journey.
      </p>

      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" className="login-button">
          Login
        </button>
      </form>

      <p className="signup-text">
        Don't have an account?
        <button
          type="button"
          className="text-button"
          onClick={() => onNavigate('signup')}
        >
          Sign Up
        </button>
      </p>
    </div>
  )
}

export default Login
