import React, { useState, useEffect } from "react";
import { useUser } from "./UserContext";
import Modal from "./Modal"; // Importing the Modal component

// Importing icons
import youtubeIcon from "./images/youtube.png";
import xIcon from "./images/x.png";
import telegramIcon from "./images/telegram.png";
import instagramIcon from "./images/instagram.png";
import tiktokIcon from "./images/tiktok.png";
import friendsIcon from "./images/friends.png";
import dailyRewardIcon from "./images/daily-reward1.png";
import doneIcon from "./images/done.png"; // Importing the done icon
import { main } from "./images";

// Define the type for TaskItem props
interface TaskItemProps {
  icon: string;
  title: string;
  reward: number; // Reward points as a number
  link?: string; // Optional link prop
  onClick?: () => void; // Optional onClick handler
  completed: boolean; // To check if the task is completed
}

// Task Component with clickable functionality
const TaskItem: React.FC<TaskItemProps> = ({
  icon,
  title,
  reward,
  onClick,
  completed
}) => (
  <div
    onClick={!completed ? onClick : undefined}
    className={`flex items-center justify-between rounded-lg p-4 mb-4 ${
      !completed
        ? "bg-[#EA2E33]/20 hover:bg-[#F6E7D4]/20 cursor-pointer"
        : "bg-[#3BAA34]/20 opacity-50 cursor-not-allowed"
    }`}
  >
    <div className="flex items-center">
      <img src={icon} alt={title} className="w-10 h-10 mr-4" />
      <div className="text-white">
        <div className="">{title}</div>
        <div className="text-[#FF3D7C]">+{reward}</div>
      </div>
    </div>
    <div className="text-gray-400">
      {completed ? <img src={doneIcon} alt="Done" className="w-6 h-6" /> : "➤"}
    </div>
  </div>
);

