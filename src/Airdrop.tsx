import React, { useState, useEffect, CSSProperties } from "react";
import "./App.css";

import toast from "react-hot-toast";
import { useUser } from "./UserContext";
import ClipLoader from "react-spinners/ClipLoader";
import { main } from "./images";

// NEW TON IMPORTS //
import { TonConnectButton, useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";
import { Address, beginCell, toNano } from '@ton/core';
import { Buffer as BufferPolyfill } from 'buffer';

if (typeof window !== 'undefined' && typeof window.Buffer === 'undefined') {
  window.Buffer = BufferPolyfill;
}

// END //

const override: CSSProperties = {
  display: "block",
  margin: "0 auto",
  borderColor: "#ffffff",
};

const Airdrop: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { points, setPoints } = useUser();

  // NEW TON CONST //
  const userFriendlyAddress = useTonAddress();
  const [tonConnectUI] = useTonConnectUI();
  // END //

  console.log(points);

  useEffect(() => {
    if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
      const userUsername =
        window.Telegram.WebApp.initDataUnsafe.user.username || "Unknown User";
      setUsername(userUsername);
      localStorage.setItem("telegramUsername", userUsername); // Save to localStorage
    }
  }, []);

  const handleClaim = async () => {
    if (!userFriendlyAddress) {
      toast.error("Please connect your wallet first");
      return;
    }
  
    setLoading(true);
    try {
      const contractAddress = Address.parse("EQBcDQW5qpfyp8FaM3cjIcfcAkSqM3Ged21TTWbuLVo6mIUY");
      const JettonWalletAddress = Address.parse("EQCZbwwqhGHi0k3HtedKjaW87XwlMwPxthkqZVu9nNWrCmP4");
  
      // Crear el mensaje de Claim
      const claimMessage = beginCell()
        .storeUint(0x50c88989, 32) // Nombre del mensaje, debe coincidir con lo que el contrato espera
        .storeUint(0n, 64) // queryId debe ser un uint64 (0n para BigInt)
        .storeAddress(JettonWalletAddress) // Dirección de la billetera Jetton
        .storeCoins(toNano(points)) // La cantidad reclamada (usa `toNano` para convertir a unidades correctas)
        .endCell();
  
      // Preparar la transacción
      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 60, // 60 segundos de validez
        messages: [
          {
            address: contractAddress.toString(),
            amount: toNano('0.15').toString(), // Convertir a nanoTON como cadena
            payload: claimMessage.toBoc().toString('base64') // Payload serializado como base64
          }
        ]
      };
  
      // Enviar la transacción
      const result = await tonConnectUI.sendTransaction(transaction);
  
      console.log('Claim transaction sent:', result);


      toast.success("Claim request sent successfully!");
      setPoints(0)


    } catch (error) {
      console.error('Error claiming:', error);
      toast.error("Error claiming. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="bg-[#000000] flex justify-center h-screen">
      <div className="w-full bg-gradient-to-b from-[#000000] to-[#1c1c1c] text-white h-screen font-bold flex flex-col max-w-sm shadow-lg shadow-[#EA2E33]/50">
        {/* Coin Image */}
        <div className="flex justify-center items-center mt-8">
          <img src={main} alt="Dollar Coin" className="w-32 h-32" />
        </div>

        {/* Header */}
        <div className="text-center mt-4">
          <p
            className="text-4xl text-[#F6E7D4] font-lemon font-normal"
            style={{ textShadow: "1px 1px 2px #EA2E33" }}
          >
            Collect Your Earnings
          </p>
        </div>

        {/* Wallet Button */}
        <div className="flex justify-center font-lemon font-normal items-center pt-4">
            <TonConnectButton className="tonconnectbtn"  />

        </div>

        {/* Claim Your Coins */}
        <div className="flex justify-center items-center mt-4 md:mt-8 flex-col">
          <p
            style={{
              fontSize: "22px",
              marginBottom: "10px",
              color: "#F6E7D4",
            }}
          >
            Claim Your Coins
          </p>
          <p>{points}</p>
        </div>

        {/* Username */}
        <div className="flex justify-center items-center mt-2">
          <p style={{ fontSize: "20px", color: "#F6E7D4" }}>
            Username: {username}
          </p>
        </div>

        {/* Claim Button */}
        <div className="flex justify-center items-center mt-6">
          <button
            className="font-lemon font-normal"
            style={{
              padding: "20px 50px",
              backgroundColor: "#FF3D7C",
              color: "white",
              borderRadius: "14px",

              cursor: "pointer",
            }}
            onClick={handleClaim}
          >
            {loading ? (
              <ClipLoader
                loading={loading}
                cssOverride={override}
                size={25}
                aria-label="Loading Spinner"
                data-testid="loader"
              />
            ) : (
              "Claim"
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="flex justify-center items-center mt-auto mb-6">
          <p className="text-center text-[#FF3D7C]">
            More opportunities will be available soon
          </p>
        </div>
      </div>
    </div>
  );
};

export default Airdrop;
