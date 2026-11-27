
import { useState } from 'react'
import { supabase } from '../lib/supabase'

function Login({ onLogin, onNavigate }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()

    if (loading) return

    setLoading(true)

    const normalizedEmail = email.trim().toLowerCase()

    try {
      // Sign in using Supabase Authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password
      })

      if (error) {
        throw error
      }

      // Get the user's profile and role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', data.user.id)
        .single()

      if (profileError || !profile) {
        await supabase.auth.signOut()
        throw new Error('User profile not found. Please contact the administrator.')
      }

      // Pass the authenticated user to App.jsx
      onLogin({
        id: data.user.id,
        name: profile.full_name || data.user.email,
        email: data.user.email,
        role: profile.role
      })

      alert(
        profile.role === 'admin'
          ? 'Admin login successful!'
          : 'Student login successful!'
      )

      setEmail('')
      setPassword('')
    } catch (error) {
      alert(error.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
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

        <button
          type="submit"
          className="login-button"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
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
