import React, { useState, useEffect } from "react";
import "./Calender.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// const BASE_URL =
// "http://127.0.0.1:5001/auto-linkedin-backend/us-central1/api";
const BASE_URL = "https://api-5hstctgwfa-uc.a.run.app";

export default function ContentCalendar() {
  const navigate = useNavigate();
  const [pillars] = useState(["", "", "", ""]);
  const [confirmed, setConfirmed] = useState([false, false, false]);
  const [token] = useState(localStorage.getItem("session_token"));
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    if (!userProfile) {
      const token = localStorage.getItem("session_token");
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
      console.log("User Profile:", response.data.userInfo);

      setUserProfile(response.data.userInfo);
    } catch (error) {
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

  return (
    <div className="calendar-container">
      <h2>Monthly View</h2>
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
                <td>
                  $
                  {userProfile
                    ? userProfile.onboarding_answers[i]
                    : "Loading..."}
                </td>
                <td>{pillars[i] || `[Pillar ${i + 1}]`}</td>
                <td>{goal}</td>
              </tr>
            )
          )}
        </tbody>
      </table>

      <h2>Weekly Breakdown</h2>
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
            ["Monday", "Teaching", "Process Reveal", "[idea1]", "9:00am"],
            [
              "Wednesday",
              "Problem/Solution",
              "Myth Buster",
              "[idea2]",
              "11:00am",
            ],
            ["Friday", "Success Story", "Before/After", "[idea3]", "3:00pm"],
          ].map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j}>{cell}</td>
              ))}
              <td>
                <button
                  className={`confirm-btn ${confirmed[i] ? "confirmed" : ""}`}
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
  );
}
