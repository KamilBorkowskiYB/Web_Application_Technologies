import React, { useCallback, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Login.css';
import { API_URL } from "../config";

const Login = () => {
  const [, setToken] = useState(null);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [, setError] = useState(null);
  const navigate = useNavigate();
  const apiKey = process.env.REACT_APP_API_KEY;
    
  const apiFetch = useCallback(async (url, options = {}) => {
      const headers = {
      "Authorization": `Api-Key ${apiKey}`,
      ...options.headers,
      };
      return fetch(url, { ...options, headers });
  }, [apiKey]);

  const handleSignIn = async () => {
    setError(null);
    try {
      const res = await apiFetch(`${API_URL}/api/token/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ "username": identifier, "password": password }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Login failed');
      }
      const data = await res.json();
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      navigate('/');
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
      localStorage.setItem("auth_token", token);
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
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/11bd867774967a99b714cffb176e7a2909ed002c?placeholderIfAbsent=true&apiKey=5c359e8b7a374e379933ea077887b809"
              className="welcome-avatar"
              alt="Welcome avatar"
            />
            <div className="welcome-text">Welcome Back</div>
          </div>
          
          <div className="form-group">
            <label className="input-label">Username</label>
            <input
              type="text"
              className="input-field"
              placeholder="Enter your username"
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="input-label">Password</label>
            <input
              type="password"
              className="input-field"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button className="signin-button" onClick={handleSignIn}>
            Sign In
          </button>

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