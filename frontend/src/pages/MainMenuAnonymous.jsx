import React from 'react';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import '../styles/MainMenuAnonymous.css';

const MainMenuAnonymous = () => {
  return (
    <div className="main-menu">
      <Header />
      <Navigation />
      <div className="main-content">
        <div className="movie-grid">
          {/* Przykładowe karty filmów */}
          {[...Array(6)].map((_, index) => (
            <div key={index} className="movie-card">
              <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/7bbd36b360f8e384db8c6f686f3dd5261acfc64f?placeholderIfAbsent=true&apiKey=5c359e8b7a374e379933ea077887b809" className="movie-image" alt="Movie" />
              {/* <img src="/movie-placeholder.jpg" alt="Movie" className="movie-image" /> */}
              <div className="main-menu-movie-title">Movie Title {index + 1}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MainMenuAnonymous;
