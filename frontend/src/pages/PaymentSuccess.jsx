import React from "react";
import { Link } from "react-router-dom";
import "../styles/PaymentSuccess.css";

const PaymentSuccess = () => {
  return (
    <div className="payment-success-wrapper">
      <div className="payment-box">
        <h1 className="success-title">✅ Płatność zakończona sukcesem!</h1>
        <p className="success-message">Dziękujemy za zakup. Twój bilet został zarezerwowany.</p>
        <Link to="/" className="return-home-button">
          Wróć na stronę główną
        </Link>
      </div>
    </div>
  );
};

export default PaymentSuccess;
