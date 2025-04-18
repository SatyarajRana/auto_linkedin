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

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(Array(questions.length).fill(""));
  const navigate = useNavigate();
  const textareaRef = useRef(null);

  //   const BASE_URL =
  // "http://127.0.0.1:5001/auto-linkedin-backend/us-central1/api";
  const BASE_URL = "https://api-5hstctgwfa-uc.a.run.app";

  useEffect(() => {
    const new_user = localStorage.getItem("new_user");
    console.log("new_user", new_user);
    if (!new_user || new_user !== "true") {
      navigate("/signin");
    }
    console.log("Step", step);

    setTimeout(() => {
      if (textareaRef.current) {
        console.log("Here");

        textareaRef.current.focus();
      }
    }, 500);
  }, [navigate, step]);
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
    <div className="onboarding-fullscreen">
      <h1 className="onboarding-header">
        Identify your 5 core content pillars by answering <br /> Question{" "}
        {step + 1} of {questions.length}
      </h1>
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
        <button onClick={handleNext} className="btn next-btn">
          {step === questions.length - 1 ? "Finish" : "Next"}
        </button>
      </div>
    </div>
  );
}
