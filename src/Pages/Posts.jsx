import React, { useEffect, useState } from "react";
import "./Posts.css";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  LineChart,
} from "lucide-react";
import Navbar from "./Navbar";

import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

var BASE_URL;
const env = process.env.REACT_APP_ENVIRONMENT;
if (env === "production") {
  // Production URL
  BASE_URL = process.env.REACT_APP_PRODUCTION_URL;
} else {
  // Development URL
  BASE_URL = process.env.REACT_APP_DEVELOPMENT_URL;
}

const posts = [
  {
    date: "2025-05-07",
    text: "AI-powered sales outreach tools revolutionizing the way teams connect with prospects. Our latest case study shows 3x engagement rates!",
    status: "Posted",
    reactions: 65,
  },
  {
    date: "2025-05-09",
    text: "How we boosted client acquisition by 300% using LinkedIn automation – without spamming. The secret? Personalization at scale.",
    status: "Posted",
    reactions: 116,
  },
  {
    date: "2025-05-15",
    text: "Master multichannel outreach strategies with our proven framework. Join our webinar next week to learn more!",
    status: "Posted",
    reactions: 45,
  },
  {
    date: "2025-05-12",
    text: "AI-Powered Sales Outreach: The Future of B2B Prospecting – Our latest research paper is now available for download.",
    status: "Scheduled",
    editable: true,
  },
  {
    date: "2025-05-16",
    text: "How We Doubled Tech Sales Pipeline Through Strategic LinkedIn Engagement – Case study coming next week!",
    status: "Writing",
  },
  {
    date: "2025-06-18",
    text: "Join our live Q&A session on AI in sales this Friday! Get your questions ready and see how AI can transform your outreach.",
    status: "Scheduled",
  },
  {
    date: "2025-09-20",
    text: "Unlock the power of AI in your sales strategy! Our latest blog post dives deep into the tools that can supercharge your outreach.",
    status: "Scheduled",
  },
];

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const Posts = () => {
  const navigate = useNavigate();
  const [currentMonthIndex, setCurrentMonthIndex] = useState(4); // May = index 4
  const [selectedTab, setSelectedTab] = useState("Scheduled");
  const [postsData, setPostsData] = useState(posts);
  const [postsDataLoaded, setPostsDataLoaded] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState(null);

  useEffect(() => {
    const fetchUserInfo = async (token) => {
      console.log("Fetching user info...");

      try {
        const response = await axios.get(`${BASE_URL}/get-calendar-posts`, {
          headers: {
            Authorization: token,
          },
        });
        console.log("User info response:", response.data);
        await setPostsData(response.data.posts);
        setPostsDataLoaded(true);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const { response } = error;
          if (response?.status === 403) {
            switch (response.data?.errorType) {
              case "ONBOARDING_INCOMPLETE":
                toast.warning(
                  "Please complete onboarding to access the calendar."
                );
                navigate("/onboarding");
                break;

              case "SUBSCRIPTION_REQUIRED":
                toast.error(
                  "Please subscribe to access the calendar features."
                );
                navigate("/billing");
                break;

              default:
                toast.error("Access denied.");
            }
          } else if (response?.status === 401) {
            toast.error("User not found.");
            navigate("/signin");
          } else {
            toast.error("Unexpected error occurred.");
          }
        } else {
          console.log("This is the error,", error);

          toast.error("error");
        }
      }
    };
    if (!postsDataLoaded) {
      const token = localStorage.getItem("session_token");
      if (!token) {
        navigate("/signin");
      } else {
        try {
          fetchUserInfo(token);
        } catch (err) {
          console.error("Error fetching user info:", err);
          toast.error("Error fetching user info");
        }
      }
    }
  }, [postsDataLoaded, navigate]);

  const changeMonth = (direction) => {
    setCurrentMonthIndex((prevIndex) =>
      direction === "prev" ? (prevIndex - 1 + 12) % 12 : (prevIndex + 1) % 12
    );
  };

  const handleTabClick = (tab) => {
    setSelectedTab(tab);
  };

  const handleCardClick = (index) => {
    setExpandedIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  const filteredPosts = postsData
    .slice() // make a shallow copy before sorting
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .filter((post) => {
      const date = new Date(post.date);
      const matchMonth = date.getMonth() === currentMonthIndex;
      const matchTab = selectedTab === "All" || post.status === selectedTab;

      return matchMonth && matchTab;
    });

  return (
    <div className="your-posts">
      <Navbar />

      {/* CONTROLS */}
      <div className="posts-header">
        <div className="tabs">
          {["Scheduled", "Posted"].map((tab) => (
            <button
              key={tab}
              className={selectedTab === tab ? "active" : ""}
              onClick={() => handleTabClick(tab)}
            >
              {tab} Posts
            </button>
          ))}
        </div>
        <div className="posts-header-month-controls">
          <button onClick={() => changeMonth("prev")} className="month-btn">
            <ChevronLeft size={20} />
          </button>
          <span className="month-label">{months[currentMonthIndex]} 2025</span>
          <button onClick={() => changeMonth("next")} className="month-btn">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* POST CARDS */}
      <div className="posts-list">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post, index) => (
            <div
              className={`post-card ${post.status?.toLowerCase()}`}
              key={index}
              onClick={() => handleCardClick(index)}
            >
              <div className="post-header">
                <div className="post-date">
                  <CalendarDays size={15} color="rgb(170, 128, 20)" />
                  {new Date(post.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
                <span className={`status ${post.status?.toLowerCase()}`}>
                  {post.status}
                </span>
              </div>

              <div className="post-text">
                {post.topicIdea && post.topicIdea.trim()
                  ? post.topicIdea
                  : post.content
                  ? `${post.content.slice(0, 40)}...`
                  : ""}
              </div>

              <div
                className={`post-content-wrapper ${
                  expandedIndex === index ? "expanded" : ""
                }`}
              >
                <div className="post-content">
                  {expandedIndex === index
                    ? post.content || ""
                    : post.content
                    ? `${post.content.slice(0, 60)}${
                        post.content.length > 60 ? "..." : ""
                      }`
                    : ""}
                </div>
              </div>

              <div className="post-footer">
                {post.editable && (
                  <button className="edit-btn">Edit Post</button>
                )}
                {post.reactions != null && (
                  <div className="stats">
                    <span>
                      <LineChart size={15} color="rgb(170, 128, 20)" />{" "}
                      {post.reactions} Reactions
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="no-posts">No posts for this month.</div>
        )}
      </div>
    </div>
  );
};

export default Posts;
