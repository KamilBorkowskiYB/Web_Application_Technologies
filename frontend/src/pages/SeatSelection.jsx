import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Navigation from "../components/Navigation";
import "../styles/SeatSelection.css";
import { API_URL } from "../config";

const SeatSelection = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cinemaHallId, showingId, movieTitle, cinemaName, selectedDate, selectedTime, showingPrice } = location.state || {};

  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [takenSeats, setTakenSeats] = useState([]);
  const [justTakenSeats, setJustTakenSeats] = useState([]);
  const [seatTypes, setSeatTypes] = useState({}); // { seatId: "normal" | "student" }
  const apiKey = process.env.REACT_APP_API_KEY;

  const apiFetch = (url, options = {}) => {
  const headers = {
    "Authorization": `Api-Key ${apiKey}`,
    ...options.headers,
  };
  return fetch(url, { ...options, headers });
  };

  // Tymczasowe rozwiązanie z paginacja na frontendzie (Ładowanie parę stron naraz)
  const fetchAllPages = async (url) => {
    let results = [];
    let nextUrl = url;

    while (nextUrl) {
      const res = await apiFetch(nextUrl);
      if (!res.ok) throw new Error("Failed to fetch data");
      const data = await res.json();

      results = [...results, ...data.results];
      nextUrl = data.next;  // zakładam, że backend zwraca 'next' jako URL lub null
    }

    return results;
  };


  useEffect(() => {
    if (!cinemaHallId || !showingId) return;

    // Pobierz wszystkie miejsca (wszystkie strony)
    fetchAllPages(`${API_URL}/api/seats/`)
      .then((allSeats) => {
        const filteredSeats = allSeats.filter(seat => seat.hall === cinemaHallId);
        setSeats(filteredSeats);
      })
      .catch((err) => console.error("Failed to fetch seats:", err));

    // Pobierz wszystkie bilety (wszystkie strony)
    fetchAllPages(`${API_URL}/api/tickets/?showing=${showingId}`)
      .then((allTickets) => {
        const taken = allTickets.map(ticket => ticket.seat);
        setTakenSeats(taken);
      })
      .catch((err) => console.error("Failed to fetch taken seats:", err));
  }, [cinemaHallId, showingId]);


  
  // Aktualizacja zajętych miejsc w czasie rzeczywistym
  useEffect(() => {
    const socket = new WebSocket(`ws://127.0.0.1:8000/ws/movie_showings/${showingId}/`);

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
    const seat = seats.find((s) => s.id === seatId);
    const alreadySelected = selectedSeats.some((s) => s.id === seatId);

    if (alreadySelected) {
      setSelectedSeats(selectedSeats.filter((s) => s.id !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, seat]);
    }
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
        showingPrice
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

  return (
    <div className="seat-selection">
      <Header />
      <div className="seat-selection-content">
        {seats && seats.length > 0 ? (
        <div className="seat-selection-content-wrapper">
        <div className="seat-selection-title">Select Seats</div>
          <div className="screen-container">
            <div className="screen-bar" />
            <div className="seat-container">
                <div className="seat-header">
                  <div className="seat-corner" /> {/* pusty narożnik */}
                  {[...Array(maxSeatsInRow)].map((_, index) => (
                    <div key={index} className="seat-label seat-letter">
                      {index + 1}
                    </div>
                  ))}
                </div>
              <div className="seat-grid">
                {Object.entries(groupedByRow).map(([row, rowSeats]) => (
                  <div key={row} className="seat-row">
                    {/* Numer rzędu z lewej */}
                    <div className="seat-label seat-row-number">{row}</div>
                    {rowSeats
                      .sort((a, b) => a.number - b.number)
                      .map((seat) => {
                        const isSelected = selectedSeats.some((s) => s.id === seat.id);
                        const isTaken = takenSeats.includes(seat.id);
                        const isJustTaken = justTakenSeats.includes(seat.id);
                        return (
                          <div
                            key={seat.id}
                            className={`seat 
                                        ${isSelected ? "selected" : ""} 
                                        ${isTaken ? "taken" : ""} 
                                        ${isJustTaken ? "just-taken" : ""}`}
                            onClick={() => !isTaken && handleSeatClick(seat.id)}
                            title={`Row ${seat.row}, No. ${seat.number}}`}
                          >
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
            <button
              className="reserve-button"
              onClick={handleReserveClick}
              disabled={selectedSeats.length === 0}
            >
              Reserve Seats
            </button>
          </div>
        </div>
        ) : (
          <div className="loading-seats">
            <div className="popcorn-loader" />
            <p>Loading seats... grab your popcorn! 🍿</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeatSelection;
