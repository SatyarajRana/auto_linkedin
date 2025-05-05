import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  Navigate,
} from "react-router-dom";
import HomePage from "./Pages/SignIn";
// import Dashboard from "./Pages/Dashboard";
import Onboarding from "./Pages/OnboardingPage";
import Calendar from "./Pages/Calendar";
import Billing from "./Pages/Billing";
import axios from "axios";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

var BASE_URL;
const env = process.env.REACT_APP_ENVIRONMENT;
if (env === "production") {
  // Production URL
  BASE_URL = process.env.REACT_APP_PRODUCTION_URL;
} else {
  // Development URL
  BASE_URL = process.env.REACT_APP_DEVELOPMENT_URL;
}

function App() {
  return (
    <Router>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        pauseOnHover
        draggable
      />
      <Routes>
        <Route path="/signin" element={<HomePage />} />
        {/* <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        /> */}
        <Route path="*" element={<Navigate to="/calendar" replace />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <Calendar />
            </ProtectedRoute>
          }
        />
        <Route path="/billing" element={<Billing />} />
        <Route
          path="/success"
          element={<div>Payment was successfully completed!!!</div>}
        />
        <Route path="/cancel" element={<div>Payment was cancelled!!!</div>} />
      </Routes>
    </Router>
  );
}

const authenticateToken = async (token) => {
  try {
    const response = await axios.get(`${BASE_URL}/auth/validate`, {
      headers: { Authorization: token },
    });

    if (response.data.valid) {
      // store response.data.user_sub in session storage
      sessionStorage.setItem("user_sub", response.data.user_sub);
    }
    return response.data.valid;
  } catch (error) {
    console.error("Error fetching LinkedIn profile:", error);
  }
};

const ProtectedRoute = ({ children }) => {
  const [isValidating, setIsValidating] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const validateToken = async () => {
      const sessionToken = localStorage.getItem("session_token");

      if (!sessionToken) {
        console.log("No session token found, redirecting to sign-in page");

        navigate("/signin", { replace: true });
        return;
      }

      try {
        const isTokenValid = await authenticateToken(sessionToken);
        if (!isTokenValid) {
          setIsValidating(false);
          console.log("Session token is invalid, redirecting to sign-in page");

          localStorage.removeItem("session_token");
          navigate("/signin", { replace: true });
        }
      } catch (error) {
        setIsValidating(false);
        localStorage.removeItem("session_token");
        navigate("/signin", { replace: true });
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [navigate]);

  if (isValidating) return <div>Loading...</div>;
  return children;
};

export default App;
