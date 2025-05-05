import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import MainMenuAnonymous from './pages/MainMenuAnonymous.jsx';
import MovieDetails from './pages/MovieDetails.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainMenuAnonymous />} />
        <Route path="/movie/:id" element={<MovieDetails />} />
      </Routes>
    </Router>
  );
}

export default App;