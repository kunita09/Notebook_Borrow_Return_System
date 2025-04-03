import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState({
    isLoggedIn: false,
    role: null,
    email: null,
  });

  const login = (email, role) => {
    setUser({ isLoggedIn: true, role, email });
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userRole", role);
    localStorage.setItem("userEmail", email);
  };

  const logout = () => {
    setUser({ isLoggedIn: false, role: null, email: null });
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
