import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  // const [accessToken, setAccessToken] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const [postText, setPostText] = useState("");
  const [posts] = useState([]);
  const [createByContext, setCreateByContext] = useState(false);
  const [contextText, setContextText] = useState("");
  const [charLength, setCharLength] = useState(0);
  const [token] = useState(localStorage.getItem("session_token"));
  // const [postsFetched, setPostsFetched] = useState(false);

  // const URL = "https://www.linkedin.com/in/rajstriver/recent-activity/all/";
  // const BASE_URL =
  // "http://127.0.0.1:5001/auto-linkedin-backend/us-central1/api";
  const BASE_URL = "https://api-2jx5jiopma-uc.a.run.app";

  // const postsFetchedRef = useRef(false);
  useEffect(() => {
    if (!userProfile) {
      // const token = localStorage.getItem("session_token");
      if (!token) {
        navigate("/signin");
      }
      if (localStorage.getItem("new_user") === "true") {
        navigate("/onboarding");
      }
      fetchUserProfile(token);
    }
  }, [userProfile, navigate, token]);

  const fetchUserProfile = async (token) => {
    try {
      const response = await axios.get(`${BASE_URL}/linkedin/me`, {
        headers: { Authorization: token },
      });

      setUserProfile(response.data.userInfo);
    } catch (error) {
      console.error("Error fetching LinkedIn profile:", error);
    }
  };

  const postToLinkedIn = async () => {
    try {
      await axios.post(
        `${BASE_URL}/linkedin/post`,
        {
          access_token: userProfile.accessToken,
          text: postText,
        },
        { headers: { Authorization: token } }
      );
      setPostText("");
    } catch (error) {
      console.error(
        "Error posting to LinkedIn:",
        error.response?.data || error.message
      );
    }
  };

  // const fetchUserPosts = async () => {
  //   try {
  //     const response = await axios.get(`${BASE_URL}/linkedin/posts`, {
  //       params: {
  //         url: URL,
  //         count: 10,
  //       },
  //     });
  //     setPosts(response.data);
  //   } catch (error) {
  //     console.error("Error fetching LinkedIn posts:", error);
  //   }
  // };

  const generatePost = async () => {
    if (!contextText) {
      alert("Please enter context for AI-generated post");
      return;
    }
    try {
      const response = await axios.get(`${BASE_URL}/linkedin/generate-post`, {
        params: { context: contextText, char_length: charLength },
      });
      setPostText(response.data.response);
    } catch (error) {
      console.error(
        "Error generating post:",
        error.response?.data || error.message
      );
    }
  };

  return (
    <div className="container">
      <h2>Welcome to the Dashboard!</h2>
      <div className="profile">
        {userProfile ? (
          <p>
            <strong>Name:</strong> {userProfile.name}
          </p>
        ) : (
          <p>Loading profile...</p>
        )}
      </div>
      <h3>Post on LinkedIn</h3>
      <label>
        <input
          type="checkbox"
          checked={createByContext}
          onChange={() => setCreateByContext(!createByContext)}
        />
        Create by Context
      </label>

      <button onClick={generatePost}>Generate Post</button>
      {createByContext && (
        <>
          <label>
            Set Word Length:
            <input
              type="text"
              onChange={(e) => setCharLength(e.target.value)}
            />
          </label>
          <textarea
            placeholder="Enter context for AI-generated post..."
            value={contextText}
            onChange={(e) => setContextText(e.target.value)}
            rows={3}
          />
        </>
      )}
      <textarea
        placeholder={
          createByContext
            ? "Generated post will display here..."
            : "Enter your post..."
        }
        value={postText}
        onChange={(e) => setPostText(e.target.value)}
        rows={4}
      />
      <button onClick={postToLinkedIn}>Post to LinkedIn</button>
      <h2>User LinkedIn Posts</h2>
      <div className="posts">
        {posts.length > 0 ? (
          posts.map((post) => (
            <div className="post" key={post.postId}>
              <p>
                <strong>Author:</strong> {post.author}
              </p>
              <p>
                <strong>Posted:</strong> {post.timestamp}
              </p>
              <p>
                <strong>Content:</strong> {post.content}
              </p>
              <p>
                <strong>Likes:</strong>{" "}
                {isNaN(post.engagement.likes) ? 0 : post.engagement.likes}
              </p>
              <p>
                <strong>Comments:</strong> {post.engagement.comments || 0}
              </p>
            </div>
          ))
        ) : (
          <p>No posts found.</p>
        )}
      </div>
      <button
        className="logout-btn"
        onClick={() => {
          localStorage.removeItem("linkedin_access_token");
          navigate("/signin");
        }}
      >
        Logout
      </button>
    </div>
  );
};

export default Dashboard;
