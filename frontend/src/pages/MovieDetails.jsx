import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import '../styles/MovieDetails.css';
import { useParams } from 'react-router-dom';

const MovieDetails = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [cinemas, setCinemas] = useState([]);

  useEffect(() => {
    // Fetch movie details
    fetch(`http://127.0.0.1:8000/api/movies/${id}`)
      .then((res) => res.json())
      .then(setMovie)
      .catch(console.error);
    
    // Fetch cinema details
    fetch('http://127.0.0.1:8000/api/cinemas')
      .then((res) => res.json())
      .then(setCinemas)
      .catch(console.error);
  }, [id]);

  if (!movie) return <div>Loading...</div>;

  return (
    <div className="movie-details">
      <Header />
      <Navigation />
      <div className="movie-content">
        <div className="content-wrapper">
          <div className="movie-layout">
            <div className="poster-column">
              <img
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/148956d725a931089dfd7613fbb0881446b1ed55?placeholderIfAbsent=true&apiKey=5c359e8b7a374e379933ea077887b809"
                className="movie-poster"
                alt="The Mandalorian Movie Poster"
              />
            </div>
            <div className="info-column">
              <div className="movie-info">
                <h1 className="movie-details-movie-title">{movie.title}</h1>
                <div className="movie-meta">
                  <div className="meta-item">{movie.release_year}</div>
                  <div className="meta-item">{movie.duration} min</div>
                  {/* Dynamic genres — here will need an update to support genres from backend */}
                  {movie.genres && movie.genres.map((genre, index) => (
                    <div key={index} className="genre">{genre}</div>
                  ))}
                </div>
                <p className="movie-description">{movie.description}</p>
                <h2 className="section-title">Cast</h2>
                <div className="cast-list">
                  {movie.cast && movie.cast.map((actor, index) => (
                    <div key={index} className="cast-member">
                      <img
                        src={actor.image_url || 'https://cdn.builder.io/api/v1/image/assets/TEMP/b85e7de446d58ac9d59a389f5461eeeca2864ffe?placeholderIfAbsent=true&apiKey=5c359e8b7a374e379933ea077887b809'}
                        className="cast-image"
                        alt={actor.name}
                      />
                      <div className="cast-name">{actor.name}</div>
                    </div>
                  ))}
                </div>
                <h2 className="section-title">Showtimes</h2>
                <div className="showtimes-grid">
                  {cinemas.length > 0 ? cinemas.map((cinema) => (
                    <div key={cinema.id} className="cinema-row">
                      <div className="cinema-card">
                        <div className="cinema-content">
                          <div className="cinema-name">{cinema.name}</div>
                          {cinema.showtimes && cinema.showtimes.map((showtime, idx) => (
                            <div key={idx} className="showtime-button">{showtime}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )) : <div>Loading cinemas...</div>}
                </div>
                <button className="book-button">Book Seats</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;