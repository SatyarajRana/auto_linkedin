import React, { useState, useEffect } from "react";
import "./Calender.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// const BASE_URL = "http://127.0.0.1:5001/linkedin-app-v1/us-central1/api";
const BASE_URL = "https://api-5hstctgwfa-uc.a.run.app";

export default function ContentCalendar() {
  const navigate = useNavigate();
  const [pillars] = useState(["Problems", "Processes", "Perspective", "Proof"]);
  const [confirmed, setConfirmed] = useState([false, false, false]);
  // const [token] = useState(localStorage.getItem("session_token"));
  const [userProfile, setUserProfile] = useState(null);
  const [topics, setTopics] = useState([
    "Topic Idea 1",
    "Topic Idea 2",
    "Topic Idea 3",
  ]);
  const [activeView, setActiveView] = useState("monthly");

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
      const onboardingAnswers = response.data.userInfo.onboarding_answers;
      if (response.data.userInfo.onboarding_completed === false) {
        console.log("Onboarding not completed");
        navigate("/onboarding");
      } else {
        setUserProfile(response.data.userInfo);
        if (response.data.userInfo.topicIdeas.length < 3) {
          console.log("Setting topics");

          setTopics(
            await axios.post(
              `${BASE_URL}/onboarding`,
              { answers: onboardingAnswers },
              { headers: { Authorization: token } }
            )
          );
          // refresh the page
          window.location.reload();
        } else {
          setTopics(response.data.userInfo.topicIdeas);
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

  const toggleConfirmation = (index) => {
    setConfirmed((prev) => {
      const updated = [...prev];
      updated[index] = !updated[index];
      return updated;
    });
  };

  // const handleEditAnswers = () => {
  //   localStorage.setItem("onboarding", "true");
  //   navigate("/onboarding");
  // };

  const themes = [
    "Current Trends",
    "Client Questions",
    "Problems you Solved",
    "Your Skills",
  ];

  return (
    <div className="calendar-container">
      <div className="logo">🦖 Zilla</div>
      <div className="calender-buttons-container">
        <div className="calendar-toggle">
          <button
            className={`toggle-btn ${activeView === "monthly" ? "active" : ""}`}
            onClick={() => setActiveView("monthly")}
          >
            Monthly View
          </button>
          <button
            className={`toggle-btn ${activeView === "weekly" ? "active" : ""}`}
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
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j}>{cell}</td>
                  ))}
                  <td>
                    <button
                      className={`confirm-btn ${
                        confirmed[i] ? "confirmed" : ""
                      }`}
                      onClick={() => toggleConfirmation(i)}
                    >
                      {confirmed[i] ? "✅" : "Confirm"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
