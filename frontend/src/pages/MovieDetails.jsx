import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import '../styles/MovieDetails.css';
import { useParams, useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

const MovieDetails = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [cinemas, setCinemas] = useState([]);
  const [crew, setCrew] = useState(null);
  const [hallTypes, setHallTypes] = useState([]);
  const [cinemaHalls, setCinemaHalls] = useState([]);
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [selectedCinema, setSelectedCinema] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [cachedShowings, setCachedShowings] = useState({});
  const [loadingShowtimes, setLoadingShowtimes] = useState(false);

  const apiKey = process.env.REACT_APP_API_KEY;
  
  const apiFetch = useCallback(async (url, options = {}) => {
    const headers = {
      "Authorization": `Api-Key ${apiKey}`,
      ...options.headers,
    };
    return fetch(url, { ...options, headers });
  }, [apiKey]);

  useEffect(() => {
    apiFetch(`${API_URL}/api/movies/${id}`)
      .then((res) => res.json())
      .then(setMovie)
      .catch(console.error);

    apiFetch(`${API_URL}/api/movie_crews/`)
      .then((res) => res.json())
      .then((data) => {
        const filtered = data.results.find((crew) => crew.id === parseInt(id));
        setCrew(filtered);
      })
      .catch(console.error);

    apiFetch(`${API_URL}/api/cinemas/`)
      .then((res) => res.json())
      .then(data => { setCinemas(data.results); })
      .catch(console.error);

    apiFetch(`${API_URL}/api/hall_types/`)
      .then(res => res.json())
      .then(data => { setHallTypes(data.results); })
      .catch(console.error);

    apiFetch(`${API_URL}/api/cinema_halls/`)
      .then(res => res.json())
      .then(data => { setCinemaHalls(data.results); })
      .catch(console.error);
  }, [id, apiFetch]);

  const generateNext30Days = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const allDates = generateNext30Days();

  const getShowingsForDate = async (dateObj) => {
    const dateStr = dateObj.toISOString().split('T')[0];
    setSelectedDate(dateStr);

    if (cachedShowings[dateStr]) return;

    setLoadingShowtimes(true);

    const dayBefore = new Date(dateObj);
    dayBefore.setDate(dayBefore.getDate() - 1);

    const afterStr = dayBefore.toISOString().split('T')[0];
    const beforeStr = dateStr;

    try {
      const res = await apiFetch(`${API_URL}/api/movie_showings?movie=${id}&showing_date_after=${afterStr}&showing_date_before=${beforeStr}`);
      const data = await res.json();
      setCachedShowings(prev => ({ ...prev, [dateStr]: data.results }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingShowtimes(false);
    }
  };

  const hallTypeMap = useMemo(() => Object.fromEntries(hallTypes.map(ht => [ht.id, ht.hall_type])), [hallTypes]);
  const hallMap = useMemo(() => Object.fromEntries(cinemaHalls.map(h => [h.id, h])), [cinemaHalls]);

  const cinemaIdToShowtimes = useMemo(() => {
    if (!selectedDate || !cachedShowings[selectedDate]) return {};

    const filteredShowings = cachedShowings[selectedDate];
    const result = {};

    for (const showing of filteredShowings) {
      const hall = hallMap[showing.hall];
      if (!hall) continue;
      const cinemaId = hall.cinema;

      const dateObj = new Date(showing.date);
      const date = dateObj.toLocaleDateString();
      const time = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const type = hallTypeMap[showing.showing_type];

      if (!result[cinemaId]) result[cinemaId] = {};
      if (!result[cinemaId][date]) result[cinemaId][date] = [];

      result[cinemaId][date].push({ time, type, showingId: showing.id, hall_id: showing.hall, showingPrice: showing.ticket_price });
    }

    for (const cinemaId in result) {
      for (const date in result[cinemaId]) {
        result[cinemaId][date].sort((a, b) => a.time.localeCompare(b.time));
      }
    }

    return result;
  }, [cachedShowings, selectedDate, hallMap, hallTypeMap]);

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
          selectedTime: selectedShowtime.time,
          showingPrice: selectedShowtime.showingPrice,
        },
      });
    }
  };

  return (
    <div className="movie-details">
      <Header />
      <div className="movie-content">
        {(!movie || !crew) ? (
          <div className="movie-loading">
            <div className="reel-loader" />
            <p>Loading movie magic... 🎞️</p>
          </div>
        ) : (
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

                  <div className="date-picker">
                    {allDates.map(date => {
                      const iso = date.toISOString().split('T')[0];
                      const label = date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
                      return (
                        <button
                          key={iso}
                          className={`date-button ${selectedDate === iso ? 'selected' : ''}`}
                          onClick={() => getShowingsForDate(date)}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>

                  {loadingShowtimes ? (
                    <p className="loading-showtimes">Loading showtimes...</p>
                  ) : (
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
                                      className={`showtime-button ${selectedShowtime?.showingId === st.showingId ? 'selected' : ''}`}
                                      onClick={() => {
                                        setSelectedShowtime(st);
                                        setSelectedCinema(cinema.name);
                                      }}
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
                  )}

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
        )}
      </div>
    </div>
  );
};

export default MovieDetails;
