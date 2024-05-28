import React, { useState, useEffect } from "react";
import axios from "axios";
import { ethers } from "ethers";
import "./App.css";
// const provider = new ethers.providers.Web3Provider(window.ethereum);
const App = () => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [blogs, setBlogs] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const client = axios.create({
    baseURL: "http://localhost:8000",
  });

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(provider);
        provider.send("eth_requestAccounts", []).then(async() => {
          setAccount(await provider.getSigner().getAddress());
          localStorage.setItem("isWalletConnected", true);
          localStorage.setItem("account", await provider.getSigner().getAddress());
          console.log("Wallet connected: ", await provider.getSigner().getAddress());
        });
      } catch (error) {
        console.error("User rejected the request.", error);
      }
    } else {
      console.error("Install a wallet extension like MetaMask.");
    }
  };


  const disconnectWallet = () => {
    setAccount(null);
    setAuthenticated(false);
    localStorage.removeItem("isWalletConnected");
    localStorage.removeItem("account");
    console.log("Wallet disconnected");
  };

  const authenticate = async () => {
    if (!account) return;

    try {
      console.log("Requested by user: ", account);
      const response = await client.get("/generate-message/");
      const message = response.data.message;
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const signature = await signer.signMessage(message);
      const payload = {
        user_address: account,
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
        fetchBlogs();
      } else {
        console.log("Authentication failed");
      }
    } catch (error) {
      console.error("Error during authentication", error);
    }
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
      console.error("Error verifying authentication", error);
    }
  };

  const fetchBlogs = async () => {
    try {
      const response = await client.get("/blogs/");
      setBlogs(response.data.blogs);
    } catch (error) {
      console.error("Error fetching blogs", error);
    }
  };

  const createBlog = async () => {
    if (!authenticated) return alert("Please authenticate first");

    try {
      const payload = {
        title,
        content,
      };
      console.log("Payload: ", payload);
      const response = await client.post("/blogs/create/", payload);

      if (response.status === 200) {
        setTitle("");
        setContent("");
        fetchBlogs();
      } else {
        console.error("Failed to create blog");
      }
    } catch (error) {
      console.error("Error creating blog", error);
      alert("Error creating blog");
    }
  };

  const handleTitleChange = (e) => setTitle(e.target.value);
  const handleContentChange = (e) => setContent(e.target.value);

  useEffect(() => {
    const isWalletConnected = localStorage.getItem("isWalletConnected");
    const savedAccount = localStorage.getItem("account");
    if (isWalletConnected && savedAccount) {
      setAccount(savedAccount);
      console.log("Wallet connected: ", savedAccount);
    }
    verifyAuthentication();
    fetchBlogs();
  }, []);

  return (
    <div>
      {account ? (
        <button onClick={disconnectWallet}>Disconnect Wallet</button>
      ) : (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}
      <button onClick={authenticate}>Authenticate</button>

      {authenticated && <p>Welcome, {account}</p>}

      {authenticated && (
        <div>
          <h2>Create a Blog Post</h2>
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="Title"
          />
          <textarea
            value={content}
            onChange={handleContentChange}
            placeholder="Content"
          ></textarea>
          <button onClick={createBlog}>Create Blog</button>
        </div>
      )}

      <h2>Blog Posts</h2>
      {blogs.length > 0 ? (
        <div>
          {blogs.map((blog) => (
            <div key={blog.id}>
              <h3>{blog.title}</h3>
              <p>{blog.content}</p>
              <hr />
            </div>
          ))}
        </div>
      ) : (
        <p>No blogs available</p>
      )}
    </div>
  );
};

export default App;
