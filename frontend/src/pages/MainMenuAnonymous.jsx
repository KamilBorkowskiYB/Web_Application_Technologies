import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import '../styles/MainMenuAnonymous.css';
import { useNavigate } from 'react-router-dom';

const MainMenuAnonymous = () => {
  const [movies, setMovies] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/movies/')
      .then(response => response.json())
      .then(data => setMovies(data))
      .catch(error => console.error('Error fetching movies:', error));
  }, []);

  return (
    <div className="main-menu">
      <Header />
      <Navigation />
      <div className="main-content">
        <div className="movie-grid">
          {movies.map((movie) => (
            <div key={movie.id} className="movie-card" onClick={() => navigate(`/movie/${movie.id}`)}>
              <img
                src={ movie.poster }
                className="movie-image"
                alt={movie.title}
              />
              <div className="main-menu-movie-title">{movie.title}</div>
              <div className="movie-duration-on-hover">
                Duration: {movie.duration} min
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MainMenuAnonymous;
