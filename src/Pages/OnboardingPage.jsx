import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Onboarding.css";

import axios from "axios";

const questions = [
  "What's your current job title?",
  "What industry do you work in?",
  "What are your career goals?",
  "What kind of content do you want to post on LinkedIn?",
  "Who is your target audience on LinkedIn?",
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(Array(questions.length).fill(""));
  const navigate = useNavigate();

  //   const BASE_URL =
  // "http://127.0.0.1:5001/auto-linkedin-backend/us-central1/api";
  const BASE_URL = "https://api-2jx5jiopma-uc.a.run.app";

  useEffect(() => {
    const new_user = localStorage.getItem("new_user");
    console.log("new_user", new_user);

    if (!new_user || new_user !== "true") {
      navigate("/signin");
    }
  }, [navigate]);
  const handleNext = () => {
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
    navigate("/dashboard");
    // Send to backend or store in context
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-card">
        <h2 className="onboarding-step">
          Step {step + 1} of {questions.length}
        </h2>
        <p className="onboarding-question">{questions[step]}</p>
        <textarea
          className="onboarding-textarea"
          value={answers[step]}
          onChange={handleChange}
          placeholder="Type your answer..."
        />
        <div className="onboarding-buttons">
          <button
            onClick={handleBack}
            disabled={step === 0}
            className="btn back-btn"
          >
            Back
          </button>
          <button onClick={handleNext} className="btn next-btn">
            {step === questions.length - 1 ? "Finish" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
