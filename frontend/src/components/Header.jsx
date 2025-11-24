import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getUserInfo } from '../auth/auth';
import '../styles/Header.css';

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

  const handleMovieManagementClick = () => {
    navigate('/movie-management');
  }

  const handleMovieShowingManagementClick = () => {
    navigate('/movie-showing-management');
  }

  return (
    <div className="header">
      <div className="header-left">
        <img
          src="/favicon.png"
          className="logo"
          alt="Logo"
          onClick={handleMainMenuClick}
        />
        <div
          className="home-link"
          onClick={handleMainMenuClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') handleMainMenuClick(); }}
        >
          Home
        </div>
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
        {user && (
          <>
            <div className="my-tickets-button" onClick={handleTicketsClick}>My Tickets</div>
            <div className="profile-button" onClick={handleProfileClick}>My Profile</div>

            {user.is_staff && (
              <>
                <div className="management-button" onClick={handleMovieShowingManagementClick}>Showing Management</div>
                <div className="management-button" onClick={handleMovieManagementClick}>Movie Management</div>
              </>
            )}

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
