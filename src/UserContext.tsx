import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

// Declare the global Telegram object to avoid TypeScript errors
declare global {
  interface Window { 
    Telegram: any;
  }
}

// Define the shape of the context's value
interface UserContextType {
  userID: string;
  setUserID: (newID: string) => void;
  points: number;
  setPoints: (newPoints: number | ((prevPoints: number) => number)) => void;
  isStar: boolean;
  setIsStar: (value: boolean) => void;
  invitedby: string;
  setInvitedby: (value: string) => void;
}

// Creating the context with default values
const UserContext = createContext<UserContextType>({
  userID: "default",
  setUserID: () => {},
  points: 0,
  setPoints: () => {},
  isStar: false,
  setIsStar: () => {},
  invitedby: "",
  setInvitedby: () => {},
});

// Provider component to wrap around the application
export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userID, setUserID] = useState<string>("202376895"); // Default userID if not set by Telegram
  const [points, setPoints] = useState<number>(0); // Default points
  const [isStar, setIsStar] = useState<boolean>(false); // Default isStar
  const [invitedby, setInvitedby] = useState<string>(""); // Default invitedby

  useEffect(() => {
    // Ensure the Telegram object is available
    if (typeof window.Telegram !== 'undefined' && window.Telegram.WebApp) {
      window.Telegram.WebApp.ready();

      // Extract user information from Telegram API
      const initDataUnsafe = window.Telegram.WebApp.initDataUnsafe;
      const extractedUserID = initDataUnsafe.user?.id || "202376895"; // Use default if userID is not found
      const extractedIsStar = initDataUnsafe.user?.is_premium || false; // Extract isStar
      const startParam = initDataUnsafe.start_param || ""; // Extract start_param, which may contain invitedby

      setUserID(extractedUserID); // Update context with the fetched userID
      setIsStar(extractedIsStar); // Update isStar

      // Extract invitedby from startParam if available
      if (startParam.startsWith("invitedby_")) {
        const invitedbyID = startParam.replace("invitedby_", "");
        setInvitedby(invitedbyID);
      }
    } else {
      console.log('Telegram API is not available, using default values.');
    }
  }, []);

  return (
    <UserContext.Provider value={{ userID, setUserID, points, setPoints, isStar, setIsStar, invitedby, setInvitedby }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to make using the context easier in other components
export const useUser = () => useContext(UserContext);
