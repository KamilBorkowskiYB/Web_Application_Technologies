import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from '../auth/AuthContext';
import Header from "../components/Header";
import TicketCard from "../components/TicketCard";
import "../styles/MyTickets.css";
import { API_URL } from '../config';

const MyTickets = () => {
  const [expandedDetails, setExpandedDetails] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const apiKey = process.env.REACT_APP_API_KEY;
  const { user } = useContext(AuthContext);
  const [tickets, setTickets] = useState(user?.tickets || []);
  

  const showingCache = {};
  const movieCache = {};
  const seatCache = {};
  const ticketTypeCache = {};

  useEffect(() => {
    if (user?.tickets) {
      setTickets(user.tickets);
      setIsLoading(false);
    }
  }, [user]);

  const fetchShowingDetails = async (showingId) => {
    if (showingCache[showingId]) return showingCache[showingId];

    const response = await fetch(`${API_URL}/api/movie_showings/${showingId}`, {
      headers: { Authorization: `Api-Key ${apiKey}` }
    });
    const data = await response.json();
    showingCache[showingId] = data;
    return data;
  };

  const fetchMovieDetails = async (movieId) => {
    if (movieCache[movieId]) return movieCache[movieId];
    const response = await fetch(`${API_URL}/api/movies/${movieId}/`, {
      headers: { Authorization: `Api-Key ${apiKey}` },
    });
    const data = await response.json();
    movieCache[movieId] = data;
    return data;
  };

  const fetchSeatDetails = async (seatId) => {
    if (seatCache[seatId]) return seatCache[seatId];
    const response = await fetch(`${API_URL}/api/seats/${seatId}/`, {
      headers: { Authorization: `Api-Key ${apiKey}` },
    });
    const data = await response.json();
    seatCache[seatId] = data;
    return data;
  };

  const fetchTicketType = async (ticketTypeId) => {
    if (ticketTypeCache[ticketTypeId]) return ticketTypeCache[ticketTypeId];
    const response = await fetch(`${API_URL}/api/ticket_discounts/${ticketTypeId}/`, {
      headers: { Authorization: `Api-Key ${apiKey}` },
    });
    const data = await response.json();
    ticketTypeCache[ticketTypeId] = data;
    return data;
  };


  const handleViewDetails = async (ticketId, showingId, seatId, ticketTypeId) => {
    try {
      const showing = await fetchShowingDetails(showingId);
      const movie = await fetchMovieDetails(showing.movie);
      const seat = await fetchSeatDetails(seatId);
      const ticketType = await fetchTicketType(ticketTypeId)

      const rawDate = showing.date;
      const formattedDate = new Date(rawDate).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      setExpandedDetails((prev) => ({
        ...prev,
        [ticketId]: {
          movieTitle: movie.title,
          posterUrl: movie.poster || "https://placehold.co/120x180",
          dateTime: formattedDate,
          cinema: showing.cinema_name || "No info", // Trzeba dodać w bazie danych cinema_id do biletu
          hall: showing.hall,
          seat: `Row ${seat.row}, Seat ${seat.number}`,
          ticketType: ticketType.name,
        },
      }));
    } catch (error) {
      console.error("Error fetching ticket details:", error);
    }
  };

  return (
    <div className="my-tickets">
      <Header />
      <div className="my-tickets-content">
        <h1 className="my-tickets-title">My Tickets</h1>
        {isLoading ? (
          <div className="tickets-loading">
            <div className="tickets-loader"></div>
            <p>Loading your tickets...</p>
          </div>
        ) : tickets.length > 0 ? (
          <div className="tickets-list">
            {tickets.map((ticket) => {
              const details = expandedDetails[ticket.id];
              return (
                <TicketCard
                  key={ticket.id}
                  ticketId={ticket.id}
                  showingId={ticket.showing}
                  seatId={ticket.seat}
                  purchaseDate={ticket.purchase_time}
                  purchasePrice={ticket.purchase_price}
                  isCancelled={ticket.cancelled}
                  details={details}
                  onViewDetails={() =>
                    handleViewDetails(ticket.id, ticket.showing, ticket.seat, ticket.discount)
                  }
                />
              );
            })}
          </div>
        ) : (
          <div className="no-tickets">
            <p>You don't have any tickets yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTickets;
