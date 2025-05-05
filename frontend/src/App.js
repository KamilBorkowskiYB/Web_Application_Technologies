import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import MainMenuAnonymous from './pages/MainMenuAnonymous.jsx';
import MovieDetails from './pages/MovieDetails.jsx';
import Login from './pages/Login.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainMenuAnonymous />} />
        <Route path="/movie/:id" element={<MovieDetails />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;