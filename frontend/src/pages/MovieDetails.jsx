import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import '../styles/MovieDetails.css';
import { useParams } from 'react-router-dom';

const MovieDetails = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [cinemas, setCinemas] = useState([]);
  const [crew, setCrew] = useState(null);

  useEffect(() => {
    // Fetch movie details
    fetch(`http://127.0.0.1:8000/api/movies/${id}`)
      .then((res) => res.json())
      .then(setMovie)
      .catch(console.error);

    // Fetch crew details
    fetch('http://127.0.0.1:8000/api/movie_crews/')
      .then((res) => res.json())
      .then((data) => {
        const filtered = data.find((crew) => crew.id === parseInt(id));
        setCrew(filtered);
      })
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
                src={ movie.poster }
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
                  <ul>
                    {movie.genre.map(g => (
                      <li key={g.id}>{g.genre}</li>
                    ))}
                  </ul>
                </div>
                <p className="movie-description">{movie.description}</p>
                {crew && (
                  <>
                    <h2 className="section-title">Crew</h2>
                    <div className="crew-info">
                      <div><strong>Director:</strong> {crew.director.map(d => d.name).join(', ')}</div>
                      <div><strong>Main lead:</strong> {crew.main_lead.map(l => l.name).join(', ')}</div>
                    </div>
                  </>
                )}
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