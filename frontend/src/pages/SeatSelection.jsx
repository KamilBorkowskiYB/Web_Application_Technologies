import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Navigation from "../components/Navigation";
import "../styles/SeatSelection.css";

const SeatSelection = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cinemaHallId, showingId, movieTitle, cinemaName, selectedDate, selectedTime  } = location.state || {};

  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [ticketType, setTicketType] = useState("normal");

  useEffect(() => {
    console.log("cinemaHallId:", cinemaHallId);
    console.log("showingId:", showingId);
    fetch("http://127.0.0.1:8000/api/seats/")
      .then((res) => res.json())
      .then((data) => {
        const filteredSeats = data.filter((seat) => seat.hall === cinemaHallId);
        setSeats(filteredSeats);
      })
      .catch((err) => {
        console.error("Failed to fetch seats:", err);
      });
  },);
  

  const handleSeatClick = (seatId) => {
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter((id) => id !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const calculateTotal = () => {
    const price = ticketType === "normal" ? 15 : 12;
    return selectedSeats.length * price;
  };

  const handleReserveClick = () => {
    navigate("/summary", {
      state: {
        movieTitle,
        cinemaName,
        date: selectedDate,
        time: selectedTime,
        selectedSeats,
        totalPrice: calculateTotal()
      }
    });
  };

  const groupedByRow = seats.reduce((acc, seat) => {
    if (!acc[seat.row]) acc[seat.row] = [];
    acc[seat.row].push(seat);
    return acc;
  }, {});

  return (
    <div className="seat-selection">
      <Header />
      <Navigation />
      <div className="seat-selection-content">
        <div className="content-wrapper">
          <div className="screen-container">
            <div className="screen-bar" />
            <div className="seat-grid">
              {Object.entries(groupedByRow).map(([row, rowSeats]) => (
                <div key={row} className="seat-row">
                  {rowSeats
                    .sort((a, b) => a.number - b.number)
                    .map((seat) => {
                      const isSelected = selectedSeats.includes(seat.id);
                      return (
                        <div
                          key={seat.id}
                          className={`seat ${isSelected ? "selected" : ""}`}
                          onClick={() => handleSeatClick(seat.id)}
                          title={`Row ${seat.row}, No. ${seat.number}`}
                        />
                      );
                    })}
                </div>
              ))}
            </div>

            <div className="seat-legend">
              <div className="legend-item">
                <div className="legend-box available" />
                <span>Available</span>
              </div>
              <div className="legend-item">
                <div className="legend-box selected" />
                <span>Selected</span>
              </div>
              <div className="legend-item">
                <div className="legend-box taken" />
                <span>Taken</span>
              </div>
            </div>
          </div>

          <div className="booking-panel">
            <div className="ticket-types">
              <div className="ticket-options">
                <button
                  className={`ticket-button ${ticketType === "normal" ? "selected" : ""}`}
                  onClick={() => setTicketType("normal")}
                >
                  Normal ($15)
                </button>
                <button
                  className={`ticket-button ${ticketType === "student" ? "selected" : ""}`}
                  onClick={() => setTicketType("student")}
                >
                  Student ($12)
                </button>
              </div>
              <div className="total-section">
                <span className="total-label">Total:</span>
                <span className="total-amount">${calculateTotal()}</span>
              </div>
            </div>
            <button
              className="reserve-button"
              onClick={handleReserveClick}
              disabled={selectedSeats.length === 0}
            >
              Reserve Seats
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;
