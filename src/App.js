import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import SignIn from "./Pages/SignIn";
import Dashboard from "./Pages/Dashboard";

const Home = () => <h2>Home Page</h2>;

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
      </Routes>
    </Router>
  );
}

export default App;
