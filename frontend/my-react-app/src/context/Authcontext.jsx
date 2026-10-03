// import { createContext, useContext, useState } from "react";
// import { logoutUser, getCurrentUser } from "../services/authService";

// export const AuthContext = createContext(null);

// export const AuthProvider = ({ children }) => {
//   // authService.loginUser() already saves token + user to localStorage
//   // So on first load, we just READ from localStorage via getCurrentUser()
//   const [user, setUser] = useState(() => getCurrentUser());

//   const login = (userData) => {
//     // authService already called localStorage.setItem() before this runs
//     // We just sync React state here
//     setUser(userData);
//   };

//   const logout = () => {
//     logoutUser(); // removes token + user from localStorage
//     setUser(null);
//   };

//   return (
//     <AuthContext.Provider value={{ user, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);

import { createContext, useContext, useState } from "react";
import { logoutUser, getCurrentUser } from "../services/authService";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = getCurrentUser();
    // ✅ FIXED: if stored user has no role, their token is stale (pre-fix login)
    // Force them to log in again so the new authController returns role properly
    if (stored && !stored.role) {
      logoutUser();
      return null;
    }
    return stored;
  });

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    logoutUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
