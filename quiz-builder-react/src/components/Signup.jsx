
import { useState } from 'react'

function Signup({ onSignup, onNavigate }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function handleSignup(e) {
    e.preventDefault()

    const users = JSON.parse(
      localStorage.getItem('quizUsers') || '[]'
    )

    const normalizedEmail = email.trim().toLowerCase()

    const existingUser = users.find(
      (user) => user.email === normalizedEmail
    )

    if (existingUser) {
      alert('Account already exists! Please login.')
      return
    }

    const newUser = {
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: 'student'
    }

    users.push(newUser)

    localStorage.setItem('quizUsers', JSON.stringify(users))

    alert('Student account created successfully! Please login.')

    onSignup()

    setName('')
    setEmail('')
    setPassword('')
  }

  return (
    <div className="signup-card">
      <div className="signup-icon">✨</div>

      <h2>Create Student Account</h2>

      <p className="card-subtitle">
        Join Quiz Builder and start your coding journey!
      </p>

      <form onSubmit={handleSignup}>
        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

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

        <button type="submit" className="signup-button">
          Create Student Account
        </button>
      </form>

      <p className="login-text">
        Already have an account?
        <button
          type="button"
          className="text-button"
          onClick={() => onNavigate('login')}
        >
          Login
        </button>
      </p>
    </div>
  )
}

export default Signup
