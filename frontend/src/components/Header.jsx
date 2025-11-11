import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getUserInfo } from '../auth/auth'; // ścieżka zależna od Twojej struktury
import '../styles/Header.css'; // jeśli potrzebne globalne style

const Header = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const title = searchParams.get('title') || '';
    setSearchTerm(title);
  }, [searchParams]);

  useEffect(() => {
    const checkUser = async () => {
      const userInfo = await getUserInfo();
      if (userInfo) setUser(userInfo);
    };

    checkUser();
  }, []);

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    navigate('/');
  };

  const handleMainMenuClick = () => {
    navigate('/');
  };

  const handleTicketsClick = () => {
    navigate('/my-tickets');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      const encodedTitle = encodeURIComponent(searchTerm.trim());
      navigate(`/search?title=${encodedTitle}`);
    }
  };

  const handleManagementClick = () => {
    navigate('/management');
  }

  return (
    <div className="header">
      <div className="header-left">
        {/* TODO: zamiana obrazka na ikonę z PrimeIcons/FontAwesome? */}
        <img
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/11bd867774967a99b714cffb176e7a2909ed002c?placeholderIfAbsent=true&apiKey=5c359e8b7a374e379933ea077887b809"
          className="logo"
          alt="Logo"
          onClick={handleMainMenuClick}
        />
        <div className="search-container">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/58f2a5a32b66391a854a61ba8600b347b2fd5917?placeholderIfAbsent=true&apiKey=5c359e8b7a374e379933ea077887b809"
            className="search-icon"
            alt="Search"
          />
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
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/1af5acc2594334f501d2e653072ad1f9a8d40440?placeholderIfAbsent=true&apiKey=5c359e8b7a374e379933ea077887b809"
            className="location-icon"
            alt="Location"
          />
          <span>Downtown, Warsaw</span>
        </div>

        {user && (
          <>
            <div className="my-tickets-button" onClick={handleTicketsClick}>My Tickets</div>
            <div className="profile-button" onClick={handleProfileClick}>My Profile</div>
            <div className="management-button" onClick={handleManagementClick}>Management</div>
            <div className="sign-out-button" onClick={handleLogout}>Logout</div>
          </>
        )}

        {!user && (
          <div className="sign-in-button" onClick={handleLoginClick}>Sign In</div>
        )}
      </div>
    </div>
  );
};


export default Header;
