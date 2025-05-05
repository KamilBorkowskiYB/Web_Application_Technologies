import React from 'react';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import '../styles/MovieDetails.css';

const MovieDetails = () => {
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
                <h1 className="movie-details-movie-title">The Mandalorian</h1>
                <div className="movie-meta">
                  <div className="meta-item">2023</div>
                  <div className="meta-item">2h 35m</div>
                  <div className="genre">Action</div>
                  <div className="genre">Sci-Fi</div>
                </div>
                <p className="movie-description">
                  After the stories of Jango and Boba Fett, another warrior emerges
                  in the Star Wars universe. The Mandalorian is set after the fall
                  of the Empire and before the emergence of the First Order.
                </p>
                <h2 className="section-title">Cast</h2>
                <div className="cast-list">
                  <div className="cast-member">
                    <img
                      src="https://cdn.builder.io/api/v1/image/assets/TEMP/b85e7de446d58ac9d59a389f5461eeeca2864ffe?placeholderIfAbsent=true&apiKey=5c359e8b7a374e379933ea077887b809"
                      className="cast-image"
                      alt="Pedro Pascal"
                    />
                    <div className="cast-name">Pedro Pascal</div>
                  </div>
                  <div className="cast-member">
                    <img
                      src="https://cdn.builder.io/api/v1/image/assets/TEMP/b85e7de446d58ac9d59a389f5461eeeca2864ffe?placeholderIfAbsent=true&apiKey=5c359e8b7a374e379933ea077887b809"
                      className="cast-image"
                      alt="Giancarlo Esposito"
                    />
                    <div className="cast-name">Giancarlo Esposito</div>
                  </div>
                  <div className="cast-member">
                    <img
                      src="https://cdn.builder.io/api/v1/image/assets/TEMP/b85e7de446d58ac9d59a389f5461eeeca2864ffe?placeholderIfAbsent=true&apiKey=5c359e8b7a374e379933ea077887b809"
                      className="cast-image"
                      alt="Carl Weathers"
                    />
                    <div className="cast-name">Carl Weathers</div>
                  </div>
                </div>
                <h2 className="section-title">Showtimes</h2>
                <div className="showtimes-grid">
                  <div className="cinema-row">
                    <div className="cinema-card">
                      <div className="cinema-content">
                        <div>
                          <div className="cinema-name">Cinema City</div>
                          <div className="showtime-button">10:00</div>
                          <div className="showtime-button">13:30</div>
                          <div className="showtime-button">16:45</div>
                        </div>
                      </div>
                    </div>
                    <div className="cinema-card">
                      <div className="cinema-content">
                        <div>
                          <div className="cinema-name">Multikino</div>
                          <div className="showtime-button">11:15</div>
                          <div className="showtime-button">14:00</div>
                          <div className="showtime-button">17:30</div>
                        </div>
                      </div>
                    </div>
                    <div className="cinema-card">
                      <div className="cinema-content">
                        <div>
                          <div className="cinema-name">IMAX</div>
                          <div className="showtime-button">12:00</div>
                          <div className="showtime-button">15:15</div>
                          <div className="showtime-button">18:45</div>
                        </div>
                      </div>
                    </div>
                  </div>
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