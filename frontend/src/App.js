import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import MainMenuAnonymous from "./pages/MainMenuAnonymous.jsx";
import ExploreByGenre from "./pages/ExploreByGenre";
import MovieDetails from "./pages/MovieDetails.jsx";
import Login from "./pages/Login.jsx";
import SeatSelection from "./pages/SeatSelection.jsx";
import BookingSummary from "./pages/BookingSummary.jsx";
import SearchPage from "./pages/SearchPage.jsx";
import MyTickets from "./pages/MyTickets.jsx";
import AfterGoogleLogin from './pages/AfterGoogleLogin.jsx';
import PaymentSuccess from "./pages/PaymentSuccess";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainMenuAnonymous />} />
        <Route path="/explore" element={<ExploreByGenre />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/movie/:id" element={<MovieDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/seat-selection" element={<SeatSelection />} />
        <Route path="/summary" element={<BookingSummary />} />
        <Route path="/my-tickets" element={<MyTickets />} />
        <Route path="/after-google-login" element={<AfterGoogleLogin />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
      </Routes>
    </Router>
  );
}

export default App;
