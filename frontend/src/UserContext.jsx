import React, { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext();

export function useUser() {
  return useContext(UserContext);
}

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Add tripDetails state
  const [tripDetails, setTripDetails] = useState({
    city: "",
    checkin: "",
    checkout: "",
    preference: "",
    budget: 10000,
  });

  useEffect(() => {
    // Check if user is logged in by checking localStorage
    const checkAuthStatus = () => {
      try {
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");

        if (token && userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.log("Error parsing user data from localStorage");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const logout = () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        logout,
        setUser,
        tripDetails,
        setTripDetails,
      }}
    >
      {!loading && children}
    </UserContext.Provider>
  );
}
