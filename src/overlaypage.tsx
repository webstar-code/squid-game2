import React, { useEffect, useState } from 'react';
import { useUser } from "./UserContext";
import logoImage from './images/claim.png'; // Importing the logo image
import checkboxImage from './images/check3.png'; // Importing the checkbox image
import middleImage from './images/star.png'; // Importing the new middle image for finalPage2

interface overlaypageProps {
  closeOverlay: () => void;
}

const overlaypage: React.FC<overlaypageProps> = ({ closeOverlay }) => {
  const { userID: userId, isStar, invitedby } = useUser(); // Get values from context

  const [completed, setCompleted] = useState([false, false, false, false]);
  const [tickVisible, setTickVisible] = useState([false, false, false, false]);
  const [showFinalPage, setShowFinalPage] = useState(false);
  const [showFinalPage2, setShowFinalPage2] = useState(false);
  const [showFinalPage3, setShowFinalPage3] = useState(false);
  const [yearsAgo, setYearsAgo] = useState(1); // Initially set to 1
  const [totalreward, setTotalreward] = useState(1); // Initially set to 1

  const [isDataFetched, setIsDataFetched] = useState(false); // Track if data has been fetched
  const fetchYearsAgo = async () => {
    try {
      // Log the values of userId, isStar, and invitedby for debugging
      console.log(userId, isStar, invitedby);
  
      // Construct the URL with the userId parameter
      const url = `https://python-backend-5wr2.onrender.com/get_creation_month_count?userid=${userId}`;
      
      // Fetch data from the API
      const response = await fetch(url);
      
      if (response.ok) {
        // Parse the JSON response
        const data = await response.json();
        console.log('API response:', data);
  
        // Set state for years ago based on API response
        setYearsAgo(data.years);
        setIsDataFetched(true); // Flag indicating data has been fetched
  
        // Calculate total reward, additional if 'isStar' is true
        const additionalReward = isStar ? 2500 : 0;
        const totalCalculatedReward = data.reward + additionalReward;
  
        console.log('Total Calculated Reward:', totalCalculatedReward); // Logging the computed reward
  
        // Update state for total reward
        setTotalreward(totalCalculatedReward);
  
        // POST request to update the user with the new total reward
        await fetch('https://python-backend-5wr2.onrender.com/update_user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            UserId: userId,
            totalstim: totalCalculatedReward
          })
        });
  
        // Check if 'invitedby' is empty
        if (!invitedby) {
          // If invitedby is empty, log the message and skip further API calls
          console.log("invitedby is empty, skipping further API calls");
        }
        
      } else {
        // Log error if the API response was not okay
        console.error('Error fetching data:', response.statusText);
      }
    } catch (error) {
      // Log any errors that occur during the fetch operation
      console.error('API call error:', error);
    }
  };
  


  // Use useEffect to log the updated totalreward when it changes
  useEffect(() => {
    console.log('Updated Total Reward:', totalreward); // Log after totalreward is updated
  }, [totalreward]);
  // Fetch yearsAgo when the component mounts
  useEffect(() => {
    fetchYearsAgo();
  }, []);

  // Run animation alongside data fetch
  useEffect(() => {
    completed.forEach((_, index) => {
      setTimeout(() => {
        setCompleted(prev => {
          const updated = [...prev];
          updated[index] = true;
          return updated;
        });

        setTimeout(() => {
          setTickVisible(prev => {
            const updated = [...prev];
            updated[index] = true;
            return updated;
          });

          if (index === completed.length - 1) {
            setTimeout(() => {
              if (isDataFetched) {
                setShowFinalPage(true);
              }
            }, 1000);
          }
        }, 1000);
      }, index * 2000);
    });
  }, [isDataFetched]);

  // finalPage3
  const FinalPage3 = () => {
    return (
      <div
        className="fixed inset-0 flex flex-col justify-between items-center bg-gradient-to-b  from-[#FF3D7C] via-[#FF819E] to-[#F6E5D3]"
        style={{
          minHeight: "100vh",
          color: "white",
          textAlign: "center",
          padding: "0 16px",
          zIndex: 9999,
        }}
      >
        {/* Three Lines at the Top */}
        <div className="mt-20 flex justify-center items-center space-x-2">
          <div
            style={{
              height: "4px",
              backgroundColor: "gray", // First line is gray
              width: "50px",
            }}
          ></div>
          <div
            style={{
              height: "4px",
              backgroundColor: "gray", // Second line is gray
              width: "80px",
            }}
          ></div>
          <div
            style={{
              height: "4px",
              backgroundColor: "white", // Third line is white
              width: "50px",
            }}
          ></div>
        </div>

        {/* Top Text */}
        <div className="mt-4">
          <h1 className="text-2xl font-bold">We owe you GAME!</h1>
          <p className="text-base mt-1">HERE YOU GO</p>
        </div>

        {/* Central Image (replacing the 10) */}
        <div className="flex flex-col items-center">
          <div className="text-[4.5rem] font-extrabold leading-none">
            {totalreward} {/* Use totalreward instead of the hardcoded '10' */}
          </div>
          <p className="text-2xl mt-1">SQUID GAME</p>
        </div>

        {/* Bottom Text */}
        <div className="mb-6">
          <p className="text-xs"></p>
          <p className=" mt-1">Rewarded</p>
        </div>

        {/* Finish Button */}
        <button
          onClick={() => {
            console.log("Finish button clicked"); // Add this to debug
            closeOverlay();
          }}
          className="px-6 py-3 bg-white text-black rounded-full text-lg font-semibold mb-8"
          style={{ width: "80%" }}
        >
          Finish
        </button>
      </div>
    );
  };

  // finalPage2
  const FinalPage2 = () => {
    return (
      <div
        className="fixed inset-0 flex flex-col justify-between items-center bg-gradient-to-b  from-[#FF3D7C] via-[#FF819E] to-[#F6E5D3]"
        style={{
          minHeight: "100vh",
          color: "white",
          textAlign: "center",
          padding: "0 16px",
          zIndex: 9999,
        }}
      >
        {/* Three Lines at the Top */}
        <div className="mt-20 flex justify-center items-center space-x-2">
          <div
            style={{
              height: "4px",
              backgroundColor: "gray", // First line is gray
              width: "50px",
            }}
          ></div>
          <div
            style={{
              height: "4px",
              backgroundColor: "white", // Second line is white
              width: "80px",
            }}
          ></div>
          <div
            style={{
              height: "4px",
              backgroundColor: "gray", // Third line is gray
              width: "50px",
            }}
          ></div>
        </div>

        {/* Top Text */}
        <div className="mt-4">
          <h1 className="text-2xl font-bold">You are a legend!</h1>
          {/* Conditionally render based on the value of 'isStar' */}
          {isStar ? (
            <p className="text-base mt-1">Telegram star!!</p>
          ) : (
            <p className="text-base mt-1">Star doesn't matter!!</p>
          )}
        </div>

        {/* Central Image (replacing the 10) */}
        <div className="flex flex-col items-center">
          <img
            src={middleImage}
            alt="Middle Image"
            className="w-40 h-40 z-50"
          />{" "}
          {/* Replacing 10 with image */}
        </div>

        {/* Bottom Text */}
        <div className="mb-6">
          <p className="text-xs"></p>
          <p className="text-xs mt-1">Status Confirmed</p>
        </div>

        {/* Continue Button (Navigate to finalPage3) */}
        <button
          onClick={() => setShowFinalPage3(true)} // When clicking continue, go to finalPage3
          className="px-6 py-3 bg-white text-black rounded-full text-lg font-semibold mb-8"
          style={{ width: "80%" }}
        >
          Continue
        </button>
      </div>
    );
  };

  // finalPage
  const FinalPage = () => {
    return (
      <div
        className="fixed inset-0 flex flex-col justify-between items-center bg-gradient-to-b  from-[#FF3D7C] via-[#FF819E] to-[#F6E5D3]"
        style={{
    
          minHeight: "100vh",
          color: "white",
          textAlign: "center",
          padding: "0 16px",
          zIndex: 9999,
        }}
      >
        {/* Three Lines at the Top */}
        <div className="mt-20 flex justify-center items-center space-x-2">
          <div
            style={{
              height: "4px",
              backgroundColor: "white", // First line is white
              width: "50px",
            }}
          ></div>
          <div
            style={{
              height: "4px",
              backgroundColor: "gray", // Second line is gray
              width: "80px",
            }}
          ></div>
          <div
            style={{
              height: "4px",
              backgroundColor: "gray", // Third line is gray
              width: "50px",
            }}
          ></div>
        </div>

        {/* Top Text */}
        <div className="mt-4">
          <h1 className="text-2xl font-bold">Legendary status!</h1>
          <p className="text-base mt-1">You've joined Telegram</p>
        </div>

        {/* Central Large Text */}
        <div className="flex flex-col items-center">
          <div className="text-[4.5rem] font-extrabold leading-none">
            {yearsAgo}
          </div>{" "}
          {/* Dynamically using the variable */}
          <p className="text-2xl mt-1">years ago</p>
        </div>

        {/* Bottom Text */}
        <div className="mb-6">
          <p className="text-xs">Your account number is #{userId}.</p>
          <p className="text-xs mt-1">🔥</p>
        </div>

        {/* Continue Button */}
        <button
          onClick={() => setShowFinalPage2(true)} // When clicking continue, go to finalPage2
          className="px-6 py-3 bg-white text-black rounded-full text-lg font-semibold mb-8"
          style={{ width: "80%" }}
        >
          Continue
        </button>
      </div>
    );
  };

  if (showFinalPage3) {
    return <FinalPage3 />;
  }

  if (showFinalPage2) {
    return <FinalPage2 />;
  }

  if (showFinalPage) {
    console.log(userId);
    return <FinalPage />;
  }

  // Main page content (original content)
  return (
    <div className="z-50 fixed inset-0 bg-gradient-to-b  from-[#FF3D7C] via-[#FF819E] to-[#F6E5D3] flex flex-col justify-start items-center font-poppins">
      {/* Animation and checklist page */}
      <div className="relative text-center text-white w-80">
        <h1 className="text-4xl font-extrabold mt-[10vh] mb-32 text-white">
          Checking your account
        </h1>{" "}
        {/* Reduced margin top and bottom */}
        {/* Centered and Overlapping Logo with Animation */}
        <div className="absolute top-[45%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 z-40">
          <img src={logoImage} alt="Logo" className="w-28 h-28 animate-pulse" />{" "}
          {/* Reduced size of the image */}
        </div>
        {/* List of checks */}
        <div className="space-y-4 mt-2">
          {" "}
          {/* Reduced vertical gap between items */}
          {[
            "Account Age Verified",
            "Activity Level Analyzed",
            "Telegram Premium Checked",
            "OG Status Confirmed",
          ].map((text, index) => (
            <div
              key={index}
              className="flex flex-col items-start justify-between bg-transparent py-1"
            >
              {" "}
              {/* Reduced padding */}
              <div className="flex justify-between w-full">
                <span className="text-lg font-semibold text-white">{text}</span>{" "}
                {/* Slightly smaller text */}
                {tickVisible[index] && (
                  <img src={checkboxImage} alt="Checked" className="w-6 h-6" />
                )}{" "}
                {/* Reduced checkbox size */}
              </div>
              <div className="w-full h-[4px] bg-transparent mt-1">
                {" "}
                {/* Reduced bar height and margin */}
                <div
                  className={`h-full bg-white transition-width duration-1000 ease-linear ${
                    completed[index] ? "w-full" : "w-0"
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  
};

export default overlaypage;
