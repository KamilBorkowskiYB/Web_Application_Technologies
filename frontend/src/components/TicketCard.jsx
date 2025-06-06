import React from "react";
import "../styles/TicketCard.css";

const TicketCard = ({
  ticketId,
  showingId,
  seatId,
  purchaseDate,
  purchasePrice,
  isCancelled,
  details,
  onViewDetails,
}) => {
  const hasDetails = !!details;

  return (
    <div className="ticket-card">
      <div className="ticket-basic-info">
        <div><strong>Ticket ID:</strong> {ticketId}</div>
        <div><strong>Purchase Date:</strong> {new Date(purchaseDate).toLocaleString()}</div>
        <div><strong>Showing ID:</strong> {showingId}</div>
        <div><strong>Seat ID:</strong> {seatId}</div>
        <div><strong>Price:</strong> {purchasePrice} zł</div>
        <div><strong>Status:</strong> {isCancelled ? "Cancelled" : "Valid"}</div>
      </div>

      {hasDetails && (
        <div className="ticket-details-expanded">
          <div className="ticket-movie-title">{details.movieTitle}</div>
          <img src={details.posterUrl} alt="Poster" className="ticket-poster" />
          <div><strong>Date & Time:</strong> {details.dateTime}</div>
          <div><strong>Cinema:</strong> {details.cinema}</div>
          <div><strong>Hall:</strong> {details.hall}</div>
          <div><strong>Seat:</strong> {details.seat}</div>
          <div><strong>Type:</strong> {details.ticketType}</div>
        </div>
      )}

      <button
        className="ticket-view-details"
        onClick={onViewDetails}
        disabled={hasDetails}
      >
        {hasDetails ? "Details Loaded" : "View Details"}
      </button>
    </div>
  );
};


export default TicketCard;
