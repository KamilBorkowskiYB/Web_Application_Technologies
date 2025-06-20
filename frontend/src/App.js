import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from './auth/AuthContext';
import "./App.css";
import MainMenu from "./pages/MainMenu.jsx";
import ExploreByGenre from "./pages/ExploreByGenre";
import MovieDetails from "./pages/MovieDetails.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import SeatSelection from "./pages/SeatSelection.jsx";
import BookingSummary from "./pages/BookingSummary.jsx";
import SearchPage from "./pages/SearchPage.jsx";
import MyTickets from "./pages/MyTickets.jsx";
import AfterGoogleLogin from './pages/AfterGoogleLogin.jsx';
import PaymentSuccess from "./pages/PaymentSuccess";
import ProfilePage from "./pages/ProfilePage.jsx";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainMenu />} />
          <Route path="/explore" element={<ExploreByGenre />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/movie/:id" element={<MovieDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/seat-selection" element={<SeatSelection />} />
          <Route path="/summary" element={<BookingSummary />} />
          <Route path="/my-tickets" element={<MyTickets />} />
          <Route path="/after-google-login" element={<AfterGoogleLogin />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
