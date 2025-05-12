import React, { useState } from 'react';
import '../styles/Navigation.css';

const Navigation = ({ onFilterSelect }) => {
  const [activeItem, setActiveItem] = useState('Popular');

  const handleClick = (item) => {
    setActiveItem(item);
    if (item === 'Upcoming') {
      const today = new Date().toISOString().split('T')[0];
      onFilterSelect({ release_date_after: today });
    } else if (item === 'New') {
      onFilterSelect({ ordering: 'release_date' });
      // żeby działało trzeba dodać OrderingFilter na backendzie
    } else {
      onFilterSelect({}); // fallback (pokaż wszystkie)
    }
  };

  return (
    <div className="navigation">
      {['Popular', 'New', 'Top Rated', 'Upcoming'].map((item) => (
        <div
          key={item}
          className={`nav-item ${activeItem === item ? 'nav-item-active' : ''}`}
          onClick={() => handleClick(item)}
        >
          {item}
        </div>
      ))}
    </div>
  );
};


export default Navigation;
