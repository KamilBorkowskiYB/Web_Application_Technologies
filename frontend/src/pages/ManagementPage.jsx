import React, { useCallback, useEffect, useState } from 'react';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import '../styles/ManagementPage.css';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

const ManagementPage = () => {
    const [cinemas, setCinemas] = useState([]);
    const [selectedCinema, setSelectedCinema] = useState('');
    const [halls, setHalls] = useState([]);
    const [selectedHall, setSelectedHall] = useState('');
    const [movie, setMovie] = useState({});
    const [movies, setMovies] = useState([]);
    const [selectedMovie, setSelectedMovie] = useState('');
    const [type, setType] = useState([]);
    const [selectedType, setSelectedType] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [newHour, setNewHour] = useState('');
    const [hours, setHours] = useState([]);
    const [price, setPrice] = useState();
    const apiKey = process.env.REACT_APP_API_KEY;

    const navigate = useNavigate();

    const apiFetch = useCallback(async (url, options = {}) => {
        const headers = {
            "Authorization": `Api-Key ${apiKey}`,
            ...options.headers,
        };
        return fetch(url, { ...options, headers });
    }, [apiKey]);

    useEffect(() => {
        setStartDate(new Date().toISOString().slice(0,16));
        setEndDate(new Date().toISOString().slice(0,16));
        const fetchCinemas = async () => {
            try {
                const response = await apiFetch(`${API_URL}/api/cinemas/`);
                const data = await response.json();
                setCinemas(data.results);
            } catch (error) {
                console.error('Error fetching cinemas:', error);
            }
        }

        const fetchMovies = async () => {
            try {
                const response = await apiFetch(`${API_URL}/api/movies/`);
                const data = await response.json();
                setMovies(data.results);
            } catch (error) {
                console.error('Error fetching movies:', error);
            }
        }

        fetchCinemas();
        fetchMovies();
    }, []);

    useEffect(() => {
        if (!selectedCinema) return;

        const fetchHalls = async () => {
            try {
                const response = await apiFetch(`${API_URL}/api/cinema_halls?cinema=${selectedCinema}`);
                const data = await response.json();
                setHalls(data.results);
            } catch (error) {
                console.error('Error fetching halls:', error);
            }         
        }

        fetchHalls();
    }, [selectedCinema]);

    useEffect(() => {
        if (!selectedHall) return;

        const fetchType = async () => {
            try {
                const response = await apiFetch(`${API_URL}/api/hall_types?hall=${selectedHall}`);
                const data = await response.json();
                setType(data.results);
            } catch (error) {
                console.error('Error fetching hall types:', error);
            }         
        }

        fetchType();
    }, [selectedHall]);

    const fetchMovieData = async () => {
        if (!movie.title) return alert("Title is required");
        try {
            const response = await apiFetch(
                `${API_URL}/api/movies/auto_complete/`, 
                { 
                    body: JSON.stringify({ title: movie.title }), 
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });
            const data = await response.json();
            setMovie(data);
            console.log(data); 
        }
        catch (error) {
            console.error('Error fetching movie data:', error);
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { poster, ...movieData } = movie;
            const response = await apiFetch(
                `${API_URL}/api/movies/${movie.id}/`, 
                { 
                    body: JSON.stringify(movieData), 
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' }
                });
            console.log('Movie data submitted successfully');
        } catch (error) {
            console.error('Error submitting movie data:', error);
        }
    }

    const handleCancel = async (e) => {
        e.preventDefault();
        try {
            const response = await apiFetch(
                `${API_URL}/api/movies/${movie.id}/`, 
                { 
                    body: JSON.stringify(movie), 
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' }
                });
            console.log('Movie deleted successfully');
        } catch (error) {
            console.error('Error deleting movie data:', error);
        }
        navigate('/');
    }

    const handleAddHour = () => {
        if (newHour && !hours.includes(newHour)) {
            setHours([...hours, newHour]);
            setNewHour('');
        }
    }

    const handleRemoveHour = (index) => {
        const updatedHours = hours.filter((_, i) => i !== index);
        setHours(updatedHours);
    }

    const handleShowingsSubmit = async () => {
        if (!selectedCinema || !selectedHall || !selectedMovie || !selectedType || hours.length === 0 || !startDate || !endDate || !price) {
            return alert("Please fill in all fields and add at least one hour.");
        }

        try {
            const data = {
                showing_type: selectedType,
                movie: selectedMovie,
                hall: selectedHall,
                start_date: startDate,
                end_date: endDate,
                hours: hours,
                ticket_price: price
            }
            const response = await apiFetch(`${API_URL}/api/movie_showings/add_showing_in_period/`, 
                {body: JSON.stringify(data), method: 'POST', headers: { 'Content-Type': 'application/json' }});
        } catch (error) {
            console.error('Error submitting showings data:', error);
        }
    }
    return (
        <div>
            <Header />
            <div className="management-container">
                <div className="select-container">
                    <label htmlFor="cinema-select">Select Cinema:</label>
                    <select
                        id="cinema-select"
                        value={selectedCinema}
                        onChange={(e) => {
                            setSelectedCinema(e.target.value);
                            setSelectedHall('');
                            }
                        }
                    >
                        <option value="">--Choose a Cinema--</option>
                        {cinemas.map((cinema) => (
                            <option key={cinema.id} value={cinema.id}>{cinema.name}</option>
                        ))}
                    </select>
                </div>
                {selectedCinema && (
                    <div className="select-container">
                        <label htmlFor="hall-select">Select Hall:</label>
                        <select
                            id="hall-select"
                            value={selectedHall}
                            onChange={(e) => {
                                setSelectedHall(e.target.value);
                            }}
                        >
                            <option value="">--Choose a Hall--</option>
                            {halls.map((hall) => (
                                <option key={hall.id} value={hall.id}>{hall.hall_number}</option>
                            ))}
                        </select>
                    </div>
                )}
                {selectedHall && (
                    <div className="select-container">
                        <label htmlFor="hall-type-select">Select Hall:</label>
                        <select
                            id="hall-type-select"
                            value={selectedType}
                            onChange={(e) => {
                                setSelectedType(e.target.value);
                            }}
                        >
                            <option value="">--Choose a Type--</option>
                            {type.map((type) => (
                                <option key={type.id} value={type.id}>{type.hall_type}</option>
                            ))}
                        </select>
                    </div>
                )}
                <div className="select-container">
                    <label htmlFor="movie-select">Select Movie:</label>
                    <select
                        id="movie-select"
                        value={selectedMovie}
                        onChange={(e) => {
                            setSelectedMovie(e.target.value);
                            setMovie(movies.find(m => m.id === parseInt(e.target.value)) || {});
                            console.log(`Selected movie ID: ${movie.poster}`);
                            }
                        }
                    >
                        <option value="">--Choose a Movie--</option>
                        {movies.map((movie) => (
                            <option key={movie.id} value={movie.id}>{movie.title}</option>
                        ))}
                    </select>
                </div>
                <div className='select-container'>
                    <label>Start date:</label>
                    <input 
                        type="date" 
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </div>
                <div className='select-container'>
                    <label>End date:</label>
                    <input 
                        type="date" 
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>
                <div className='select-container'>
                    <label>Select hours:</label>
                    <input 
                        type="time" 
                        value={newHour}
                        onChange={(e) => setNewHour(e.target.value)}
                    />
                    <button onClick={handleAddHour}>+</button>
                    <div className='selected-hours'>
                        {hours.map((hour, index) => (
                            <div key={index}>
                                <span className="hour-badge">{hour}</span>
                                <button onClick={() => handleRemoveHour(index)}>x</button>
                            </div>
                        ))}
                    </div>
                </div>
                <div className='select_container'>
                    <label>Ticket Price:</label>
                    <input 
                        type="number" 
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                    />
                </div>
                <button onClick={handleShowingsSubmit}>Add Showings</button>
            </div>
            
            <div className="add-movie-container">
                <form className="add-movie-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="title">Title:</label>
                        <input 
                            type="text" 
                            id="title" 
                            name="title" 
                            value={movie.title}
                            onChange={(e) => {console.log(`Changing title to ${e.target.value}`); setMovie({ ...movie, title: e.target.value })}}
                            required />
                    </div>
                    <button type="button" onClick={fetchMovieData}>Fetch Movie Data</button>
                    <div className="form-group">
                        <label htmlFor="description">Description:</label>
                        <textarea 
                            id="description" 
                            name="description" 
                            value={movie.description || ''}
                            onChange={(e) => setMovie({ ...movie, description: e.target.value })}
                            required></textarea>
                    </div>
                    <div className="form-group">
                        <label htmlFor="duration">Duration (minutes):</label>
                        <input 
                            type="number" 
                            id="duration" 
                            name="duration" 
                            value={movie.duration || ''}
                            onChange={(e) => setMovie({ ...movie, duration: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="release-date">Release Date:</label>
                        <input 
                            type="date" 
                            id="release-date" 
                            name="release-date"
                            value={movie.release_date || ''} 
                            onChange={(e) => setMovie({ ...movie, release_date: e.target.value })}
                            required />
                    </div>
                    <button type="submit" className="submit-button">Add Movie</button>
                    <button type="button" onClick={handleCancel} className="cancel-button">Cancel</button>
                </form>

                <div>
                    <img src={movie.poster ? `${API_URL}${movie.poster}` : ''} alt="Movie Poster" />
                </div>
            </div>
        </div>
  );
};

export default ManagementPage;