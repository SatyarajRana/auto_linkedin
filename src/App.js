import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignIn from "./Pages/SignIn";
import Dashboard from "./Pages/Dashboard";

function App() {
  // const auth_code = localStorage.getItem("linkedin_auth_code");
  const token = localStorage.getItem("linkedin_access_token");

  return (
    <Router>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/*" element={token ? <Dashboard /> : <SignIn />} />
        {/* <Route
          path="/access_token"
          element={token ? <Dashboard /> : <Navigate to="/signin" />}
        /> */}
        {/* <Route path="*" element={<h2>404 - Page Not Found</h2>} /> */}
        <Route path="/test" element={<h2>Test</h2>} />
      </Routes>
    </Router>
  );
}

export default App;
