import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/BookingSummary.css";

const BookingSummary = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    showingId,
    movieTitle,
    cinemaName,
    date,
    time,
    selectedSeats,
    seatTypes, 
    totalPrice
  } = location.state || {};

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const apiKey = process.env.REACT_APP_API_KEY;

  const apiFetch = (url, options = {}) => {
  const headers = {
    "Authorization": `Api-Key ${apiKey}`,
    ...options.headers,
  };
  return fetch(url, { ...options, headers });
  };

  const handleConfirmBooking = async () => {
    setIsLoading(true);
    setError("");

    const currentTime = new Date().toISOString();

    const ticketsData = selectedSeats.map((seatId) => {
      const type = seatTypes[seatId];
      const price = type === "student" ? 12 : 15;
      const discount = null;

      return {
        showing: showingId,
        seat: seatId,
        base_price: price,
        purchase_time: currentTime,
        purchase_price: price,
        buyer: 1, // ← na razie zakładamy sztywno
        discount
      };
    });
    try {
      const responses = await Promise.all(
        ticketsData.map((ticket) =>
          apiFetch("http://localhost:8000/api/tickets/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(ticket),
          }).then((res) => {
            if (!res.ok) throw new Error("Błąd przy rezerwacji biletu");
            return res.json();
          })
        )
      );

      navigate("/", { state: { booking: responses } });
    } catch (err) {
      setError(err.message || "Wystąpił błąd przy rezerwacji.");
    } finally {
      setIsLoading(false);
    }
  };


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
            {selectedSeats?.length > 0
              ? selectedSeats
                  .map((seatId) => {
                    const getRowForSeat = (seatId) => {
                      return Math.floor(seatId / 10) + 1;
                    };

                    const getLetterForSeat = (seatId) => {
                      return String.fromCharCode(65 + (seatId % 10)); // A, B, C, D, ...
                    };
                    // Zakładając, że masz dostęp do odpowiednich danych o miejscach
                    const row = getRowForSeat(seatId-1); // Funkcja, która zwróci numer rzędu dla danego seatId
                    const letter = getLetterForSeat(seatId-1); // Funkcja, która zwróci literkę dla danego seatId
                    const seatType = seatTypes[seatId] === "student" ? "S" : "N"; // Typ miejsca: S (student) lub N (normalny)
                    
                    return `${row}${letter} (${seatType})`; // Wyświetlenie rzędów, literki i typu miejsca
                  })
                  .join(", ")
              : "None selected"}
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
            <button onClick={handleConfirmBooking} disabled={isLoading} className="booking-confirm-button">
              {isLoading ? "Loading..." : "Confirm Booking"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSummary;
