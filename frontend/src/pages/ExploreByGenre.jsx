import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import '../styles/ExploreByGenre.css'; // Styl dodasz osobno
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

const ExploreByGenre = () => {
  const [genres, setGenres] = useState([]);
  const [moviesByGenre, setMoviesByGenre] = useState({});
  const navigate = useNavigate();
  const apiKey = process.env.REACT_APP_API_KEY;

  const apiFetch = (url, options = {}) => {
  const headers = {
    "Authorization": `Api-Key ${apiKey}`,
    ...options.headers,
  };
  return fetch(url, { ...options, headers });
  };

  useEffect(() => {
    // Pobieramy wszystkie gatunki
    apiFetch(`${API_URL}/api/genres/`)
      .then(res => res.json())
      .then(data => {
        setGenres(data.results);
        // Dla każdego gatunku pobieramy filmy
        data.results.forEach((genre) => {
          apiFetch(`${API_URL}/api/movies/?genre=${genre.id}`)
            .then(res => res.json())
            .then(movies => {
              setMoviesByGenre(prev => ({ ...prev, [genre.genre]: movies.results }));
            });
        });
      });
  }, []);

  return (
    <div className="explore-by-genre">
      <Header />
      <div className="main-content">
        <h2 className="explore-title">Explore by Genre</h2>
        {genres.map((genre) => (
          <div key={genre.id} className="genre-section">
            <h3 className="genre-title">{genre.genre}</h3>
            <div className="movie-row">
              {(moviesByGenre[genre.genre] || []).map((movie) => (
                <div key={movie.id} className="movie-card" onClick={() => navigate(`/movie/${movie.id}`)}>
                  <img src={movie.poster} alt={movie.title} className="movie-image" />
                  <div className="movie-title">{movie.title}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExploreByGenre;
