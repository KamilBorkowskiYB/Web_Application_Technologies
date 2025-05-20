import React from "react";
import "../styles/TicketCard.css";

const TicketCard = ({
  movieTitle,
  posterUrl,
  dateTime,
  cinema,
  hall,
  seat,
  ticketType,
  onViewDetails,
}) => {
  return (
    <div className="ticket-card">
      <div className="ticket-poster-container">
        <img
          src={posterUrl}
          alt={`${movieTitle} Poster`}
          className="ticket-poster"
        />
      </div>
      <div className="ticket-details">
        <div className="ticket-movie-title">{movieTitle}</div>
        <div className="ticket-info-container">
          <div className="ticket-info-row">
            <div className="ticket-info-label">Date &amp; Time</div>
            <div className="ticket-info-value">{dateTime}</div>
          </div>
          <div className="ticket-info-row">
            <div className="ticket-info-label">Cinema</div>
            <div className="ticket-info-value">{cinema}</div>
          </div>
          <div className="ticket-info-row">
            <div className="ticket-info-label">Hall</div>
            <div className="ticket-info-value">{hall}</div>
          </div>
          <div className="ticket-info-row">
            <div className="ticket-info-label">Seat</div>
            <div className="ticket-info-value">{seat}</div>
          </div>
          <div className="ticket-info-row">
            <div className="ticket-info-label">Type</div>
            <div className="ticket-info-value">{ticketType}</div>
          </div>
        </div>
        <button className="ticket-view-details" onClick={onViewDetails} disabled={movieTitle !== "Click to view details"}>
          {movieTitle === "Click to view details" ? "View Details" : "Details Loaded"}
        </button>
      </div>
    </div>
  );
};

export default TicketCard;
