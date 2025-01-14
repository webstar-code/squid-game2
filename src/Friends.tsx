import React, { useEffect, useState } from "react";
import { useUser } from "./UserContext";
import Modal from "./Modal"; // Importing the Modal component
import gift from "./images/gift.png";
import giftPrem from "./images/giftprem.png";

const FriendsPage: React.FC = () => {
  const { userID, setPoints } = useUser(); // Retrieve the userID and setPoints from global context
  const [friends, setFriends] = useState<
    Array<{ Username: string; totalstim: number }>
  >([]);
  const [modalMessage, setModalMessage] = useState<string | null>(null); // Modal state
  const FRIEND_REWARD = 2000; // Points reward per new friend

  const invitationLink = `https://t.me/MemeLordGamesClub_bot/MemeLordGamesClub?startapp=${encodeURIComponent(
    userID
  )}`;

  const handleInvite = () => {
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(invitationLink)}`,
      "_blank"
    );
  };

  const setupInvitationLinkCopy = () => {
    const tempTextArea = document.createElement("textarea");
    tempTextArea.value = invitationLink; // Set the value to the invitation link
    document.body.appendChild(tempTextArea); // Add it to the document
    tempTextArea.select(); // Select the text inside the text area
    document.execCommand("copy"); // Execute the copy command
    document.body.removeChild(tempTextArea); // Remove the temporary text area from the document
    showModal("Invitation link copied to clipboard!");
  };

  const showModal = (message: string) => {
    setModalMessage(message);
  };

  const closeModal = () => {
    setModalMessage(null);
  };

  const updateRefertotal = async () => {
    try {
      await fetch("https://python-backend-5wr2.onrender.com/update_user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ UserId: userID, Refertotal: "Approve" }),
      });
      console.log("Refertotal updated to Approve");
    } catch (error) {
      console.error("Failed to update Refertotal:", error);
    }
  };

  const fetchFriends = async () => {
    try {
      const response = await fetch(
        `https://python-backend-5wr2.onrender.com/get_invitations?UserId=${userID}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }
      );
      const data = await response.json();
      if (data && data.length > 0) {
        const previousFriendCount = parseInt(
          localStorage.getItem("friendCount") || "0",
          10
        );

        setFriends(data); // Update state if friends data is received

        if (data.length > previousFriendCount) {
          const newFriends = data.length - previousFriendCount;
          const rewardPoints = newFriends * FRIEND_REWARD;
          setPoints((prevPoints) => prevPoints + rewardPoints);
          showModal(
            `You have earned ${rewardPoints} points for inviting ${newFriends} new friends!`
          );

          if (data.length >= 3) {
            updateRefertotal();
          }

          localStorage.setItem("friendCount", data.length.toString());
        }

        // Update local storage with the latest friends data
        localStorage.setItem(`friends_${userID}`, JSON.stringify(data));
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  };

  useEffect(() => {
    if (userID) {
      // Load friends from local storage
      const localFriends = localStorage.getItem(`friends_${userID}`);
      if (localFriends) {
        setFriends(JSON.parse(localFriends));
      }

      // Fetch friends from the database and update local storage
      fetchFriends();
    } else {
      console.log("UserID not available");
    }
  }, [userID]);

  return (
    <div className="bg-black flex justify-center h-screen md:rounded-ss-lg md:rounded-se-lg">
      <div className="w-full bg-gradient-to-b from-black to-[#1c1c1c] text-white font-bold flex flex-col max-w-sm shadow-lg shadow-[#EA2E33]/50">
        {/* Invite Friends Section */}
        <div className="px-4 flex-shrink-0">
          <div className="text-center mt-6">
            <h2 className="text-3xl  font-lemon text-[#FF3D7C] drop-shadow-lg">
              Invite friends!
            </h2>
            <p className="text-gray-400 text-sm">You will receive bonuses</p>
          </div>

          <div className="mt-6 space-y-4">
            <div className="bg-[#EA2E33]/20 rounded-lg p-4 flex items-center">
              <div className="w-14 h-14 bg-[#F6E7D4] rounded-full mr-4">
                <img src={gift} alt="Invite a friend" className="w-14 h-14" />
              </div>
              <div>
                <p className="text-sm font-bold">Invite a friend</p>
                <p className="text-xs text-[#FF3D7C]">+2,000 for you</p>
              </div>
            </div>

            <div className="bg-[#EA2E33]/20 rounded-lg p-4 flex items-center">
              <div className="w-14 h-14 flex items-center justify-center overflow-hidden bg-[#F6E7D4] rounded-full mr-4">
                <div className="w-12 h-12 overflow-hidden bg-[#F6E7D4] rounded-full">
                  <img
                    src={giftPrem}
                    alt="Invite a friend with Telegram Premium"
                    className="w-12 h-12"
                  />
                </div>
              </div>

              <div>
                <p className="text-sm font-bold">
                  Invite a friend with Telegram Premium
                </p>
                <p className="text-xs text-[#FF3D7C]">+5,000 for you</p>
              </div>
            </div>
          </div>
        </div>

        {/* List of Friends Section */}
        <div className="flex-grow overflow-y-auto px-4 mt-8">
          <h3 className="text-center text-white">List of your friends</h3>
          {friends.length > 0 ? (
            friends.map((friend) => (
              <div
                key={friend.Username}
                className="bg-[#1d2025] rounded-lg p-4 mt-4 text-center text-gray-500"
              >
                {friend.Username}
              </div>
            ))
          ) : (
            <div className="bg-[#1d2025] rounded-lg p-4 mt-4 text-center text-gray-500">
              You haven't invited anyone yet
            </div>
          )}
          <div className="h-24"></div> {/* Add space at the end of the list */}
        </div>

        {/* Buttons Section */}
        <div
          className="flex-shrink-0 flex justify-between px-5 mt-auto mb-8"
          style={{ paddingBottom: "3.9rem" }}
        >
          <button
            onClick={handleInvite}
            className="bg-[#FF3D7C] text-white rounded-full py-3 px-8 flex-1 mr-2"
            style={{
              fontSize: "1.2rem",
              fontWeight: "bold",
              minHeight: "3.5rem",
            }}
          >
            Invite a friend
          </button>
          <button
            onClick={setupInvitationLinkCopy}
            className="bg-[#FF3D7C] text-white rounded-full py-4 px-6 flex-4 ml-2"
            style={{
              fontSize: "1.1rem",
              fontWeight: "bold",
              minHeight: "3.2rem",
            }}
          >
            Copy
          </button>
        </div>
      </div>

      {/* Modal Component */}
      {modalMessage && <Modal message={modalMessage} onClose={closeModal} />}
    </div>
  );
};

export default FriendsPage;
