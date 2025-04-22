import "./SignIn.css";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

const CLIENT_ID = "77szn4r1ff9i3g";

// const BASE_URL = "http://127.0.0.1:5001/linkedin-app-v1/us-central1/api";
const BASE_URL = "https://api-5hstctgwfa-uc.a.run.app";

const REDIRECT_URI = "https://linked-in-test-v1.netlify.app/signin";
// const REDIRECT_URI = "http://localhost:3000/signin";

export default function HomePage() {
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

          // localStorage.setItem("new_user", true);
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
    <div className="signup-container">
      <div className="form-section">
        <div className="logo">🦖 Zilla</div>
        <div className="form-wrapper1">
          <div className="arrow-container">
            <img src="/images/arrow.png" alt="" className="arrow-image" />
          </div>
          <div className="form-content">
            <div className="form-header">
              <p className="subtitle">
                {" "}
                <h1>Welcome to Zilla</h1>Simplify the process of creating and
                posting engaging content on LinkedIn
              </p>
              <button className="signup-button" onClick={handleLinkedInLogin}>
                Sign in with Linkedin
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="graphic-section">
        <h2>Grow your Linkedin presence with ease!</h2>
        <img
          src="/images/like3.png"
          alt="Email Graphic"
          className="illustration"
        />
      </div>
    </div>
  );
}
