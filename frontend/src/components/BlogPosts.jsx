import React from "react";
import BlogPost from "./BlogPost";
const BlogPosts = ({ blogs }) => {
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
