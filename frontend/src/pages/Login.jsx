import React, { useCallback, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Login.css';
import { API_URL } from "../config";

const Login = () => {
  const [, setToken] = useState(null);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const apiKey = process.env.REACT_APP_API_KEY;
    
  const apiFetch = useCallback(async (url, options = {}) => {
      const headers = {
      "Authorization": `Api-Key ${apiKey}`,
      ...options.headers,
      };
      return fetch(url, { ...options, headers });
  }, [apiKey]);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError(null);

    // Warunki pustych pól
    if (!identifier.trim() || !password.trim()) {
      setError("Please fill in both username and password");
      return;
    }

    try {
      const res = await apiFetch(`${API_URL}/api/token/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ "username": identifier, "password": password }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        if (res.status === 401 && data.detail) {
          setError(`Login failed: ${data.detail}`);
          console.warn("401 error:", data.detail);
        } else {
          setError(data.detail || 'Login failed');
        }
        return;
      }

      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      navigate('/');
      window.location.reload();
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    const channel = new BroadcastChannel("auth_channel");

    channel.onmessage = (event) => {
      const token = event.data.token;
      console.log("TOKEN z popupu:", token);

      setToken(token);
      localStorage.setItem("access_token", token);

      navigate('/');
      window.location.reload();
    };

    return () => {
      channel.close();
    };
  }, []);
  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="welcome-header">
            <img
              src="/favicon.png"
              className="welcome-avatar"
              alt="Welcome avatar"
            />
            <div className="welcome-text">Welcome Back</div>
          </div>
          
          <form className="form-group-wrapper" onSubmit={handleSignIn} autoComplete="on">
            <div className="form-group">
              <label className="input-label" htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                className="input-field"
                placeholder="Enter your username"
                autoComplete="username"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="input-label" htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                className="input-field"
                placeholder="Enter your password"
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <div className="login-error-message">{error}</div>}

            <button type="submit" className="signin-button">
              Sign In
            </button>
          </form>


          <div className="divider">
            <div className="divider-line"></div>
            <div className="divider-text">or</div>
            <div className="divider-line"></div>
          </div>

          <button
            className="social-button google-button"
            onClick={() => {
              const googleLoginUrl = `${API_URL}/accounts/google/login`; 

              window.open(
                googleLoginUrl,
                "_blank",
                "width=500,height=600"
              );
            }}
          >
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/ad71c24f47a2ca74c589e9308e862bf7221fdcc4?placeholderIfAbsent=true&apiKey=5c359e8b7a374e379933ea077887b809"
              className="social-icon"
              alt="Google icon"
            />
            <span className="social-text">Continue with Google</span>
          </button>

          <div className="signup-prompt">
            <span className="signup-text">Don't have an account?</span>
            <Link to="/register" className="signup-link">Sign up</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;