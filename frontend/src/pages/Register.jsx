import React, { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Register.css";
import { API_URL } from "../config";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await apiFetch(`${API_URL}/api/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, "password1": password, "password2": confirmPassword }),
      });

      if (response.ok) {
        navigate("/login");
      } else {
        const data = await response.json();
        setError(data.detail || "Registration failed");
      }
    } catch (err) {
      setError("Server error");
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-card">
          <div className="welcome-header">
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/11bd867774967a99b714cffb176e7a2909ed002c"
              className="welcome-avatar"
              alt="Welcome avatar"
            />
            <div className="welcome-text">Create Account</div>
          </div>

          <div className="form-group">
            <label className="input-label">Username</label>
            <input
              className="input-field"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
            />
          </div>

          <div className="form-group">
            <label className="input-label">Email</label>
            <input
              className="input-field"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label className="input-label">Password</label>
            <input
              className="input-field"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>

          <div className="form-group">
            <label className="input-label">Confirm Password</label>
            <input
              className="input-field"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button className="signin-button" onClick={handleRegister}>
            Sign Up
          </button>

          <div className="signup-prompt">
            <span className="signup-text">Already have an account?</span>
            <span
              className="signup-link"
              onClick={() => navigate("/login")}
            >
              Sign in
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;