import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import '../styles/Header.css'; // jeśli potrzebne globalne style

const Header = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLoginClick = () => {
    navigate('/login'); // Ścieżka do strony logowania
  };

  const handleMainMenuClick = () => {
    navigate('/'); // Ikonka strony głównej
  }

  const handleTicketsClick = () => {
    navigate('/my-tickets'); // Ikonka strony głównej
  }

  useEffect(() => {
    const title = searchParams.get('title') || '';
    setSearchTerm(title);
  }, [searchParams]);

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      const encodedTitle = encodeURIComponent(searchTerm.trim());
      navigate(`/search?title=${encodedTitle}`);
    }
  };

  return (
    <div className="header">
        <div className="header-left">
        <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/11bd867774967a99b714cffb176e7a2909ed002c?placeholderIfAbsent=true&apiKey=5c359e8b7a374e379933ea077887b809" className="logo" alt="Logo" onClick={handleMainMenuClick}/>
        {/* <img src="/logo.png" alt="Logo" className="logo" /> */}
        <div className="search-container">
            <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/58f2a5a32b66391a854a61ba8600b347b2fd5917?placeholderIfAbsent=true&apiKey=5c359e8b7a374e379933ea077887b809" className="search-icon" alt="Search" />
            {/* <img src="/icons/search.svg" alt="Search" className="search-icon" /> */}
            <input
              className="search-placeholder"
              placeholder="Search movies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearch}
            />
        </div>
        </div>
        <div className="header-right">
        <div className="location">
            <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/1af5acc2594334f501d2e653072ad1f9a8d40440?placeholderIfAbsent=true&apiKey=5c359e8b7a374e379933ea077887b809" className="location-icon" alt="Location" />
            {/* <img src="/icons/location.svg" alt="Location" className="location-icon" /> */}
            <span>Downtown, Warsaw</span>
        </div>
        <div className="my-tickets-button" onClick={handleTicketsClick}>My Tickets</div>
        <div className="sign-in-button" onClick={handleLoginClick}>Sign In</div>
        </div>
    </div>
    );
};

export default Header;
