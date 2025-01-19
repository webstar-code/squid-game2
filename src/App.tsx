import React, {
  useState,
  useEffect,
  useMemo,
  useLayoutEffect,
  useRef
} from "react";
import { useUser } from "./UserContext";

import "./App.css";
import Hamster from "./icons/Hamster";
import {
  binanceLogo,
  main,
  dailyReward1,
  invite,
  claimDailyCombo
} from "./images";
import Friends from "./icons/Friends";
import Coins from "./icons/Coins";
import Earn from "./Earn";
import FriendsPage from "./Friends";
import Airdrop from "./Airdrop";
import LoadingScreen from "./LoadingScreen";
import Modal from "./Modal";
import OverlayPage from "./overlaypage"; // Use lowercase if that's how the file is named
import { Toaster } from "react-hot-toast";
import BACKGROUND_MENU from "./images/background-menu.png";
import { Buffer as BufferPolyfill } from "buffer";
import GameComponent from "./GameComponent";

if (typeof window !== "undefined" && typeof window.Buffer === "undefined") {
  window.Buffer = BufferPolyfill;
}

declare const Telegram: any;

const App: React.FC = () => {
  const levelNames = [
    "Bronze",
    "Silver",
    "Gold",
    "Platinum",
    "Diamond",
    "Epic",
    "Legendary",
    "Master",
    "GrandMaster",
    "Lord"
  ];

  const levelMinPoints = [
    0, 5000, 25000, 100000, 1000000, 2000000, 10000000, 50000000, 100000000,
    1000000000
  ];

  const [levelIndex, setLevelIndex] = useState(6);
  const { points, setPoints, userID, setUserID } = useUser(); // Use global points and userID
  const [clicks, setClicks] = useState<{ id: number; x: number; y: number }[]>(
    []
  );


  // handle the score from the iframe game ========================
  const [score, setScore] = useState(0);

  useEffect(() => {
    // Listen for messages from the iframe
    const handleMessage = (event: any) => {
      console.log(event);
      if (event.data.type === "UPDATE_SCORE") {
        setScore(event.data.score);
      }
    };

    window.addEventListener("message", handleMessage);

    // Cleanup the event listener on unmount
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  useEffect(() => {
    if (score > 0) {
      console.log("Score:", score);
      setPoints((prevPoints) => prevPoints + score); // Correctly increment the global points
      setScore(0);
    }
  }, [score, setPoints, points]);
  




  console.log(score)

  const pointsToAdd = 1;

  // State to track loading
  const [loading, setLoading] = useState(true);

  // State for handling modals
  const [modalMessage, setModalMessage] = useState<string | null>(null);

  const showAlert = (message: string) => {
    setModalMessage(message); // Show the modal with the message
  };

  const closeModal = () => {
    setModalMessage(null); // Close the modal
  };

  // State to manage the overlay page visibility
  const [showOverlayPage, setShowOverlayPage] = useState(false);

  const closeOverlay = () => {
    setShowOverlayPage(false);
  };

  // Daily tap limit state
  const [tapsRemaining, setTapsRemaining] = useState<number>(() => {
    const savedTaps = localStorage.getItem("tapsRemaining");
    return savedTaps ? parseInt(savedTaps, 10) : 1000;
  });

  const [dailyRewardTimeLeft, setDailyRewardTimeLeft] = useState("");
  const [dailyCipherTimeLeft, setDailyCipherTimeLeft] = useState("");
  const [dailyComboTimeLeft, setDailyComboTimeLeft] = useState("");
  const [firstName, setFirstName] = useState<string>("");

  // State to track the last saved points
  const [lastSavedPoints, setLastSavedPoints] = useState<number>(0);

  // Function to load points from the backend on app load
  const loadPoints = async (userid: string) => {
    try {
      const response = await fetch(
        `https://python-backend-5wr2.onrender.com/get_user?UserId=${userid}`
      );
      const data = await response.json();
      if (data && data.data && data.data.totalstim !== undefined) {
        setPoints(data.data.totalstim); // Set the points from the database
        console.log("Loaded points from DB (totalstim):", data.data.totalstim);
        setLastSavedPoints(data.data.totalstim); // Initialize lastSavedPoints
      } else {
        console.log("User not found or no points available");
      }
    } catch (error) {
      console.error("Failed to load points:", error);
    }
  };

  // Function to save points to the backend
  const savePoints = async () => {
    if (!userID) return; // Ensure userID is available

    try {
      await fetch("https://python-backend-5wr2.onrender.com/update_user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ UserId: userID, totalstim: points })
      });
      console.log("Points saved:", points);
      setLastSavedPoints(points); // Update lastSavedPoints after saving
    } catch (error) {
      console.error("Failed to save points:", error);
    }
  };

  // Fetch user data and then load points
  useEffect(() => {
    Telegram.WebApp.ready();

    const initData = Telegram.WebApp.initDataUnsafe;

    const user = {
      username: initData.user?.username || "Default Username",
      userid: initData.user?.id || "202376895",
      startparam: initData.start_param || ""
    };

    setFirstName(user.username);
    setUserID(user.userid); // Set the userID

    console.log("Username:", user.username);
    console.log("UserID:", user.userid);
    console.log("StartParam:", user.startparam);

    // Fetch or add the user to the database
    fetchOrAddUser(user.userid, user.startparam, user.username);
  }, []); // Run only on component mount

  // Function to fetch or add user data
  const fetchOrAddUser = (
    userid: string,
    startparam: string,
    username: string
  ) => {
    fetch(`https://python-backend-5wr2.onrender.com/get_user?UserId=${userid}`)
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw new Error("User not found");
      })
      .then((data) => {
        console.log("API Data:", data);
        loadPoints(userid); // Load points after user data is confirmed
      })
      .catch((error) => {
        console.log("Error:", error.message);
        addUser(userid, startparam, username); // If user is not found, add them
      });
  };

  const addUser = (userid: string, startparam: string, username: string) => {
    const invitedBy = !startparam || userid === startparam ? null : startparam;

    fetch("https://python-backend-5wr2.onrender.com/add_user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        UserId: userid,
        invitedby: invitedBy === null ? undefined : invitedBy,
        Username: username
      })
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw new Error("Failed to add user");
      })
      .then((data) => {
        console.log("User added:", data);

        // Show the overlay page immediately after adding the user
        setShowOverlayPage(true);

        // After 2 seconds, refetch the user data to ensure proper data is loaded
        setTimeout(() => {
          fetchUserDataAgain(userid);
        }, 5000); // Wait for 2 seconds before fetching the user data again
      })
      .catch((error) => {
        console.log("Error:", error.message);
      });
  };

  // Function to refetch user data after adding the user
  const fetchUserDataAgain = (userid: string) => {
    fetch(`https://python-backend-5wr2.onrender.com/get_user?UserId=${userid}`)
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw new Error("Failed to fetch user data");
      })
      .then((data) => {
        console.log("Refetched User Data:", data);
        loadPoints(userid); // Load points again after refetching the user data
      })
      .catch((error) => {
        console.log("Error fetching user data again:", error.message);
      });
  };

  // Track every point increment and save points and taps
  useEffect(() => {
    if (points !== lastSavedPoints) {
      savePoints(); // Save points to the backend after every point increment
    }
  }, [points, lastSavedPoints]);

  // Save points and taps when the user is about to leave the app
  useEffect(() => {
    const handleBeforeUnload = () => {
      savePoints(); // Save points to the backend
      localStorage.setItem("tapsRemaining", tapsRemaining.toString()); // Save taps remaining to local storage
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [points, userID, tapsRemaining]); // Re-run when points, userID, or tapsRemaining are updated

  // Refill taps when the app loads if it's a new day
  useEffect(() => {
    const savedDate = localStorage.getItem("tapDate");
    const todayDate = new Date().toDateString();

    if (savedDate !== todayDate) {
      // It's a new day
      setTapsRemaining(1000);
      localStorage.setItem("tapsRemaining", "1000");
      localStorage.setItem("tapDate", todayDate);
    }
  }, []);

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (tapsRemaining > 0) {
      const card = e.currentTarget;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      card.style.transform = `perspective(1000px) rotateX(${
        -y / 10
      }deg) rotateY(${x / 10}deg)`;
      setTimeout(() => {
        card.style.transform = "";
      }, 100);

      setPoints((prevPoints) => prevPoints + pointsToAdd); // Correctly increment the global points
      console.log("Updated Points:", points);
      setTapsRemaining(tapsRemaining - 1);
      setClicks([...clicks, { id: Date.now(), x: e.pageX, y: e.pageY }]);

      // Save taps remaining and points after every tap
      localStorage.setItem("tapsRemaining", (tapsRemaining - 1).toString());
      localStorage.setItem("tapDate", new Date().toDateString());
      savePoints(); // Save points to the backend after each click
    } else {
      showAlert(
        "You have reached the maximum taps for today. Come back tomorrow!"
      );
    }
  };

  const handleAnimationEnd = (id: number) => {
    setClicks((prevClicks) => prevClicks.filter((click) => click.id !== id));
  };

  const calculateProgress = () => {
    if (levelIndex >= levelNames.length - 1) return 100;

    const currentLevelMin = levelMinPoints[levelIndex];
    const nextLevelMin = levelMinPoints[levelIndex + 1];
    const progress =
      ((points - currentLevelMin) / (nextLevelMin - currentLevelMin)) * 100;
    return Math.min(progress, 100);
  };

  useEffect(() => {
    const currentLevelMin = levelMinPoints[levelIndex];
    const nextLevelMin = levelMinPoints[levelIndex + 1];
    if (points >= nextLevelMin && levelIndex < levelNames.length - 1) {
      setLevelIndex(levelIndex + 1);
    } else if (points < currentLevelMin && levelIndex > 0) {
      setLevelIndex(levelIndex - 1);
    }
  }, [points, levelIndex, levelMinPoints, levelNames.length]);

  // Detect Telegram WebView on PC and adjust layout
  useEffect(() => {
    const adjustLayoutForTelegramDesktop = () => {
      const circleOuter = document.querySelector(
        ".circle-outer"
      ) as HTMLElement;
      const upperPart = document.querySelector(".upper-part") as HTMLElement;

      if (circleOuter) {
        circleOuter.style.height = "50vh";
        circleOuter.style.width = "auto";
      }

      if (upperPart) {
        upperPart.style.marginTop = "10vh";
      }
    };

    function isTelegramPCWebView() {
      const userAgent = navigator.userAgent || navigator.vendor;
      return /TelegramDesktop/i.test(userAgent);
    }

    if (isTelegramPCWebView()) {
      adjustLayoutForTelegramDesktop();
      window.addEventListener("resize", adjustLayoutForTelegramDesktop);
    }

    return () => {
      window.removeEventListener("resize", adjustLayoutForTelegramDesktop);
    };
  }, []);

  const [activePage, setActivePage] = useState("home");

  const handleNavigation = (page: string) => {
    setActivePage(page);
  };

  const calculateTimeLeft = (targetHour: number) => {
    const now = new Date();
    const target = new Date(now);
    target.setUTCHours(targetHour, 0, 0, 0);

    if (now.getUTCHours() >= targetHour) {
      target.setUTCDate(target.getUTCDate() + 1);
    }

    const diff = target.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  };

  useEffect(() => {
    const updateCountdowns = () => {
      setDailyRewardTimeLeft(calculateTimeLeft(0));
      setDailyCipherTimeLeft(calculateTimeLeft(19));
      setDailyComboTimeLeft(calculateTimeLeft(12));
    };

    updateCountdowns();
    const interval = setInterval(updateCountdowns, 60000);

    return () => clearInterval(interval);
  }, []);

  // Load all pages on initial load
  useEffect(() => {
    const preloadPages = async () => {
      // Load points and all pages' data
      await Promise.all([
        loadPoints(userID),
        // Ensure the loading page stays at least 2 seconds
        new Promise((resolve) => setTimeout(resolve, 4000))
      ]);

      // Set loading to false after all data is loaded
      setLoading(false);
    };

    preloadPages();
  }, [userID]); // Ensure userID is a dependency
  const [loadingIframe, setLoadingIframe] = useState(true);

  const handleIframeLoad = () => {
    setLoadingIframe(false);
  };

  return (
    <div className="relative flex justify-center">
      {loading ? (
        <LoadingScreen />
      ) : (
        <>
          {/* Background Gradients */}
          <div className="absolute inset-0 bg-gradient-to-br  from-[#FF3D7C] via-[#FF819E] to-[#F6E5D3]"></div>
          {/* <div className="absolute inset-0 bg-gradient-to-tl from-[#e54b81] via-[#e262b5] to-[#e54b81] opacity-30"></div> */}

          <div className="relative pt-2 md:pt-14 w-full text-white h-screen font-bold flex flex-col max-w-sm">
            {/* Conditional Rendering of Pages */}
            <div className="relative w-full h-full  flex flex-col items-center">
              <iframe
                src="/game.html"
                title="Squid Game"
                onLoad={handleIframeLoad}
                className="bg-black md:mt-[-56px]"
                style={{
                  width: 380,
                  height: activePage === "home" ? "100%" : 0,
                  border: "none",
                  opacity: activePage === "home" ? 100 : 0
                }}
              />
            </div>
            {/* <GameComponent /> */}

            {activePage === "home" && (
              <></>
              // <>
              //   <div className="px-4 z-10">
              //     <div className="flex items-center space-x-2 pt-4 upper-part">
              //       <div className="p-1 rounded-lg bg-[#FF3D7C]">
              //         <Hamster size={24} className="text-white" />
              //       </div>
              //       <div>
              //         <p className="text-sm">{firstName} (CEO)</p>
              //       </div>
              //     </div>

              //     <div className="flex items-center justify-between space-x-4 mt-1">
              //       <div className="flex items-center w-1/3">
              //         <div className="w-full">
              //           <div className="flex justify-between">
              //             <p className="text-sm">
              //               Level: {levelNames[levelIndex]}
              //             </p>
              //             <p className="text-sm">
              //               {levelIndex + 1}{" "}
              //               <span className="text-[#E4DFDC]">
              //                 / {levelNames.length}
              //               </span>
              //             </p>
              //           </div>
              //           <div className="flex items-center mt-1 border-2 border-[#FF3D7C] rounded-full">
              //             <div className="w-full h-2 bg-black/70 rounded-full">
              //               <div
              //                 className="bg-gradient-to-r from-[#FF3D7C] to-[#E4DFDC] h-2 rounded-full"
              //                 style={{ width: `${calculateProgress()}%` }}
              //               ></div>
              //             </div>
              //           </div>
              //         </div>
              //       </div>
              //     </div>
              //   </div>

              //   <div className="flex-grow h-screen mt-1 bg-[#FF3D7C] rounded-t-[32px] relative  z-0">
              //     <div className="absolute flex flex-col h-auto top-[2px] left-0 right-0 bottom-0 bg-gradient-to-b from-[#FF3D7C] via-[#FF819E] to-[#F6E5D3] rounded-t-[30px]">
              //       <div className="px-4 mt-2 flex justify-between gap-2">
              //         {/* Daily Reward */}
              //         <div
              //           className="bg-[#000000] rounded-lg px-4 pt-2 w-full relative cursor-pointer"
              //           onClick={() => handleNavigation("earn")}
              //         >
              //           <div className="dot"></div>
              //           <img
              //             src={dailyReward1}
              //             alt="Daily Reward"
              //             className="mx-auto w-14 h-14"
              //           />
              //           <p className="text-xs text-center text-white mt-1">
              //             Daily reward
              //           </p>
              //           <p className="text-xs font-medium text-center text-gray-300 mt-2">
              //             {dailyRewardTimeLeft}
              //           </p>
              //         </div>

              //         {/* Invite Friend */}
              //         <div
              //           className="bg-[#000000] rounded-lg px-4 pt-2 w-full relative cursor-pointer"
              //           onClick={() => handleNavigation("friends")}
              //         >
              //           <div className="dot"></div>
              //           <img
              //             src={invite}
              //             alt="Invite Friend"
              //             className="mx-auto w-12 h-12"
              //           />
              //           <p className="text-xs text-center text-white mt-1">
              //             Invite Friend
              //           </p>
              //           <p className="text-xs font-medium text-center text-gray-300 mt-2">
              //             {dailyCipherTimeLeft}
              //           </p>
              //         </div>

              //         {/* Claim Daily Combo */}
              //         <div
              //           className="bg-[#000000] rounded-lg px-4 pt-2 w-full relative cursor-pointer"
              //           onClick={() => handleNavigation("airdrop")}
              //         >
              //           <div className="dot"></div>
              //           <img
              //             src={claimDailyCombo}
              //             alt="Daily Combo"
              //             className="mx-auto w-14 h-14"
              //           />
              //           <p className="text-xs text-center text-white mt-1">
              //             Claim
              //           </p>
              //           <p className="text-xs font-medium text-center text-gray-300 mt-2">
              //             {dailyComboTimeLeft}
              //           </p>
              //         </div>
              //       </div>

              //       <div className="px-4 mt-2 md:mt-6 flex justify-center items-center relative">
              //         <div className="absolute left-2 ml-4">
              //           <p className="text-white text-lg">
              //             {tapsRemaining}/1000
              //           </p>
              //         </div>
              //         <div className="flex items-center space-x-2">
              //           <img
              //             src={main}
              //             alt="Dollar Coin"
              //             className="w-12 h-12"
              //           />
              //           <p className="text-3xl text-white">
              //             {points.toLocaleString()}
              //           </p>
              //         </div>
              //       </div>

              //       <div className="px-4 h-[400px] md:pt-40 flex justify-center items-center">
              //         <div
              //           className="w-[240px] h-[240px]  p-0 rounded-full cursor-pointer circle-outer"
              //           onClick={handleCardClick}
              //         >
              //           <div className="w-[240px] h-[240px]  rounded-full circle-inner">
              //             <img
              //               src={main}
              //               alt="Main Character"
              //               className="w-[240px] h-[240px] "
              //             />
              //           </div>
              //         </div>
              //       </div>
              //     </div>
              //   </div>
              // </>
            )}
            {activePage === "earn" && <Earn />}
            {activePage === "friends" && <FriendsPage />}
            {activePage === "airdrop" && <Airdrop />}
          </div>

          {/* Bottom Navigation */}
          <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-[calc(100%)] max-w-sm bg-[#000000] flex justify-around items-center z-50 rounded-t-3xl text-xs">
            {/* Nav Items */}
            <div
              className={`nav-item text-center text-[#E4DFDC] ${
                activePage === "home" ? "!bg-[#FF3D7C] text-[#fff]" : ""
              } w-1/5 m-1 p-2 rounded-2xl`}
              onClick={() => handleNavigation("home")}
            >
              <img
                src={binanceLogo}
                alt="Exchange"
                className="w-6 h-6 mx-auto"
              />
              <p className="mt-1">Home</p>
            </div>
            <div
              className={`nav-item text-center text-[#E4DFDC] ${
                activePage === "friends" ? "!bg-[#FF3D7C] text-[#fff]" : ""
              } w-1/5 m-1 p-2 rounded-2xl`}
              onClick={() => handleNavigation("friends")}
            >
              <Friends className="w-6 h-6 mx-auto " />
              <p className="mt-1">Friends</p>
            </div>
            <div
              className={`nav-item text-center text-[#E4DFDC] ${
                activePage === "earn" ? "!bg-[#FF3D7C] text-[#fff]" : ""
              } w-1/5 m-1 p-2 rounded-2xl`}
              onClick={() => handleNavigation("earn")}
            >
              <Coins className="w-6 h-6 mx-auto" />
              <p className="mt-1">Bounty Program</p>
            </div>
            <div
              className={`nav-item text-center text-[#E4DFDC] ${
                activePage === "airdrop" ? "!bg-[#FF3D7C] text-[#fff]" : ""
              } w-1/5 m-1 p-2 rounded-2xl`}
              onClick={() => handleNavigation("airdrop")}
            >
              <img src={main} alt="Airdrop" className="w-6 h-6 mx-auto" />
              <p className="mt-1">Collect Earnings</p>
            </div>
          </div>

          {/* Click animations */}
          {clicks.map((click) => (
            <div
              key={click.id}
              className="absolute h-36 text-5xl font-bold opacity-0 z-50 pointer-events-none"
              style={{
                top: `${click.y - 42}px`,
                left: `${click.x - 28}px`,
                animation: `float 1s ease-out`
              }}
              onAnimationEnd={() => handleAnimationEnd(click.id)}
            >
              <img src={main} alt="Airdrop" className="w-14 h-14 mx-auto" />
            </div>
          ))}

          {/* OverlayPage and Modal Components */}
          {showOverlayPage && <OverlayPage closeOverlay={closeOverlay} />}
        </>
      )}
      {modalMessage && <Modal message={modalMessage} onClose={closeModal} />}
      <Toaster />
    </div>
  );
};

export default App;
