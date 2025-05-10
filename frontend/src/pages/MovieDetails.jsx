import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import '../styles/MovieDetails.css';
import { useParams, useNavigate } from 'react-router-dom';

const MovieDetails = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [cinemas, setCinemas] = useState([]);
  const [crew, setCrew] = useState(null);
  const [showings, setShowings] = useState([]);
  const [hallTypes, setHallTypes] = useState([]);
  const [cinemaHalls, setCinemaHalls] = useState([]);
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [selectedCinema, setSelectedCinema] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);


  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/movies/${id}`)
      .then((res) => res.json())
      .then(setMovie)
      .catch(console.error);

    fetch('http://127.0.0.1:8000/api/movie_crews/')
      .then((res) => res.json())
      .then((data) => {
        const filtered = data.find((crew) => crew.id === parseInt(id));
        setCrew(filtered);
      })
      .catch(console.error);

    fetch('http://127.0.0.1:8000/api/cinemas/')
      .then((res) => res.json())
      .then(setCinemas)
      .catch(console.error);

    fetch('http://127.0.0.1:8000/api/movie_showings/')
      .then(res => res.json())
      .then(setShowings)
      .catch(console.error);

    fetch('http://127.0.0.1:8000/api/hall_types/')
      .then(res => res.json())
      .then(setHallTypes)
      .catch(console.error);

    fetch('http://127.0.0.1:8000/api/cinema_halls/')
      .then(res => res.json())
      .then(setCinemaHalls)
      .catch(console.error);

  }, [id]);

  const filteredShowings = showings.filter(s => s.movie === parseInt(id));
  const hallTypeMap = Object.fromEntries(hallTypes.map(ht => [ht.id, ht.hall_type]));
  const hallMap = Object.fromEntries(cinemaHalls.map(h => [h.id, h]));

  const cinemaIdToShowtimes = {};
  for (const showing of filteredShowings) {
    const hall = hallMap[showing.hall];
    if (!hall) continue;
    const cinemaId = hall.cinema;

    const dateObj = new Date(showing.date);
    const date = dateObj.toLocaleDateString();
    const time = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const type = hallTypeMap[showing.showing_type];

    if (!cinemaIdToShowtimes[cinemaId]) cinemaIdToShowtimes[cinemaId] = {};
    if (!cinemaIdToShowtimes[cinemaId][date]) cinemaIdToShowtimes[cinemaId][date] = [];

    cinemaIdToShowtimes[cinemaId][date].push({ time, type, showingId: showing.id, hall_id: showing.hall,});
  }

  // Sort showtimes by time
  for (const cinemaId in cinemaIdToShowtimes) {
    for (const date in cinemaIdToShowtimes[cinemaId]) {
      cinemaIdToShowtimes[cinemaId][date].sort((a, b) => a.time.localeCompare(b.time));
    }
  }

  const navigate = useNavigate();

  const handleBookSeatsClick = () => {
    if (selectedShowtime) {
      navigate("/seat-selection", {
        state: {
          cinemaHallId: selectedShowtime.hall_id,
          showingId: selectedShowtime.showingId,
          movieTitle: movie.title,
          cinemaName: selectedCinema,
          selectedDate,
          selectedTime: selectedShowtime.time
        },
      });
    }
  };

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
                src={movie.poster}
                className="movie-poster"
                alt="Movie Poster"
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
                  {cinemas.map((cinema) => (
                    <div key={cinema.id} className="cinema-card">
                      <div className="cinema-name">{cinema.name}</div>
                      {cinemaIdToShowtimes[cinema.id] ? (
                        Object.entries(cinemaIdToShowtimes[cinema.id]).map(([date, times]) => (
                          <div key={date} className="showtime-date-block">
                            <div className="showtime-date">{date}</div>
                            <div className="showtime-times">
                              {times.map((st, idx) => (
                                <div
                                  key={idx}
                                  className={`showtime-button ${selectedShowtime === st.showingId ? 'selected' : ''}`}
                                  onClick={() => {
                                    setSelectedShowtime(st);
                                    setSelectedCinema(cinema.name);
                                    setSelectedDate(date)}}
                                >
                                  {st.time} ({st.type})
                                </div>
                              ))}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="no-showtimes">No showtimes</div>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  className="book-button"
                  disabled={!selectedShowtime}
                  style={{ opacity: selectedShowtime ? 1 : 0.5, cursor: selectedShowtime ? 'pointer' : 'not-allowed' }}
                  onClick={handleBookSeatsClick} 
                >
                  Book Seats
                </button>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;
