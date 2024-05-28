import React, { useState } from "react";
import { client } from "../services/api";

const CreateBlogPost = ({ setNewBlog, newBlog }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const handleTitleChange = (e) => setTitle(e.target.value);
  const handleContentChange = (e) => setContent(e.target.value);
  const createBlog = async () => {
    try {
      const payload = {
        title,
        content,
      };
      const token = localStorage.getItem("token");
      const response = await client.post("/blogs/create/", payload, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      if (response.status === 200) {
        setTitle("");
        setContent("");
        setNewBlog(!newBlog);
      } else {
        console.error("Failed to create blog");
      }
    } catch (error) {
      console.error("Error creating blog", error);
    }
  };
  return (
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
  );
};

export default CreateBlogPost;
