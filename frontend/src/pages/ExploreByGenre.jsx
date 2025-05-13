import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import '../styles/ExploreByGenre.css'; // Styl dodasz osobno
import { useNavigate } from 'react-router-dom';

const ExploreByGenre = () => {
  const [genres, setGenres] = useState([]);
  const [moviesByGenre, setMoviesByGenre] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    // Pobieramy wszystkie gatunki
    fetch('http://127.0.0.1:8000/api/genres/')
      .then(res => res.json())
      .then(data => {
        setGenres(data);
        // Dla każdego gatunku pobieramy filmy
        data.forEach((genre) => {
          fetch(`http://127.0.0.1:8000/api/movies/?genre=${genre.id}`)
            .then(res => res.json())
            .then(movies => {
              setMoviesByGenre(prev => ({ ...prev, [genre.genre]: movies }));
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
