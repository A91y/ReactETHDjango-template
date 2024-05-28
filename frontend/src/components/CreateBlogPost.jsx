import React, { useState } from "react";

const CreateBlogPost = ({ createBlog }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const handleTitleChange = (e) => setTitle(e.target.value);
  const handleContentChange = (e) => setContent(e.target.value);
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
