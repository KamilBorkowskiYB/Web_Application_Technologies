import React from "react";
import { useLocation } from "react-router-dom";
import "../styles/BookingSummary.css";

const BookingSummary = () => {
  const location = useLocation();
  const {
    movieTitle,
    cinemaName,
    date,
    time,
    selectedSeats,
    totalPrice
  } = location.state || {};



  return (
    <div className="booking-summary-container">
      <div className="booking-summary-card">
        <div className="booking-header">
          <div className="booking-icon">
            <div>
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10.667 6.66675V25.3334L25.3337 16.0001L10.667 6.66675Z"
                  fill="white"
                />
              </svg>
            </div>
          </div>
          <div className="booking-title">Booking Summary</div>
        </div>

        <div className="booking-details">
          <div className="booking-row">
            <div className="booking-label">Movie</div>
            <div className="booking-value">{movieTitle}</div>
          </div>

          <div className="booking-row">
            <div className="booking-label">Date & Time</div>
            <div className="booking-value">{date} {time}</div>
          </div>

          <div className="booking-row">
            <div className="booking-label">Cinema</div>
            <div className="booking-value">{cinemaName}</div>
          </div>

          <div className="booking-label">Seats</div>

          <div className="booking-value">
            {selectedSeats?.join(", ") || "None selected"}
          </div>

          <div className="booking-divider" />

          <div className="booking-row">
            <div className="booking-label">Name</div>
            <div className="booking-value">Alex Smith</div>
          </div>

          <div className="booking-row">
            <div className="booking-label">Email</div>
            <div className="booking-value">alex@example.com</div>
          </div>

          <div className="booking-divider" />

          <div className="booking-total">Total: ${totalPrice}</div>

          <div className="booking-button-container">
            <button className="booking-confirm-button">Confirm Booking</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSummary;
