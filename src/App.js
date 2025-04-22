import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  Navigate,
} from "react-router-dom";
import HomePage from "./Pages/SignIn";
import Dashboard from "./Pages/Dashboard";
import Onboarding from "./Pages/OnboardingPage";
import Calender from "./Pages/Calender";
import axios from "axios";

// const BASE_URL = "http://127.0.0.1:5001/linkedin-app-v1/us-central1/api";
const BASE_URL = "https://api-5hstctgwfa-uc.a.run.app";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signin" element={<HomePage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/calender" replace />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route
          path="/calender"
          element={
            <ProtectedRoute>
              <Calender />
            </ProtectedRoute>
          }
        />
        {/* <Route path="/calender" element={<Calender />} /> */}
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
