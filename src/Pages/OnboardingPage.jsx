import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Onboarding.css";
import { Sparkles } from "lucide-react";

import SignInGraphicSection from "./GraphicsSection";

import axios from "axios";

const MIN_CHARS = 1;

export default function Onboarding() {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [editableAnswers, setEditableAnswers] = useState({
    teamType: "",
    industry: "",
    mainGoal: "",
    valueProp: "",
  });

  var BASE_URL;
  const env = process.env.REACT_APP_ENVIRONMENT;
  if (env === "production") {
    // Production URL
    BASE_URL = process.env.REACT_APP_PRODUCTION_URL;
  } else {
    // Development URL
    BASE_URL = process.env.REACT_APP_DEVELOPMENT_URL;
  }

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
      }
    } else {
      if (userProfile.onboarding_completed === true) {
        console.log("Onboarding already completed");
        navigate("/calendar");
      }
    }
  });

  const fetchUserProfile = async (token) => {
    console.log("Fetching user profile");

    try {
      const response = await axios.get(`${BASE_URL}/linkedin/me`, {
        headers: { Authorization: token },
      });
      console.log("User Profile is:", response.data.userInfo);
      // const onboardingAnswers = response.data.userInfo.onboarding_answers;
      if (response.data.userInfo.onboarding_completed === true) {
        console.log("Onboarding already completed");
        navigate("/calendar");
      } else {
        setUserProfile(response.data.userInfo);
      }
    } catch (error) {
      // console.log(error.response.data.error);
      if (error.response.data.error === "User not found") {
        localStorage.removeItem("session_token");
        navigate("/signin");
      }

      console.error("Error fetching LinkedIn profile:", error);
    }
  };
  const handleSpanInput = (field) => (e) => {
    setEditableAnswers((prev) => ({
      ...prev,
      [field]: e.target.innerText,
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const onboardingParagraph = `We help ${editableAnswers.teamType} in ${editableAnswers.industry} to ${editableAnswers.mainGoal} by ${editableAnswers.valueProp}`;
      await axios.post(
        `${BASE_URL}/onboarding`,
        {
          onboardingParagraph,
        },
        {
          headers: {
            Authorization: localStorage.getItem("session_token"),
          },
        }
      );
      navigate("/calendar");
    } catch (error) {
      setIsLoading(false);
      alert("There was an error during onboarding. Please try again later.");

      setTimeout(() => {
        navigate("/onboarding");
      }, 2000);
      console.error("Error submitting onboarding answers:", error);
    }
  };

  return (
    <div className="onboarding-fullscreen">
      <div className="onboarding-container">
        <div className="onboarding-form">
          <div className="onboarding-form-header">
            <h1 className="onboarding-form-title">
              Create your Content Calendar with AI 🤖
            </h1>
            <p className="onboarding-form-subtitle">
              Give us the information for your sequence, and we’ll take care of
              the rest!
            </p>
          </div>
          <div className="onboarding-form-content">
            We help{" "}
            <span
              contentEditable="true"
              data-placeholder="sales teams"
              className="editable-with-placeholder"
              onInput={handleSpanInput("teamType")}
            ></span>{" "}
            in{" "}
            <span
              contentEditable="true"
              data-placeholder="B2B agencies"
              className="editable-with-placeholder"
              onInput={handleSpanInput("industry")}
            ></span>{" "}
            to{" "}
            <span
              contentEditable="true"
              data-placeholder="book more sales meetings"
              className="editable-with-placeholder"
              onInput={handleSpanInput("mainGoal")}
            ></span>{" "}
            by{" "}
            <span
              contentEditable="true"
              data-placeholder="providing software that allows personalization at scale"
              className="editable-with-placeholder"
              onInput={handleSpanInput("valueProp")}
            ></span>
          </div>
          <div className="onboarding-form-footer">
            <button
              onClick={handleSubmit}
              className="onboarding-submit-button"
              disabled={
                editableAnswers.teamType.length < MIN_CHARS ||
                editableAnswers.industry.length < MIN_CHARS ||
                editableAnswers.mainGoal.length < MIN_CHARS ||
                editableAnswers.valueProp.length < MIN_CHARS
              }
            >
              <Sparkles size={16} style={{ marginRight: "8px" }} />
              Generate Content Calender
            </button>
          </div>
        </div>
      </div>
      <SignInGraphicSection />
      {isLoading && (
        <div className="loading-overlay">
          <div className="fancy-loader">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
          <p className="loading-overlay-text">
            Zilla is generating your Content Calendar...
          </p>
        </div>
      )}
    </div>
  );
}
