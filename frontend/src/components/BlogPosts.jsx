import React, { useEffect, useState } from "react";
import { client } from "../services/api";
import BlogPost from "./BlogPost";

const BlogPosts = ({ newBlog }) => {
  const [blogs, setBlogs] = useState([]);
  const fetchBlogs = async () => {
    try {
      const response = await client.get("/blogs/");
      setBlogs(response.data.blogs);
    } catch (error) {
      console.error("Error fetching blogs", error);
    }
  };
  useEffect(() => {
    fetchBlogs();
  }, [newBlog]);

  return (
    <>
      <h2>Blog Posts</h2>
      {blogs.length > 0 ? (
        <div>
          {blogs.map((blog) => (
            <BlogPost key={blog.id} blog={blog} />
          ))}
        </div>
      ) : (
        <p>No blogs available</p>
      )}
    </>
  );
};

export default BlogPosts;
