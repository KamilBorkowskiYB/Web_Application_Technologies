import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import '../styles/Navigation.css';

const Navigation = ({ onFilterSelect }) => {
  const [activeItem, setActiveItem] = useState('Newest');
  const navigate = useNavigate();

  const handleClick = (item) => {
    navigate('/');

    setActiveItem(item);
    if (item === 'Upcoming') {
      const today = new Date().toISOString().split('T')[0];
      onFilterSelect({ release_date_after: today });
    } else if (item === 'Oldest') {
      onFilterSelect({ ordering: 'release_date', upcoming_showings: true });
      // żeby działało trzeba dodać OrderingFilter na backendzie
    } else {
      onFilterSelect({ upcoming_showings: true }); // fallback (pokaż wszystkie nadchodzące filmy)
    } 
    
  };

  return (
    <div className="navigation">
      {['Newest', 'Oldest', 'Upcoming'].map((item) => (
        <div
          key={item}
          className={`nav-item ${activeItem === item ? 'nav-item-active' : ''}`}
          onClick={() => handleClick(item)}
        >
          {item}
        </div>
      ))}
      <li>
        <NavLink to="/explore" className="nav-link">
          Explore By Genre
        </NavLink>
      </li>
    </div>
  );
};


export default Navigation;
