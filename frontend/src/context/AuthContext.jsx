import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userProfileString = localStorage.getItem("userProfile");
    if (userProfileString) {
      setUser(JSON.parse(userProfileString));
    }
  }, []);

  const login = (profile) => {
    setUser(profile);
    localStorage.setItem("userProfile", JSON.stringify(profile));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("userProfile");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}