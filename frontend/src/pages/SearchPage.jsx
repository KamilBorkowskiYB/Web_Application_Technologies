import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import '../styles/SearchPage.css';
import { API_URL } from '../config';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const [movies, setMovies] = useState([]);
  const navigate = useNavigate();
  const apiKey = process.env.REACT_APP_API_KEY;

  const title = searchParams.get('title');

  const apiFetch = useCallback(async (url, options = {}) => {
    const headers = {
      "Authorization": `Api-Key ${apiKey}`,
      ...options.headers,
    };
    return fetch(url, { ...options, headers });
  }, [apiKey]);

  useEffect(() => {
    if (!title) return;

    apiFetch(`${API_URL}/api/movies/?title=${encodeURIComponent(title)}`)
      .then(response => response.json())
      .then(data => setMovies(data.results))
      .catch(error => console.error('Error fetching search results:', error));
  }, [title, apiFetch]);

  return (
    <div className="search-page">
      <Header onSearch={(title) => navigate(`/search?title=${title}`)} />
      <div className="main-content">
        <div className='main-content-title'>
            Search results for: <em>{title}</em>
        </div>
        <div className="search-movie-grid">
          {movies.length > 0 ? (
            movies.map((movie) => (
              <div key={movie.id} className="search-movie-card" onClick={() => navigate(`/movie/${movie.id}`)}>
                <img src={movie.poster} className="search-movie-image" alt={movie.title} />
                <div className="search--movie-title">{movie.title}</div>
                <div className="movie-duration-on-hover">Duration: {movie.duration} min</div>
              </div>
            ))
          ) : (
            <p>No results found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
