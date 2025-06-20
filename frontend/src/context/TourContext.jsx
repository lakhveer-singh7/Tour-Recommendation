import React, { createContext, useContext, useState } from 'react';

const TourContext = createContext();

export const TourProvider = ({ children }) => {
  const [savedTours, setSavedTours] = useState([]);
  const [completedTours, setCompletedTours] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  const saveTour = (tour) => {
    setSavedTours([...savedTours, tour]);
  };

  const completeTour = (tour) => {
    setCompletedTours([...completedTours, tour]);
  };

  const addToWishlist = (tour) => {
    setWishlist([...wishlist, tour]);
  };

  return (
    <TourContext.Provider
      value={{
        savedTours,
        completedTours,
        wishlist,
        saveTour,
        completeTour,
        addToWishlist,
      }}
    >
      {children}
    </TourContext.Provider>
  );
};

export const useTour = () => useContext(TourContext); 