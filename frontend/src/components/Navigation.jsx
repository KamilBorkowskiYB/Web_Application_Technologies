import React, { useState } from 'react';
import '../styles/Navigation.css';

const Navigation = () => {
  const [activeItem, setActiveItem] = useState('Popular'); // Domyślnie aktywny element

  const handleClick = (item) => {
    setActiveItem(item); // Zmiana aktywnego elementu po kliknięciu
  };

  return (
    <div className="navigation">
      <div
        className={`nav-item ${activeItem === 'Popular' ? 'nav-item-active' : ''}`}
        onClick={() => handleClick('Popular')}
      >
        Popular
      </div>
      <div
        className={`nav-item ${activeItem === 'New' ? 'nav-item-active' : ''}`}
        onClick={() => handleClick('New')}
      >
        New
      </div>
      <div
        className={`nav-item ${activeItem === 'Top Rated' ? 'nav-item-active' : ''}`}
        onClick={() => handleClick('Top Rated')}
      >
        Top Rated
      </div>
      <div
        className={`nav-item ${activeItem === 'Upcoming' ? 'nav-item-active' : ''}`}
        onClick={() => handleClick('Upcoming')}
      >
        Upcoming
      </div>
    </div>
  );
};

export default Navigation;
