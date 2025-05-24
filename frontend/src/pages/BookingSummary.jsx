import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/BookingSummary.css";
import Header from "../components/Header";

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
    showingPrice,
  } = location.state || {};

  const [isLoading, setIsLoading] = useState(false);
  const [, setError] = useState("");
  const [discountTypes, setDiscountTypes] = useState([]);
  const [tickets, setTickets] = useState(
    selectedSeats?.map(seat => ({
      seat,
      discount: null,
      price: showingPrice, // np. domyślna cena
    })) || []
  );
  const totalPrice = tickets.reduce((sum, ticket) => sum + ticket.price, 0);
  const apiKey = process.env.REACT_APP_API_KEY;

  const apiFetch = useCallback(async (url, options = {}) => {
    const headers = {
      "Authorization": `Api-Key ${apiKey}`,
      ...options.headers,
    };
    return fetch(url, { ...options, headers });
  }, [apiKey]);

  useEffect(() => {
    apiFetch("http://localhost:8000/api/ticket_discounts/")
      .then(res => res.json())
      .then(data => {setDiscountTypes(data.results)})
      .catch(err => console.error(err));
  }, [apiFetch]);


  const handleConfirmBooking = async () => {
    setIsLoading(true);
    setError("");

    const currentTime = new Date().toISOString();

    const ticketsData = tickets.map(ticket => ({
      showing: showingId,
      seat: ticket.seat.id,
      base_price: showingPrice, // lub `ticket.base_price` jeśli masz takie pole
      purchase_price: ticket.price,
      purchase_time: currentTime,
      discount: ticket.discount?.id || null,
      buyer: 1
    }));
    
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
      // alert("Rezerwacja zakończona sukcesem!");
      navigate("/", { state: { booking: responses } });
    } catch (err) {
      setError(err.message || "Wystąpił błąd przy rezerwacji.");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="booking-summary">
      <Header />
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

            <div className="booking-label">Tickets</div>
            <div className="booking-divider" />
              {tickets.map((ticket, index) => (
                <div key={ticket.seat.id} className="booking-ticket">
                  <div className="booking-row">
                    <div className="booking-label">Row</div>
                    <div className="booking-value">{ticket.seat.row}</div>
                  </div>

                  <div className="booking-row">
                    <div className="booking-label">Seat</div>
                    <div className="booking-value">{ticket.seat.number}</div>
                  </div>

                  <div className="booking-row">
                    <div className="booking-label">Ticket Type</div>
                    <select
                      className="booking-select"
                      value={ticket.discount?.id || ""}
                      onChange={(e) => {
                        const selectedId = parseInt(e.target.value);
                        const discount = discountTypes.find(d => d.id === selectedId) || null;
                        const updatedTickets = [...tickets];
                        updatedTickets[index].discount = discount;
                        updatedTickets[index].price = discount
                          ? Math.round((showingPrice * (100 - discount.percentage))) / 100
                          : showingPrice;
                        setTickets(updatedTickets);
                        console.log(ticket.price);
                      }}
                    >
                      <option value="">Regular</option>
                      {discountTypes.map(discount => (
                        <option key={discount.id} value={discount.id}>
                          {discount.name} (-{discount.percentage}%)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="booking-row">
                    <div className="booking-label">Price</div>
                    <div className="booking-value">${ticket.price}</div>
                  </div>

                  <div className="booking-divider" />
                </div>
              ))}

            <div className="booking-total">Total: ${totalPrice}</div>
            <div className="booking-button-container">
              <button onClick={handleConfirmBooking} disabled={isLoading} className="booking-confirm-button">
                {isLoading ? "Loading..." : "Confirm Booking"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSummary;
