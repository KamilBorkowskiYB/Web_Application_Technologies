import React from "react";
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { AuthContext } from '../auth/AuthContext';
import "../styles/ProfilePage.css"; // Zakładam, że dodasz wspólny CSS do jednego pliku
import { API_URL } from "../config";

const ProfilePage = () => {
  
  const { user, logout } = useContext(AuthContext);
  const [upcomingReservations, setUpcomingReservations] = useState([]);
  const [isLoadingReservations, setIsLoadingReservations] = useState(true);
  const navigate = useNavigate();
  const apiKey = process.env.REACT_APP_API_KEY;

  useEffect(() => {
    const fetchShowings = async () => {
      setIsLoadingReservations(true);

      const ticketsWithDetails = await Promise.all(
        user.tickets.map(async (ticket) => {
          try {
            // 1. Pobierz pokaz
            const res = await fetch(`${API_URL}/api/movie_showings/${ticket.showing}/`, {
              headers: {
                Authorization: `Api-Key ${apiKey}`,
              },
            });
            const showingData = await res.json();

            // 2. Pobierz film
            const movieRes = await fetch(`${API_URL}/api/movies/${showingData.movie}/`, {
              headers: {
                Authorization: `Api-Key ${apiKey}`,
              },
            });
            const movieData = await movieRes.json();

            return {
              ...ticket,
              showing: {
                ...showingData,
                movie: movieData, // ← dodajemy film jako obiekt
              },
            };
          } catch (err) {
            console.error("Błąd pobierania danych biletu:", err);
            return null;
          }
        })
      );

      // 3. Filtrowanie nadchodzących rezerwacji
      const uniqueShowingsMap = new Map();

      ticketsWithDetails.forEach((ticket) => {
        if (!ticket) return;

        const showingId = ticket.showing.id;
        if (!uniqueShowingsMap.has(showingId)) {
          uniqueShowingsMap.set(showingId, {
            ...ticket,
            count: 1,
          });
        } else {
          const existing = uniqueShowingsMap.get(showingId);
          uniqueShowingsMap.set(showingId, {
            ...existing,
            count: existing.count + 1,
          });
        }
      });

      const uniqueReservations = Array.from(uniqueShowingsMap.values());

      setUpcomingReservations(uniqueReservations);
      setIsLoadingReservations(false);
    };

    if (user?.tickets?.length) {
      fetchShowings();
    }
  }, [user, apiKey]);

  const handleLogout = () => {
    logout();
    navigate('/');
    window.location.reload();
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="profile-page">
      <header className="profile-header">
        <h1 className="profile-title">Profile Settings</h1>
        <button className="profile-logout" onClick={handleLogout}>Logout</button>
      </header>

      <main className="profile-main">
        <section className="profile-section">
          <div className="profile-container">
            <div className="profile-top">
              <div className="profile-details">
                <div className="profile-avatar">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="profile-user-info">
                  <h2 className="profile-user-name">{user.username}</h2>
                  <p className="profile-user-email">{user.email}</p>
                </div>
              </div>
              <button className="profile-edit">Edit Profile</button>
            </div>

            <form className="profile-form">
              <div className="profile-input-group">
                <label className="profile-input-label">Phone</label>
                <input type="tel" className="profile-input" />
              </div>
              <div className="profile-input-group">
                <label className="profile-input-label">Location</label>
                <input type="text" className="profile-input" />
              </div>
            </form>
          </div>
        </section>

        <section className="profile-reservations">
          <h2 className="reservations-title">Upcoming Reservations</h2>
          {isLoadingReservations ? (
            <p className="loading-reservations">Loading reservations...</p>
          ) : upcomingReservations.length === 0 ? (
            <p className="no-reservations">You have no upcoming reservations.</p>
          ) : (
            <div className="reservations-list">
              {upcomingReservations.map((ticket, i) => (
                <article key={i} className="reservation-card">
                  <div className="reservation-info">
                    <h3 className="reservation-title">{ticket.showing.movie.title}</h3>

                    <time className="reservation-time" dateTime={ticket.showing.date}>
                      {new Date(ticket.showing.date).toLocaleString()}
                    </time>

                    <p className="reservation-meta">
                      Duration: {ticket.showing.movie.duration} min
                    </p>
                    <span className="reservation-count">
                      {ticket.count} ticket{ticket.count > 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="reservation-poster">
                    <img
                      src={ticket.showing.movie.poster || "https://placehold.co/100x150"}
                      alt={`${ticket.showing.movie.title} poster`}
                    />
                  </div>

                  <span
                    className={`reservation-status ${
                      new Date(ticket.showing.date) > new Date() ? "active" : "expired"
                    }`}
                  >
                    {new Date(ticket.showing.date) > new Date() ? "Upcoming" : "Expired"}
                  </span>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default ProfilePage;
