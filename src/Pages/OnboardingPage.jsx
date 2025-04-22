import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Onboarding.css";

import axios from "axios";

import { motion, AnimatePresence } from "framer-motion"; // install this if not added

const fadeSlide = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, x: -30, transition: { duration: 0.3 } },
};

const questions = [
  "What problems do I solve?",
  "What processes do I use?",
  "What perspectives do I have?",
  "What proof can I share?",
  "What personal stories connect to my work?",
];

const MIN_CHARS = 15;

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(Array(questions.length).fill(""));
  const navigate = useNavigate();
  const textareaRef = useRef(null);
  const [userProfile, setUserProfile] = useState(null);

  // const BASE_URL = "http://127.0.0.1:5001/linkedin-app-v1/us-central1/api";
  const BASE_URL = "https://api-5hstctgwfa-uc.a.run.app";

  useEffect(() => {
    // const new_user = localStorage.getItem("new_user");
    // console.log("new_user", new_user);
    // if (!new_user || new_user !== "true") {
    //   navigate("/signin");
    // }
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
        navigate("/calender");
      }
    }
    setTimeout(() => {
      if (textareaRef.current) {
        console.log("Here");

        textareaRef.current.focus();
      }
    }, 500);
  });

  const fetchUserProfile = async (token) => {
    console.log("Fetching user profile");

    try {
      const response = await axios.get(`${BASE_URL}/linkedin/me`, {
        headers: { Authorization: token },
      });
      console.log("User Profile:", response.data.userInfo);
      // const onboardingAnswers = response.data.userInfo.onboarding_answers;
      if (response.data.userInfo.onboarding_completed === true) {
        console.log("Onboarding already completed");
        navigate("/calender");
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
  const handleNext = () => {
    console.log("Here is the char length");

    console.log(answers[step].trim().length);

    if (answers[step].trim().length < MIN_CHARS) return;
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleChange = (e) => {
    const updatedAnswers = [...answers];
    updatedAnswers[step] = e.target.value;
    setAnswers(updatedAnswers);
  };

  const handleSubmit = async () => {
    await axios.post(
      `${BASE_URL}/onboarding`,
      {
        answers,
      },
      {
        headers: {
          Authorization: localStorage.getItem("session_token"),
        },
      }
    );
    localStorage.removeItem("new_user");
    // setTimeout(() => {
    navigate("/calender");
    // }, 30000);
    // Send to backend or store in context
  };

  return (
    <div className="signup-container">
      <div className="form-section">
        <div className="logo">🦖 Zilla</div>
        <div className="form-wrapper">
          <div className="onboarding-header">
            <h1>
              {" "}
              Identify your 5 core content pillars by answering: <br />
              <br />
              Q. {step + 1} of {questions.length}
            </h1>
          </div>
          <div className="onboarding-content">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                variants={fadeSlide}
                initial="initial"
                animate="animate"
                exit="exit"
                className="onboarding-step-container"
              >
                <p className="onboarding-question">{questions[step]}</p>
                <textarea
                  className="onboarding-textarea"
                  value={answers[step]}
                  onChange={handleChange}
                  ref={textareaRef}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleNext();
                    }
                  }}
                  placeholder="Type your answer..."
                />
                {answers[step].trim().length > 0 &&
                  answers[step].trim().length < MIN_CHARS && (
                    <p className="char-warning">
                      Answer must be at least {MIN_CHARS} characters long.
                    </p>
                  )}
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="onboarding-footer">
            <button
              onClick={handleBack}
              disabled={step === 0}
              className="btn back-btn"
            >
              Back
            </button>
            <button
              onClick={handleNext}
              className="btn next-btn"
              disabled={answers[step].trim().length < MIN_CHARS}
            >
              {step === questions.length - 1 ? "Finish" : "Next"}
            </button>
          </div>
        </div>
      </div>
      <div className="graphic-section">
        <h2>Grow your Linkedin presence with ease!</h2>
        <img
          src="/images/like3.png" // Replace with your own vector image or animation
          alt="Email Graphic"
          className="illustration"
        />
      </div>
    </div>
  );
}
