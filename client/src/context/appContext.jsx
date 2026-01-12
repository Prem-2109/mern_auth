import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";

export const AppContext = createContext();

const backendUrl = import.meta.env.VITE_BACKEND_URL;

/* ✅ Global axios config */
axios.defaults.baseURL = backendUrl;
axios.defaults.withCredentials = true;

export const AppContextProvider = (props) => {
  const [isLoggedIn, setLoggedIn] = useState(false);
  const [userData, setUserData] = useState(false);

  const getAuthState = async () => {
    try {
      const { data } = await axios.get("/api/auth/is-auth");

      if (data.success) {
        setLoggedIn(true);
        getUserData();
      }
    } catch (error) {
      console.log(error);
      setLoggedIn(false);
    }
  };

  const getUserData = async () => {
    try {
      const { data } = await axios.get("/api/user/data");

      if (data.success) {
        setUserData(data.userData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load user data");
    }
  };

  useEffect(() => {
    getAuthState();
  }, []);

  const value = {
    backendUrl,
    isLoggedIn,
    setLoggedIn,
    userData,
    setUserData,
    getUserData,
  };

  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  );
};
