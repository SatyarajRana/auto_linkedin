import "./SignIn.css";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

const CLIENT_ID = "77szn4r1ff9i3g";

// const BASE_URL = "http://127.0.0.1:5001/auto-linkedin-backend/us-central1/api";
const BASE_URL = "https://api-5hstctgwfa-uc.a.run.app";

const REDIRECT_URI = "https://linked-in-test-v1.netlify.app/signin";

const features = [
  {
    title: "Autogenerate Posts with AI",
    image: "/images/autogenerate_posts.png",
    text: "Effortlessly create posts with our autogenerate feature",
  },
  {
    title: "Customise and Schedule posts",
    image: "/images/schedule_posts.png",
    text: "Schedule future posts",
  },
  {
    title: "Generate from context",
    image: "/images/autogenerate_context.png",
    text: "Generate posts from context",
  },
];

export default function HomePage() {
  const [activeFeature, setActiveFeature] = useState(0);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("session_token");

    const authenticateToken = async (token) => {
      try {
        const response = await axios.get(`${BASE_URL}/auth/validate`, {
          headers: { Authorization: token },
        });
        if (response.data.valid) {
          navigate("/calender");
        } else {
          localStorage.removeItem("session_token");
          navigate("/signin");
        }
      } catch (error) {
        console.error("Error fetching LinkedIn profile:", error);
      }
    };

    if (token) {
      authenticateToken(token);
    }

    const authorizationCode = searchParams.get("code");

    const exchangeCodeForToken = async (code) => {
      // await new Promise((resolve) => setTimeout(resolve, 60000));
      try {
        const response = await axios.post(
          `${BASE_URL}/getLinkedInToken`,
          { code }
          // { withCredentials: true }
        );

        localStorage.setItem("session_token", response.data.token);
        // localStorage.setItem("user_sub", response.data.sub);
        const user_exists = response.data.user_exists;
        console.log("USER EXISTS", user_exists);

        if (!user_exists) {
          console.log("User does not exist");

          localStorage.setItem("new_user", true);
          navigate("/onboarding");
        } else {
          navigate("/calender");
        }
      } catch (error) {
        console.error("Error exchanging code for token", error);
      }
    };

    if (authorizationCode) {
      exchangeCodeForToken(authorizationCode);
    }
  }, [navigate, searchParams]);

  const handleLinkedInLogin = () => {
    window.location.href = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=profile%20w_member_social%20openid`;
  };

  return (
    <div className="signin-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-left">
          <button>Home</button>
          <button>Pricing</button>
          <button>About</button>
        </div>
        <button className="signin-btn">Sign in with LinkedIn</button>
      </nav>

      {/* Hero Section */}
      <div className="hero">
        <h1>Grow your Linkedin presence with ease</h1>
        <p>
          Our ghostwriting app simplifies the process of creating and posting
          engaging content on LinkedIn. Sign in with LinkedIn to get started!
        </p>
        <button className="signin-btn" onClick={handleLinkedInLogin}>
          Sign in with LinkedIn
        </button>
      </div>

      {/* Feature Section */}
      <section className="features">
        <div className="image-container">
          <div className="feature-image">
            <img
              src={features[activeFeature].image}
              alt={features[activeFeature].title}
            />
          </div>
        </div>

        <div className="feature-titles-container">
          {features.map((feature, index) => (
            <div
              key={index}
              onClick={() => setActiveFeature(index)}
              className={
                activeFeature === index ? "active-title" : "inactive-title"
              }
            >
              <h1>{feature.title}</h1>

              <p>{feature.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>Contact Us</p>
        <p>About Us</p>
        <p>Privacy Policy</p>
      </footer>
    </div>
  );
}
