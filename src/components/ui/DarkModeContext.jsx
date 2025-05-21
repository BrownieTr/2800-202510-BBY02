// import React, { createContext, useState, useEffect, useContext } from 'react';

// const DarkModeContext = createContext();

// export const DarkModeProvider = ({ children }) => {
//   const [darkMode, setDarkMode] = useState(() => {
//     return localStorage.getItem('darkMode') === 'true';
//   });

//   useEffect(() => {
//     localStorage.setItem('darkMode', darkMode);
//     const className = 'dark-mode';
//     const element = document.documentElement;

//     if (darkMode) {
//       element.classList.add(className);
//     } else {
//       element.classList.remove(className);
//     }
//   }, [darkMode]);

//   return (
//     <DarkModeContext.Provider value={{ darkMode, setDarkMode }}>
//       {children}
//     </DarkModeContext.Provider>
//   );
// };

// export const useDarkMode = () => useContext(DarkModeContext);
