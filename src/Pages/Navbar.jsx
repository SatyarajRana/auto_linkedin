import { motion } from "framer-motion";
import "./Navbar.css";
import { Home, FileText, CreditCard, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  const Particle = ({ index }) => {
    const delay = Math.random() * 5;
    const top = Math.random() * 100;
    const left = Math.random() * 100;

    return (
      <motion.div
        className="particle"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
        transition={{
          duration: 4,
          delay,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ top: `${top}%`, left: `${left}%` }}
      />
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("session_token");
    navigate("/signin");
  };

  return (
    <div className="navbar-container">
      {[...Array(40)].map((_, i) => (
        <Particle key={i} index={i} />
      ))}

      <h1 className="navbar-logo">🦖 Zilla</h1>

      <div className="navbar-links">
        <button className="nav-btn" onClick={() => navigate("/calendar")}>
          <Home size={18} /> <span>Home</span>
        </button>
        <button className="nav-btn" onClick={() => navigate("/posts")}>
          <FileText size={18} /> <span>Posts</span>
        </button>
        <button className="nav-btn" onClick={() => navigate("/billing")}>
          <CreditCard size={18} /> <span>Billing</span>
        </button>
        <button className="nav-btn logout" onClick={handleLogout}>
          <LogOut size={18} /> <span>Logout</span>
        </button>
      </div>

      <svg className="circuit-pattern" viewBox="0 0 800 200">
        <path
          d="M0,100 L100,100 L150,50 L250,50 L300,100 L400,100 L450,50 L550,50 L600,100 L700,100 L750,50 L800,50"
          fill="none"
          stroke="white"
          strokeWidth="1"
        />
        <path
          d="M0,150 L100,150 L150,100 L250,100 L300,150 L400,150 L450,100 L550,100 L600,150 L700,150 L750,100 L800,100"
          fill="none"
          stroke="white"
          strokeWidth="1"
        />
        <circle cx="100" cy="100" r="3" fill="white" />
        <circle cx="300" cy="100" r="3" fill="white" />
        <circle cx="600" cy="100" r="3" fill="white" />
        <circle cx="100" cy="150" r="3" fill="white" />
        <circle cx="300" cy="150" r="3" fill="white" />
        <circle cx="600" cy="150" r="3" fill="white" />
      </svg>
    </div>
  );
};

export default Navbar;
