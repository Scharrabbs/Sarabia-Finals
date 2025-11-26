import React, { useState, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import './App.css';


const GOOGLE_CLIENT_ID = '259911194479-21aas8qum5l8bkf57ohcnatpu6fe766g.apps.googleusercontent.com';

interface Color {
  id: number;
  name: string;
  hex_code: string;
  created_at?: string;
}

interface User {
  id: number;
  username: string;
  email?: string;
}

function Login({ onLoginSuccess, onSwitchToRegister }: any) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const AUTH_URL = 'http://localhost/Sarabia-Finals/backend/auth.php';
  const GOOGLE_AUTH_URL = 'http://localhost/Sarabia-Finals/backend/google-callback.php';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    try {
      const response = await fetch(`${AUTH_URL}?action=login`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        onLoginSuccess(data.user);
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred. Please try again.');
    }

    setLoading(false);
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const response = await fetch(GOOGLE_AUTH_URL, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credential: credentialResponse.credential,
        }),
      });

      const data = await response.json();

      if (data.success) {
        onLoginSuccess(data.user);
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Google login error:', error);
      setError('Google login failed. Please try again.');
    }
  };

  const handleGoogleError = () => {
    setError('Google login failed. Please try again.');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Color Picker</h1>
        <h2>Welcome Back!</h2>
        <p className="auth-subtitle">Login to manage your colors</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="auth-input"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="auth-input"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="eye-icon">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                  
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="eye-icon">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="divider">
          <span>OR</span>
        </div>

        <div className="google-login-wrapper">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap
            theme="outline"
            size="large"
            text="continue_with"
            shape="rectangular"
            width="100%"
          />
        </div>

        <p className="auth-switch">
          Don't have an account?{' '}
          <span onClick={onSwitchToRegister} className="auth-link">
            Register here
          </span>
        </p>
      </div>
    </div>
  );
}


function Register({ onRegisterSuccess, onSwitchToLogin }: any) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const AUTH_URL = 'http://localhost/Sarabia-Finals/backend/auth.php';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    formData.append('password', password);

    try {
      const response = await fetch(`${AUTH_URL}?action=register`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        onRegisterSuccess(data.user);
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('An error occurred. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Color Picker</h1>
        <h2>Create Account</h2>
        <p className="auth-subtitle">Register to start collecting colors</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              className="auth-input"
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="auth-input"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password (min 6 characters)"
                className="auth-input"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="eye-icon">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="eye-icon">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className="auth-input"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="eye-icon">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="eye-icon">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{' '}
          <span onClick={onSwitchToLogin} className="auth-link">
            Login here
          </span>
        </p>
      </div>
    </div>
  );
}


function App() {
  const [colors, setColors] = useState<Color[]>([]);
  const [colorName, setColorName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#ff0000');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showRegister, setShowRegister] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const API_URL = 'https://sarabia-colorpicker.free.nf/backend/api.php';
  const AUTH_URL = 'https://sarabia-colorpicker.free.nf/backend/auth.php';

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch(`${AUTH_URL}?action=check`, {
        credentials: 'include',
      });
      const data = await response.json();

      if (data.success && data.authenticated) {
        setUser(data.user);
        fetchColors();
      }
    } catch (error) {
      console.error('Auth check error:', error);
    }
    setCheckingAuth(false);
  };

  const fetchColors = async () => {
    try {
      const response = await fetch(API_URL, {
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        setColors(data.data);
      }
    } catch (error) {
      console.error('Error fetching colors:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!colorName.trim()) {
      alert('Please enter a color name!');
      return;
    }

    setLoading(true);
    
    const formData = new FormData();
    formData.append('name', colorName);
    formData.append('hex_code', selectedColor);
    
    if (editingId) {
      formData.append('id', editingId.toString());
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      const data = await response.json();
      
      if (data.success) {
        alert(data.message);
        setColorName('');
        setSelectedColor('#ff0000');
        setEditingId(null);
        fetchColors();
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      console.error('Error saving color:', error);
      alert('Error saving color!');
    }
    
    setLoading(false);
  };

  const handleEdit = (color: Color) => {
    setColorName(color.name);
    setSelectedColor(color.hex_code);
    setEditingId(color.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this color?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}?id=${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await response.json();
      
      if (data.success) {
        alert(data.message);
        fetchColors();
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      console.error('Error deleting color:', error);
      alert('Error deleting color!');
    }
  };

  const handleCancel = () => {
    setColorName('');
    setSelectedColor('#ff0000');
    setEditingId(null);
  };

  const handleLoginSuccess = (userData: User) => {
    setUser(userData);
    fetchColors();
  };

  const handleLogout = async () => {
    try {
      await fetch(`${AUTH_URL}?action=logout`, {
        method: 'POST',
        credentials: 'include',
      });
      setUser(null);
      setColors([]);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (checkingAuth) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h1>Loading...</h1>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        {showRegister ? (
          <Register
            onRegisterSuccess={handleLoginSuccess}
            onSwitchToLogin={() => setShowRegister(false)}
          />
        ) : (
          <Login
            onLoginSuccess={handleLoginSuccess}
            onSwitchToRegister={() => setShowRegister(true)}
          />
        )}
      </GoogleOAuthProvider>
    );
  }

  return (
    <div className="App">
      <div className="container">
        <div className="header">
          <h1>Color Picker CRUD System</h1>
          <div className="user-info">
            <span className="username">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="user-icon">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
              {user.username}
            </span>
            <button onClick={handleLogout} className="btn-logout">
              Logout
            </button>
          </div>
        </div>
        
        <div className="form-section">
          <h2>{editingId ? 'Edit Color' : 'Add New Color'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Color Name:</label>
              <input
                type="text"
                value={colorName}
                onChange={(e) => setColorName(e.target.value)}
                placeholder="Enter color name (e.g., Sky Blue)"
                className="input-field"
              />
            </div>

            <div className="form-group">
              <label>Pick a Color:</label>
              <div className="color-picker-container">
                <HexColorPicker color={selectedColor} onChange={setSelectedColor} />
                <div className="color-preview">
                  <div 
                    className="preview-box" 
                    style={{ backgroundColor: selectedColor }}
                  ></div>
                  <p className="hex-code">{selectedColor}</p>
                </div>
              </div>
            </div>

            <div className="button-group">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving...' : editingId ? 'Update Color' : 'Add Color'}
              </button>
              {editingId && (
                <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="colors-section">
          <h2>Saved Colors ({colors.length})</h2>
          {colors.length === 0 ? (
            <p className="no-colors">No colors saved yet. Add your first color above!</p>
          ) : (
            <div className="colors-grid">
              {colors.map((color) => (
                <div key={color.id} className="color-card">
                  <div 
                    className="color-display" 
                    style={{ backgroundColor: color.hex_code }}
                  ></div>
                  <div className="color-info">
                    <h3>{color.name}</h3>
                    <p className="hex">{color.hex_code}</p>
                  </div>
                  <div className="card-actions">
                    <button 
                      className="btn-edit" 
                      onClick={() => handleEdit(color)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn-delete" 
                      onClick={() => handleDelete(color.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;