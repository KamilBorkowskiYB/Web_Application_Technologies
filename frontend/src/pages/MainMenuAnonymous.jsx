import React, { useCallback, useEffect, useState } from 'react';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import '../styles/MainMenuAnonymous.css';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

const MainMenuAnonymous = () => {
  const [movies, setMovies] = useState([]);
  const [filterParams, setFilterParams] = useState({});
  const navigate = useNavigate();
  const apiKey = process.env.REACT_APP_API_KEY;

  const apiFetch = useCallback(async (url, options = {}) => {
    const headers = {
      "Authorization": `Api-Key ${apiKey}`,
      ...options.headers,
    };
    return fetch(url, { ...options, headers });
  }, [apiKey]);

  // 2. Gdy filtr się zmieni (albo z URL-a, albo z ręcznego wyszukiwania) → pobierz filmy
  useEffect(() => {
    const queryParams = new URLSearchParams(filterParams).toString();
    // console.log(`${API_URL}/api/movies/?${queryParams}`);
    apiFetch(`${API_URL}/api/movies/?${queryParams}`)
      .then(response => response.json())
      .then(data => setMovies(data.results))
      .catch(error => console.error('Error fetching movies:', error));
  }, [filterParams, apiFetch]);

  const handleFilterChange = (params) => {
    setFilterParams(params);
  };

  return (
    <div className="main-menu">
      <Header onSearch={(title) => handleFilterChange({ title })} />
      <Navigation onFilterSelect={handleFilterChange} />
      <div className="main-content">
        <div className="main-menu-movie-grid">
          {Array.isArray(movies) && movies.map((movie) => (
            <div key={movie.id} className="main-menu-movie-card" onClick={() => navigate(`/movie/${movie.id}`)}>
              <img
                src={ movie.poster }
                className="main-menu-movie-image"
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
