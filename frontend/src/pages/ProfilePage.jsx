import React from "react";
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../auth/AuthContext';
import "../styles/ProfilePage.css"; // Zakładam, że dodasz wspólny CSS do jednego pliku

const ProfilePage = () => {
  
  const { user } = useContext(AuthContext);
  const [upcomingReservations, setUpcomingReservations] = useState([]);

  useEffect(() => {
    if (user?.tickets) {
      const now = new Date();
      const upcoming = user.tickets.filter(ticket => {
        const showDate = new Date(ticket.showing.datetime);
        return showDate > now;
      });
      setUpcomingReservations(upcoming);
    }
  }, [user]);

  if (!user) return <p>Loading...</p>;

  return (
    <div className="profile-page">
      <header className="profile-header">
        <h1 className="profile-title">Profile Settings</h1>
        <button className="profile-logout">Logout</button>
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
          {upcomingReservations.length === 0 ? (
            <p className="no-reservations">You have no upcoming reservations.</p>
          ) : (
            <div className="reservations-list">
              {upcomingReservations.map((ticket, i) => (
                <article key={i} className="reservation-card">
                  <div className="reservation-info">
                    <h3 className="reservation-title">{ticket.showing.movie_title}</h3>
                    <time className="reservation-time" dateTime={ticket.showing.datetime}>
                      {new Date(ticket.showing.datetime).toLocaleString()}
                    </time>
                  </div>
                  <span className="reservation-status active">Upcoming</span>
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
