import React, { useState, useEffect } from "react";
import { client } from "/src/services/api";
import { ethers } from "ethers";
import "./App.css";
import BlogPosts from "./components/BlogPosts";
import CreateBlogPost from "./components/CreateBlogPost";

const App = () => {
  const [account, setAccount] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [newBlog, setNewBlog] = useState(false);

  const clearLocalStorage = () => {
    localStorage.removeItem("isWalletConnected");
    localStorage.removeItem("account");
    localStorage.removeItem("token");
    setAccount(null);
    setAuthenticated(false);
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []).then(async () => {
          localStorage.setItem("isWalletConnected", true);
          const address = await provider.getSigner().getAddress();
          setAccount(address);
          localStorage.setItem("account", address);
          console.log("Wallet connected: ", address);
        });
        try {
          const address = localStorage.getItem("account");
          const response = await client.get("/generate-message/");
          const message = response.data.message;
          const signer = provider.getSigner();
          const signature = await signer.signMessage(message);
          const payload = {
            user_address: address,
            signature,
            login_message: message,
          };
          console.log("Payload: ", payload);
          const verificationResponse = await client.post(
            "token/create/",
            payload
          );
          console.log("Verification response: ", verificationResponse.data);
          if (verificationResponse.data.status === "authenticated") {
            console.log("User authenticated");
            localStorage.setItem("token", verificationResponse.data.token);
            setAuthenticated(true);
          } else {
            console.log("Authentication failed");
          }
        } catch (error) {
          console.error("Error during authentication", error);
          clearLocalStorage();
        }
      } catch (error) {
        console.error("User rejected the request.", error);
        clearLocalStorage();
      }
    } else {
      console.error("Install a wallet extension like MetaMask.");
    }
  };

  const disconnectWallet = () => {
    clearLocalStorage();
    console.log("Wallet disconnected");
  };

  const verifyAuthentication = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const payload = {
        token,
      };
      const response = await client.post("/token/verify/", payload, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      if (response.data.status === "authenticated") {
        console.log("User authenticated");
        setAuthenticated(true);
      }
    } catch (error) {
      clearLocalStorage();
      console.log("Authentication Expired!");
    }
  };

  useEffect(() => {
    const isWalletConnected = localStorage.getItem("isWalletConnected");
    const savedAccount = localStorage.getItem("account");
    if (isWalletConnected && savedAccount) {
      setAccount(savedAccount);
      console.log("Wallet connected: ", savedAccount);
    }
    verifyAuthentication();
  }, []);

  return (
    <div>
      {account ? (
        <button onClick={disconnectWallet}>Disconnect Wallet</button>
      ) : (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}

      {authenticated && <p>Welcome, {account}</p>}

      {authenticated && (
        <CreateBlogPost setNewBlog={setNewBlog} newBlog={newBlog} />
      )}

      <BlogPosts newBlog={newBlog} />
    </div>
  );
};

export default App;
