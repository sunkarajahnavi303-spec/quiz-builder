
import { useState } from 'react'
import { supabase } from '../lib/supabase'

function Signup({ onSignup, onNavigate }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSignup(e) {
    e.preventDefault()

    if (loading) return

    setLoading(true)

    const normalizedEmail = email.trim().toLowerCase()
    const normalizedName = name.trim()

    try {
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            full_name: normalizedName
          }
        }
      })

      if (error) {
        throw error
      }

      if (data.session) {
        alert('Student account created successfully! Please login.')
        onSignup()
      } else {
        alert(
          'Account created! Please check your email to confirm your account, then login.'
        )
        onNavigate('login')
      }

      setName('')
      setEmail('')
      setPassword('')
    } catch (error) {
      alert(error.message || 'Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
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
          minLength={6}
          required
        />

        <button
          type="submit"
          className="signup-button"
          disabled={loading}
        >
          {loading ? 'Creating Account...' : 'Create Student Account'}
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
