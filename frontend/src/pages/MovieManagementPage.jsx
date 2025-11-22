import React, { useCallback, useEffect, useState } from 'react';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import { getUserInfo } from '../auth/auth';
import '../styles/ManagementPage.css';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

const MovieManagementPage = () => {
    const [movie, setMovie] = useState({});
    const [movies, setMovies] = useState([]);
    const [selectedMovie, setSelectedMovie] = useState('');
    const [fetchMovie, setFetchMovie] = useState({ title: '' });
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
        const checkUser = async () => {
            const userInfo = await getUserInfo();
            if (!userInfo || !userInfo.is_staff) {
                navigate('/');
            }
        };

        const fetchMovies = async () => {
                try {
                    const response = await apiFetch(`${API_URL}/api/movies/`);
                    const data = await response.json();
                    setMovies(data.results);
                } catch (error) {
                    console.error('Error fetching movies:', error);
                }
            }

        checkUser();
        fetchMovies();
    }, []);
    

    const fetchMovieData = async () => {
        const access = localStorage.getItem('access_token');
        if (!fetchMovie.title) return alert("Title is required");
        try {
            const response = await apiFetch(
                `${API_URL}/api/movies/fetch_data/`, 
                { 
                    body: JSON.stringify({ title: fetchMovie.title, language: fetchMovie.language, year: fetchMovie.year }), 
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${access}` }
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
        const access = localStorage.getItem('access_token');
        try {
            const movieData = movie;
            console.log('Submitting movie data:', movieData);
            const response = await apiFetch(
                `${API_URL}/api/movies/full_create/`, 
                { 
                    body: JSON.stringify({"movie": movieData }), 
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${access}` }
                });
            console.log('Movie data submitted successfully');
        } catch (error) {
            console.error('Error submitting movie data:', error);
        }
    }

    const handleCancel = async (e) => {
        e.preventDefault();
        navigate('/');
    }

    const handleOnSelectChange = async (e) => {
        const movie_data = e.target.value;
        setSelectedMovie(e.target.value);
        let movie_object = movies.find(m => m.id === parseInt(movie_data));
        try {
            const genres = await apiFetch(`${API_URL}/api/genres/?movie=${movie_data}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            })
            const genres_data = await genres.json();
            movie_object = { ...movie_object, genres: genres_data.results.map(g => g.genre) };

            const movie_crew = await apiFetch(`${API_URL}/api/movie_crews/${movie_object.crew}`)
            const crew_data = await movie_crew.json();
            movie_object = {
                ...movie_object,
                directors: crew_data.director.map(d => d.name),
                main_cast: crew_data.main_lead.map(c => c.name)
            }
        } catch (error) {
            console.error('Error selecting movie:', error);
        }
        setMovie(movie_object);
        console.log('Selected movie with all info:', movie_object);
    };

    return (
        <div>
            <Header />
            <div className="movie-management-container">
                <div className="movie-select-container">
                    <label htmlFor="movie-select">Select Movie:</label>
                    <select
                        id="movie-select"
                        value={selectedMovie}
                        onChange={(e) => handleOnSelectChange(e)
                        }
                    >
                        <option value="">--Choose a Movie--</option>
                        {movies.map((movie) => (
                            <option key={movie.id} value={movie.id}>{movie.title}</option>
                        ))}
                    </select>
                    <form className="fetch-movie-form">
                        <label htmlFor="fetch-movie-title">Fetch Movie by Title:</label>
                        <input
                            type="text"
                            id="fetch-movie-title"
                            name="fetch-movie-title"
                            value={fetchMovie.title}
                            onChange={(e) => setFetchMovie({ ...fetchMovie, title: e.target.value })}
                            required />
                        <label htmlFor="fetch-movie-language">Language (e.g., en, fr - optional):</label>
                        <input
                            type="text"
                            id="fetch-movie-language"
                            name="fetch-movie-language"
                            value={fetchMovie.language}
                            onChange={(e) => setFetchMovie({ ...fetchMovie, language: e.target.value })}
                            required />
                        <label htmlFor="fetch-movie-year">Year (optional):</label>
                        <input
                            type="text"
                            id="fetch-movie-year"
                            name="fetch-movie-year"
                            value={fetchMovie.year}
                            onChange={(e) => setFetchMovie({ ...fetchMovie, year: e.target.value })}
                        />
                    </form>
                    <button type="button" className="fetch-button" onClick={fetchMovieData}>Fetch Movie Data</button>
                </div>
                <div className="add-movie-container">
                    <form className="add-movie-form" onSubmit={handleSubmit}>
                        <h1>Movie preview</h1>
                        <div className="form-group">
                            <label htmlFor="title">Title:</label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={movie.title}
                                onChange={(e) => { console.log(`Changing title to ${e.target.value}`); setMovie({ ...movie, title: e.target.value }) }}
                                required />
                            <label htmlFor="description">Description:</label>
                            <textarea
                                id="description"
                                name="description"
                                value={movie.description || ''}
                                onChange={(e) => setMovie({ ...movie, description: e.target.value })}
                                required></textarea>
                            <label htmlFor="duration">Duration (minutes):</label>
                            <input
                                type="number"
                                id="duration"
                                name="duration"
                                value={movie.duration || ''}
                                onChange={(e) => setMovie({ ...movie, duration: e.target.value })}
                                required
                            />
                            <label htmlFor="release-date">Release Date:</label>
                            <input
                                type="date"
                                id="release-date"
                                name="release-date"
                                value={movie.release_date || ''}
                                onChange={(e) => setMovie({ ...movie, release_date: e.target.value })}
                                required />
                            <label htmlFor="genres">Genres (comma separated):</label>
                            <input
                                type="text"
                                id="genres"
                                name="genres"
                                value={movie.genres ? movie.genres.join(', ') : ''}
                                onChange={(e) => setMovie({ ...movie, genres: e.target.value.split(',').map(g => g.trim()) })}
                                required />
                            <label htmlFor="director">Directors (comma separated):</label>
                            <input
                                type="text"
                                id="director"
                                name="director"
                                value={movie.directors ? movie.directors.join(', ') : ''}
                                onChange={(e) => setMovie({ ...movie, directors: e.target.value.split(',').map(d => d.trim()) })}
                                required />
                            <label htmlFor="cast">Cast (comma separated):</label>
                            <input
                                type="text"
                                id="cast"
                                name="cast"
                                value={movie.main_cast ? movie.main_cast.join(', ') : ''}
                                onChange={(e) => setMovie({ ...movie, main_cast: e.target.value.split(',').map(c => c.trim()) })}
                                required />
                        </div>
                        <button type="submit" className="confirm-button">Confirm</button>
                        <button type="button" onClick={handleCancel} className="delete-button">Cancel</button>
                    </form>
                    <div className="movie-poster-preview">
                        <img src={movie.poster ? `${movie.poster}` : ''} alt="Movie Poster" />
                    </div>
                </div>
            </div>
        </div>
  );
};

export default MovieManagementPage;