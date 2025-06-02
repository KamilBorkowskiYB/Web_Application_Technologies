import React, { useEffect, useState } from 'react';
import '../styles/Login.css';
import { API_URL} from "../config";

const Login = () => {
  const [, setToken] = useState(null);

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
            <label className="input-label">Username or Email</label>
            <div className="input-field">Enter your username</div>
          </div>

          <div className="form-group">
            <label className="input-label">Password</label>
            <div className="input-field">Enter your password</div>
          </div>

          <button className="signin-button">Sign In</button>

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

          <button className="social-button facebook-button">
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/f25bbd40fc62faa12c606f935789eadb4c0a7edc?placeholderIfAbsent=true&apiKey=5c359e8b7a374e379933ea077887b809"
              className="social-icon"
              alt="Facebook icon"
            />
            <span className="social-text">Continue with Facebook</span>
          </button>

          <div className="signup-prompt">
            <span className="signup-text">Don't have an account?</span>
            <span className="signup-link">Sign up</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;