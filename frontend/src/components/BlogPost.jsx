import React from "react";

const BlogPost = ({ blog }) => {
  return (
    <>
      <div key={blog.id}>
        <h3>{blog.title}</h3>
        <p>{blog.content}</p>
        <hr />
      </div>
    </>
  );
};

export default BlogPost;