// Main Earn Page Component
const Earn: React.FC = () => {
  const { setPoints, userID } = useUser(); // Use global points and userID
  const [taskComplete, setTaskComplete] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [lastClaimedTime, setLastClaimedTime] = useState<number | null>(null);
  const [refertotalStatus, setRefertotalStatus] = useState<string | null>(null); // To store Refertotal status
  const [modalMessage, setModalMessage] = useState<string | null>(null); // Modal state

  // Function to show the modal
  const showModal = (message: string) => {
    setModalMessage(message);
  };

  // Function to close the modal
  const closeModal = () => {
    setModalMessage(null);
  };

  // Load initial task statuses from local storage and then update from the database
  useEffect(() => {
    const loadTaskStatus = async () => {
      const localStorageData = JSON.parse(
        localStorage.getItem(`taskStatus_${userID}`) || "{}"
      );

      setTaskComplete({
        YouTube: localStorageData.YouTube || false,
        TikTok: localStorageData.TikTok || false,
        X: localStorageData.X || false,
        Telegram: localStorageData.Telegram || false,
        InviteFriends: localStorageData.InviteFriends || false,
        DailyReward: localStorageData.DailyReward || false
      });

      setLastClaimedTime(localStorageData.lastClaimedTime || null);
      setRefertotalStatus(localStorageData.Refertotal || "NULL");

      try {
        const response = await fetch(
          `https://python-backend-5wr2.onrender.com/get_user?UserId=${userID}`
        );
        const data = await response.json();
        console.log(data.data);
        if (data && data.data) {
          const updatedTaskStatus = {
            YouTube: data.data.youtube === "Done",
            TikTok: data.data.tiktok === "Done",
            Instagram: data.data.instagram === "Done",
            X: data.data.X === "Done",
            TelegramChannel: data.data.telegramChannel === "Done",
            TelegramGroup: data.data.telegramGroup === "Done",
            InviteFriends: data.data.Refertotal === "Done",
            DailyReward:
              !!data.data.dailyclaimedtime &&
              Date.now() - data.data.dailyclaimedtime < 24 * 60 * 60 * 1000,
            lastClaimedTime: data.data.dailyclaimedtime,
            Refertotal: data.data.Refertotal
          };

          setTaskComplete({
            YouTube: updatedTaskStatus.YouTube,
            TikTok: updatedTaskStatus.TikTok,
            X: updatedTaskStatus.X,
            Instagram: updatedTaskStatus.Instagram,
            TelegramChannel: updatedTaskStatus.TelegramChannel,
            TelegramGroup: updatedTaskStatus.TelegramGroup,
            InviteFriends: updatedTaskStatus.InviteFriends,
            DailyReward: updatedTaskStatus.DailyReward
          });

          setLastClaimedTime(updatedTaskStatus.lastClaimedTime);
          setRefertotalStatus(updatedTaskStatus.Refertotal);

          // Update local storage with the latest status from the database
          localStorage.setItem(
            `taskStatus_${userID}`,
            JSON.stringify(updatedTaskStatus)
          );
        }
      } catch (error) {
        console.error("Failed to load task status:", error);
      }
    };

    loadTaskStatus();
  }, [userID]);

  const saveTaskCompletion = async (
    taskKey: string,
    column: string,
    reward: number
  ) => {
    try {
      await fetch("https://python-backend-5wr2.onrender.com/update_user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ UserId: userID, [column]: "Done" })
      });

      setTaskComplete((prevState) => ({
        ...prevState,
        [taskKey]: true
      }));

      // Update local storage as well
      localStorage.setItem(
        `taskStatus_${userID}`,
        JSON.stringify({
          ...taskComplete,
          [taskKey]: true
        })
      );

      setPoints((prevPoints) => prevPoints + reward); // Reward points for task completion
      showModal(`Thank you! You have earned ${reward} points.`);
    } catch (error) {
      console.error(`Failed to complete task ${taskKey}:`, error);
      showModal(
        "An error occurred while completing the task. Please try again later."
      );
    }
  };

  const handleTaskClick = (
    taskKey: string,
    link: string,
    column: string,
    reward: number
  ) => {
    // Open the link in a new tab/window
    window.open(link, "_blank");

    // Immediately save the task completion and update the reward
    saveTaskCompletion(taskKey, column, reward);
  };

  const handleDailyRewardClick = async () => {
    const now = Date.now();
    if (lastClaimedTime && now - lastClaimedTime < 24 * 60 * 60 * 1000) {
      showModal(
        "You have already claimed your daily reward. Please come back later."
      );
      return; // Prevent claiming again within 24 hours
    }

    try {
      await fetch("https://python-backend-5wr2.onrender.com/update_user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ UserId: userID, dailyclaimedtime: now })
      });

      setLastClaimedTime(now);
      setTaskComplete((prevState) => ({
        ...prevState,
        DailyReward: true
      }));

      // Update local storage as well
      localStorage.setItem(
        `taskStatus_${userID}`,
        JSON.stringify({
          ...taskComplete,
          DailyReward: true,
          lastClaimedTime: now
        })
      );

      setPoints((prevPoints) => prevPoints + 120); // Reward for daily claim
      showModal(
        "Congratulations! You have claimed your daily reward of 120 points."
      );
    } catch (error) {
      console.error("Failed to claim daily reward:", error);
      showModal(
        "An error occurred while claiming your daily reward. Please try again later."
      );
    }
  };

  const handleInviteFriendsClick = async () => {
    if (refertotalStatus === "NULL" || !refertotalStatus) {
      showModal("Not Enough Friends");
    } else if (refertotalStatus === "Approve") {
      try {
        await fetch("https://python-backend-5wr2.onrender.com/update_user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ UserId: userID, Refertotal: "Done" })
        });

        setTaskComplete((prevState) => ({
          ...prevState,
          InviteFriends: true
        }));

        // Update local storage as well
        localStorage.setItem(
          `taskStatus_${userID}`,
          JSON.stringify({
            ...taskComplete,
            InviteFriends: true,
            Refertotal: "Done"
          })
        );

        setPoints((prevPoints) => prevPoints + 2500); // Reward points for inviting friends
        setRefertotalStatus("Done"); // Update local status
        showModal(
          "Congratulations! You have completed the Invite 3 Friends task and earned 2500 points."
        );
      } catch (error) {
        console.error("Failed to complete Invite Friends task:", error);
        showModal(
          "An error occurred while completing the task. Please try again later."
        );
      }
    }
  };

  return (
    <div className="w-full bg-gradient-to-b from-[#05080D] to-[#1c1c1c] text-white h-screen font-bold flex flex-col max-w-sm">
      {/* Header with Coin Image */}
      <div className="flex flex-col items-center justify-center mt-6">
        <img src={main} alt="Dollar Coin" className="w-20 h-20 mb-2" />
        <h1 className="text-xl font-lemon text-[#FF3D7C]">Earn more coins</h1>
      </div>

      {/* Main Content */}
      <div className="p-4 overflow-y-auto scrollbar scrollbar-thumb-[#51C4C8] scrollbar-track-[#1c1c1c]">
        {/* YouTube Section */}
        <div className="mb-6">
          <h2 className="text-xl mb-4 text-[#F6E7D4]">Social Tasks</h2>
          <TaskItem
            icon={youtubeIcon}
            title="Subscribe To YT"
            reward={500}
            link="#"
            completed={!!taskComplete["YouTube"]}
            onClick={() => handleTaskClick("YouTube", "https://www.youtube.com/@SquidGameArena", "youtube", 500)}
          />
        </div>
        {/* Daily Tasks Section */}
        <div className="mb-6">
          <h2 className="text-xl mb-4 text-[#F6E7D4]">Daily tasks</h2>
          <TaskItem
            icon={dailyRewardIcon}
            title="Daily reward"
            reward={120}
            completed={!!taskComplete["DailyReward"]}
            onClick={handleDailyRewardClick}
          />
        </div>
        {/* Tasks List Section */}
        <div>
          <h2 className="text-xl mb-4 text-[#F6E7D4]">Tasks list</h2>
          <TaskItem
            icon={tiktokIcon}
            title="Follow us on TikTok"
            reward={500}
            link="https://www.tiktok.com/@squidsgamearena"
            completed={!!taskComplete["TikTok"]}
            onClick={() =>
              handleTaskClick(
                "TikTok",
                "https://www.tiktok.com/@squidsgamearena",
                "tiktok",
                500
              )
            }
          />
          <TaskItem
            icon={instagramIcon}
            title="Follow us on Instagram"
            reward={500}
            link="#"
            completed={!!taskComplete["Instagram"]}
            onClick={() => handleTaskClick("Instagram", "#", "instagram", 500)}
          />
          <TaskItem
            icon={telegramIcon}
            title="Join our TG Channel"
            reward={500}
            link="https://t.me/SquidGameArena"
            completed={!!taskComplete["TelegramChannel"]}
            onClick={() =>
              handleTaskClick(
                "TelegramChannel",
                "https://t.me/SquidGameArena",
                "telegramChannel",
                500
              )
            }
          />
          <TaskItem
            icon={telegramIcon}
            title="Join our TG Group"
            reward={500}
            link="https://t.me/SquidGameArenaOfficial"
            completed={!!taskComplete["TelegramGroup"]}
            onClick={() =>
              handleTaskClick(
                "TelegramGroup",
                "https://t.me/SquidGameArenaOfficial",
                "telegramGroup",
                500
              )
            }
          />
          <TaskItem
            icon={xIcon}
            title="Follow our X account"
            reward={500}
            link="https://x.com/SquidGameArena"
            completed={!!taskComplete["X"]}
            onClick={() =>
              handleTaskClick("X", "https://x.com/SquidGameArena", "X", 500)
            }
          />
          <TaskItem
            icon={friendsIcon}
            title="Invite 3 friends"
            reward={2500}
            completed={!!taskComplete["InviteFriends"]}
            onClick={
              !taskComplete["InviteFriends"] && refertotalStatus !== "Done"
                ? handleInviteFriendsClick
                : undefined
            }
          />
        </div>
        <div className="h-24"></div> {/* Spacer Element */}
      </div>

      {/* Modal Component */}
      {modalMessage && <Modal message={modalMessage} onClose={closeModal} />}
    </div>
  );
};

export default Earn;
