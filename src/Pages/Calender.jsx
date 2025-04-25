import React, { useState, useEffect } from "react";
import "./Calender.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// const BASE_URL = "http://127.0.0.1:5001/linkedin-app-v1/us-central1/api";
// const BASE_URL = "https://api-5hstctgwfa-uc.a.run.app";

var BASE_URL;
const env = process.env.REACT_APP_ENVIRONMENT;
if (env === "production") {
  // Production URL
  BASE_URL = process.env.REACT_APP_PRODUCTION_URL;
} else {
  // Development URL
  BASE_URL = process.env.REACT_APP_DEVELOPMENT_URL;
}

const MAX_CHARS = 3000;
export default function ContentCalendar() {
  const navigate = useNavigate();
  const [pillars] = useState(["Problems", "Processes", "Perspective", "Proof"]);
  // const [confirmed, setConfirmed] = useState([false, false, false]);
  // const [token] = useState(localStorage.getItem("session_token"));
  const [userProfile, setUserProfile] = useState(null);
  const [topics, setTopics] = useState([
    "Topic Idea 1",
    "Topic Idea 2",
    "Topic Idea 3",
  ]);
  const [activeView, setActiveView] = useState("monthly");

  const [editingIndex, setEditingIndex] = useState(null);
  const [posts, setPosts] = useState(["", "", ""]);
  const [newPosts, setNewPosts] = useState(["", "", ""]);
  const [isScheduled, setIsScheduled] = useState([false, false, false]);

  useEffect(() => {
    if (!userProfile) {
      const token = localStorage.getItem("session_token");
      if (!token) {
        navigate("/signin");
      } else {
        try {
          fetchUserProfile(token);
        } catch (error) {
          console.error("Error fetching LinkedIn profile:", error);
        }
        // fetchUserProfile(token).then(() => {
        //   if (userProfile.onboarding_completed === false) {
        //     navigate("/onboarding");
        //   }
        // });
      }

      // if (localStorage.getItem("new_user") === "true") {
      //   navigate("/onboarding");
      // } else {
      //   fetchUserProfile(token);
      // // }
    }
  });

  const fetchUserProfile = async (token) => {
    console.log("Fetching user profile");

    try {
      const response = await axios.get(`${BASE_URL}/linkedin/me`, {
        headers: { Authorization: token },
      });
      console.log("User Profile:", response.data.userInfo);

      const userInfo = response.data.userInfo;
      if (userInfo.onboarding_completed === false) {
        console.log("Onboarding not completed");
        navigate("/onboarding");
      } else {
        setUserProfile(userInfo);

        //Check if user has tasks
        if (userInfo.tasks) {
          const userPosts = [
            userInfo.tasks[0]?.content || "",
            userInfo.tasks[1]?.content || "",
            userInfo.tasks[2]?.content || "",
          ];
          setPosts(userPosts); // Set the posts array based on the user tasks
          setNewPosts(userPosts); // Set the new posts array based on the user tasks
          const scheduledStatus = [
            !!userInfo.tasks[0]?.content,
            !!userInfo.tasks[1]?.content,
            !!userInfo.tasks[2]?.content,
          ];

          setIsScheduled(scheduledStatus); // Set the scheduled status based on user tasks
        }

        //Set topics if necessary
        if (userInfo.topicIdeas.length < 3) {
          console.log("Setting topics");
          setTopics(
            await axios.post(
              `${BASE_URL}/onboarding`,
              { answers: userInfo.onboarding_answers },
              { headers: { Authorization: token } }
            )
          );
          // Refresh the page
          window.location.reload();
        } else {
          setTopics(userInfo.topicIdeas);
        }
      }
    } catch (error) {
      if (error.response.data.error === "User not found") {
        localStorage.removeItem("session_token");
        navigate("/signin");
      }

      console.error("Error fetching LinkedIn profile:", error);
    }
  };

  //   const getPillars = async (token) => {
  //     try {
  //       const response = await axios.get(`${BASE_URL}/pillars`, {
  //         headers: { Authorization: token },
  //       });
  //       setPillars(response.data.pillars);
  //     } catch (error) {
  //       console.error("Error fetching pillars:", error);
  //     }
  //   };

  // const toggleConfirmation = (index) => {
  //   setConfirmed((prev) => {
  //     const updated = [...prev];
  //     updated[index] = !updated[index];
  //     return updated;
  //   });
  // };

  // const handleEditAnswers = () => {
  //   localStorage.setItem("onboarding", "true");
  //   navigate("/onboarding");
  // };
  function getNextWeekdayTime(targetDay, targetHour) {
    const now = new Date();
    const currentDay = now.getDay(); // 0 (Sun) - 6 (Sat)
    const currentHour = now.getHours();

    let date = new Date(now);

    if (currentDay === targetDay && currentHour < targetHour) {
      // It's the target day and still before the target hour → use today
      date.setHours(targetHour, 0, 0, 0);
    } else {
      // Otherwise go to next week's target day
      const daysToAdd = (7 + targetDay - currentDay) % 7 || 7;
      date.setDate(now.getDate() + daysToAdd);
      date.setHours(targetHour, 0, 0, 0);
    }

    return date.toISOString(); // Send this to the backend
  }

  const handleSchedulePost = async (index, currPosts) => {
    const sessionToken = localStorage.getItem("session_token");
    try {
      let utcDate;
      if (index === 0) {
        utcDate = getNextWeekdayTime(1, 9); // Monday at 9 AM
      } else if (index === 1) {
        utcDate = getNextWeekdayTime(3, 11); // Wednesday at 11 AM
      } else if (index === 2) {
        utcDate = getNextWeekdayTime(5, 15); // Friday at 3 PM
      }
      console.log("Time is in UTC:", utcDate);

      await axios.post(
        `${BASE_URL}/schedule_post`,
        {
          postContent: currPosts[index],
          userId: userProfile.userId,
          index: index,
          scheduledTime: utcDate,
        },
        { headers: { Authorization: sessionToken } }
      );
      if (currPosts[index] === "") {
        toast.success("Post cancelled successfully");
      } else {
        toast.success("Post scheduled successfully");
      }
    } catch (error) {
      console.error("Error scheduling post:", error);
    }
  };

  const themes = [
    "Current Trends",
    "Client Questions",
    "Problems you Solved",
    "Your Skills",
  ];

  return (
    <div className="calendar-container">
      <div className="calender-logo">🦖 Zilla</div>
      <div className="calender-buttons-container">
        <div className="calendar-toggle">
          <button
            className={`calendar-toggle-btn ${
              activeView === "monthly" ? "active" : ""
            }`}
            onClick={() => setActiveView("monthly")}
          >
            Monthly View
          </button>
          <button
            className={`calendar-toggle-btn ${
              activeView === "weekly" ? "active" : ""
            }`}
            onClick={() => setActiveView("weekly")}
          >
            Weekly Breakdown
          </button>
        </div>
        {/* <button className="edit-pillars-button" onClick={handleEditAnswers}>
          Edit my Answers
        </button> */}
      </div>

      {activeView === "monthly" && (
        <div className="monthly-view-container">
          {/* <h2>Monthly View</h2> */}
          <table className="calendar-table">
            <thead>
              <tr>
                <th>Week</th>
                <th>Theme</th>
                <th>Content Pillar</th>
                <th>Primary Goal</th>
              </tr>
            </thead>
            <tbody>
              {["Awareness", "Engagement", "Authority", "Connection"].map(
                (goal, i) => (
                  <tr key={i}>
                    <td>Week {i + 1}</td>
                    <td>{themes[i] || `[Theme ${i + 1}]`}</td>
                    <td>
                      {" "}
                      <span
                        className={`badge badge-${pillars[i].toLowerCase()}`}
                      >
                        {pillars[i]}
                      </span>
                    </td>
                    <td>{goal}</td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}
      {activeView === "weekly" && (
        <div className="weekly-view-container">
          {/* <h2>Weekly Breakdown</h2> */}
          <table className="calendar-table">
            <thead>
              <tr>
                <th>Day</th>
                <th>Content Type</th>
                <th>Template</th>
                <th>Topic Ideas</th>
                <th>Post Time</th>
                <th>Confirmation</th>
              </tr>
            </thead>
            <tbody>
              {[
                [
                  "Monday",
                  "Teaching",
                  "Process Reveal",
                  `${topics[0]}`,
                  "9:00am",
                ],
                [
                  "Wednesday",
                  "Problem/Solution",
                  "Myth Buster",
                  `${topics[1]}`,
                  "11:00am",
                ],
                [
                  "Friday",
                  "Success Story",
                  "Before/After",
                  `${topics[2]}`,
                  "3:00pm",
                ],
              ].map((row, i) => (
                <>
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td key={j}>{cell}</td>
                    ))}
                    <td>
                      <button
                        className="write-post-btn"
                        onClick={() => setEditingIndex(i)}
                      >
                        {isScheduled[i] ? "Edit Post" : "Write Post"}
                      </button>
                    </td>
                  </tr>
                  {editingIndex === i && (
                    <tr className="editor-row">
                      <td colSpan={6}>
                        <textarea
                          className="post-textarea"
                          value={newPosts[i]}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value.length <= MAX_CHARS) {
                              const updated = [...newPosts];
                              updated[i] = value;
                              setNewPosts(updated);
                            }
                          }}
                          placeholder="Write your post content here..."
                        />
                        {newPosts[i].trim().length === MAX_CHARS && (
                          <p className="char-warning">
                            Post cannot be more than {MAX_CHARS} characters
                            long.
                          </p>
                        )}
                        <div className="schedule-buttons-container">
                          <button
                            className="cancel-post-btn"
                            onClick={() => {
                              // Just close the editor, don't save
                              setEditingIndex(null);
                              // setPosts(userProfile.tasks[i]?.content || "");
                              setNewPosts((prevPosts) => {
                                const updatedPosts = [...prevPosts];
                                updatedPosts[i] = posts[i];
                                return updatedPosts;
                              });
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            className="cancel-post-btn-2"
                            onClick={() => {
                              const updatedScheduled = [...isScheduled];
                              updatedScheduled[i] = false;
                              setIsScheduled(updatedScheduled);
                              setEditingIndex(null);

                              setPosts((prevPosts) => {
                                const updatedPosts = [...prevPosts];
                                updatedPosts[i] = "";
                                handleSchedulePost(i, updatedPosts);
                                return updatedPosts;
                              });
                              setNewPosts((prevPosts) => {
                                const updatedPosts = [...prevPosts];
                                updatedPosts[i] = "";
                                return updatedPosts;
                              });
                            }}
                          >
                            Cancel Post
                          </button>
                          <button
                            className="schedule-post-btn"
                            onClick={() => {
                              const updatedScheduled = [...isScheduled];
                              updatedScheduled[i] = true;
                              setIsScheduled(updatedScheduled);
                              setEditingIndex(null);
                              handleSchedulePost(i, newPosts);
                            }}
                            disabled={!newPosts[i]}
                          >
                            Schedule Post
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
