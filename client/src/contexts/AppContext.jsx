import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

// eslint-disable-next-line react-refresh/only-export-components
export const AppContext = createContext();
export function AppContextProvider({ children }) {
  const [isloggedIn, setIsloggedIn] = useState(false);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [userDataa, setUserDataa] = useState(false);

  axios.defaults.withCredentials = true;

  async function getUserData() {
    try {
      const { data } = await axios.get(backendUrl + "/api/user/data");
      data.success ? setUserDataa(data.userData) : toast.error(data.message);
    } catch (err) {
      toast.error(err.message);
    }
  }
  async function getAuthState() {
    try {
      const { data } = await axios.get(backendUrl + "/api/auth/is-auth");
      console.log(data);
      if (data.success) {
        setIsloggedIn(true);
        getUserData();
      }
    } catch (err) {
      toast.error(err.message);
    }
  }
  useEffect(function () {
    getAuthState();
  }, []);

  return (
    <AppContext.Provider
      value={{
        backendUrl,
        isloggedIn,
        getUserData,
        setIsloggedIn,
        userDataa,
        setUserDataa,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
