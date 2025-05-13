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
  const [takenSeats, setTakenSeats] = useState([]);
  const [justTakenSeats, setJustTakenSeats] = useState([]);
  const [seatTypes, setSeatTypes] = useState({}); // { seatId: "normal" | "student" }
  const [activeType, setActiveType] = useState("normal"); // przycisk aktualnego typu
  const [ticketType, setTicketType] = useState("normal");

  useEffect(() => {
    // Pobranie wszystkich miejsc dla danego seansu
    fetch("http://127.0.0.1:8000/api/seats/")
      .then((res) => res.json())
      .then((data) => {
        const filteredSeats = data.filter((seat) => seat.hall === cinemaHallId);
        setSeats(filteredSeats);
      })
      .catch((err) => {
        console.error("Failed to fetch seats:", err);
      });
      
      // Pobranie zajętych miejsc dla danego seansu
    fetch(`http://127.0.0.1:8000/api/tickets/?showing=${showingId}`)
      .then((res) => res.json())
      .then((data) => {
        const taken = data.map(ticket => ticket.seat);
        setTakenSeats(taken);
      })
      .catch((err) => {
        console.error("Failed to fetch taken seats:", err);
      });
  }, [cinemaHallId, showingId]);

  
  
  // Aktualizacja zajętych miejsc w czasie rzeczywistym
  useEffect(() => {
    const socket = new WebSocket(`ws://localhost:8000/ws/movie_showings/${showingId}/`);

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "ticket_booked") {
        const bookedSeatId = message.data.seat_id;
        setTakenSeats((prev) => [...new Set([...prev, bookedSeatId])]);

        // Jeśli ktoś w tym czasie kliknął i próbował zająć to samo miejsce — odznacz
        setSelectedSeats((prevSelected) =>
          prevSelected.filter((seatId) => seatId !== bookedSeatId)
        );

        // Dodaj do migających miejsc
      setJustTakenSeats((prev) => [...prev, bookedSeatId]);

      // Usuń po chwili
      setTimeout(() => {
        setJustTakenSeats((prev) => prev.filter((id) => id !== bookedSeatId));
      }, 1000);
      }
    };

    socket.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    return () => {
      socket.close();
    };
  }, [showingId]);

  const handleSeatClick = (seatId) => {
  if (selectedSeats.includes(seatId)) {
    setSelectedSeats(selectedSeats.filter((id) => id !== seatId));
    const newSeatTypes = { ...seatTypes };
    delete newSeatTypes[seatId];
    setSeatTypes(newSeatTypes);
  } else {
    setSelectedSeats([...selectedSeats, seatId]);
    setSeatTypes({
      ...seatTypes,
      [seatId]: activeType,
    });
  }
};

  const calculateTotal = () => {
    return selectedSeats.reduce((sum, seatId) => {
      const type = seatTypes[seatId] || "normal";
      const price = type === "student" ? 12 : 15;
      return sum + price;
    }, 0);
  };

  const handleReserveClick = () => {
    navigate("/summary", {
      state: {
        showingId,
        movieTitle,
        cinemaName,
        date: selectedDate,
        time: selectedTime,
        selectedSeats,
        seatTypes,
        totalPrice: calculateTotal()
      }
    });
  };

  const groupedByRow = seats.reduce((acc, seat) => {
    if (!acc[seat.row]) acc[seat.row] = [];
    acc[seat.row].push(seat);
    return acc;
  }, {});

  // Załóżmy, że wiemy ile maksymalnie siedzeń jest w rzędzie (lub oblicz to dynamicznie):
  const maxSeatsInRow = Math.max(...Object.values(groupedByRow).map(row => row.length));

  // Funkcja do przekształcania numeru siedzenia na literę
  const getSeatLetter = (number) => String.fromCharCode(64 + number); // np. 1 => A, 2 => B

  return (
    <div className="seat-selection">
      <Header />
      <Navigation />
      <div className="seat-selection-content">
        <div className="content-wrapper">
          <div className="screen-container">
            <div className="screen-bar" />
            <div className="seat-container">
              {seats && seats.length > 0 ? (
                <div className="seat-header">
                  <div className="seat-corner" /> {/* pusty narożnik */}
                  {[...Array(maxSeatsInRow)].map((_, index) => (
                    <div key={index} className="seat-label seat-letter">
                      {getSeatLetter(index + 1)}
                    </div>
                  ))}
                </div>
              ) : (
                <div>Loading seats...</div> // Informacja, że dane są w trakcie ładowania
              )}
              <div className="seat-grid">
                {Object.entries(groupedByRow).map(([row, rowSeats]) => (
                  <div key={row} className="seat-row">
                    {/* Numer rzędu z lewej */}
                    <div className="seat-label seat-row-number">{row}</div>
                    {rowSeats
                      .sort((a, b) => a.number - b.number)
                      .map((seat) => {
                        const isSelected = selectedSeats.includes(seat.id);
                        const isTaken = takenSeats.includes(seat.id);
                        const isJustTaken = justTakenSeats.includes(seat.id);
                        return (
                          <div
                            key={seat.id}
                            className={`seat 
                                        ${isSelected ? "selected" : ""} 
                                        ${isTaken ? "taken" : ""} 
                                        ${isJustTaken ? "just-taken" : ""} 
                                        ${isSelected && seatTypes[seat.id] === "student" ? "student" : ""}
                                        ${isSelected && seatTypes[seat.id] === "normal" ? "normal" : ""}`}
                            onClick={() => !isTaken && handleSeatClick(seat.id)}
                            title={`Row ${seat.row}, No. ${seat.number} — ${seatTypes[seat.id] || ""}`}
                          >
                            {isSelected && (
                              <span className="seat-label">
                                {seatTypes[seat.id] === "student" ? "S" : "N"}
                              </span>
                            )}
                          </div>
                        );
                      })}
                  </div>
                ))}
              </div>
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
                  className={`ticket-button ${activeType === "normal" ? "selected" : ""}`}
                  onClick={() => setActiveType("normal")}
                >
                  Normal ($15)
                </button>
                <button
                  className={`ticket-button ${activeType === "student" ? "selected" : ""}`}
                  onClick={() => setActiveType("student")}
                >
                  Student ($12)
                </button>
              </div>
              <div className="info-hint">
                Click seats to assign selected type
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
