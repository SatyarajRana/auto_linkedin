import { useEffect, useState } from "react";

import { loadStripe } from "@stripe/stripe-js";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaCheck, FaStar } from "react-icons/fa";
import "./Billing.css";

const stripePublishableKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
const stripePromise = loadStripe(stripePublishableKey);

export default function Billing() {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [products] = useState([
    {
      id: "prod_SDGR5HxWu29O8w",
      name: "Pro Plan",
      description: "Pro Plan",
      price: 5,
      currency: "USD",
      interval: "month",
      interval_count: 1,
      priceId: "price_1RIpuX1qu4fHYTift3grIJ3Z",
    },
  ]);
  const [isYearly, setIsYearly] = useState(false);

  const price = isYearly ? 29 * 10 : 29;
  const periodLabel = isYearly ? "/year" : "/month";

  var BASE_URL;
  const env = process.env.REACT_APP_ENVIRONMENT;
  if (env === "production") {
    // Production URL
    BASE_URL = process.env.REACT_APP_PRODUCTION_URL;
  } else {
    // Development URL
    BASE_URL = process.env.REACT_APP_DEVELOPMENT_URL;
  }

  useEffect(() => {
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
        // navigate("/calendar");
      }
    }
  });

  const fetchUserProfile = async (token) => {
    console.log("Fetching user profile");

    try {
      const response = await axios.get(`${BASE_URL}/linkedin/me`, {
        headers: { Authorization: token },
      });
      console.log("User Profile is:", response.data.userInfo);
      // const onboardingAnswers = response.data.userInfo.onboarding_answers;
      if (response.data.userInfo.onboarding_completed === true) {
        console.log("Onboarding already completed");
        // navigate("/calender");
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

  async function handleSubscribe() {
    const priceId = products[0].priceId;
    const res = await axios.post(
      `${BASE_URL}/create-stripe-checkout-session`,
      { priceId },
      {
        headers: {
          Authorization: localStorage.getItem("session_token"),
        },
      }
    );
    console.log("Response from backend", res.data.sessionId);
    const { sessionId } = await res.data;
    // Redirect to Stripe Checkout
    const stripe = await stripePromise;
    await stripe.redirectToCheckout({ sessionId });
  }
  return (
    <div className="billing-container">
      <div className="billing-page">
        <div className="billing-header">
          <h1>Join Our Growing Community</h1>
          <p className="subtitle">
            Subscribe today and experience the complete power of PostZilla🦖.
            100% satisfaction guaranteed.
          </p>
        </div>

        <div className="plan-card">
          <div className="plan-header">
            {/* Decorative Circles */}
            <div className="circle light-blue"></div>
            <div className="circle yellow top-right"></div>
            <div className="circle yellow bottom-right"></div>

            <span className="plan-name">Pro Plan</span>
            <span className="badge"> All-Inclusive</span>
          </div>

          <div className="plan-price">
            <span className="price">${price}</span>
            <span className="period">{periodLabel}</span>
            {isYearly && <span className="save-badge">Save 20%</span>}
          </div>

          <ul className="features-list">
            {[
              "Content Calendar",
              "AI Post Generation",
              "Post Topic Ideas",
              "Post Analytics",
              "Post Scheduling",
            ].map((feat) => (
              <li key={feat}>
                <FaCheck className="icon" /> {feat}
              </li>
            ))}
          </ul>

          <div className="billing-toggle">
            <span>Monthly</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={isYearly}
                onChange={() => setIsYearly(!isYearly)}
              />
              <span className="slider" />
            </label>
            <span>Yearly (2 months free)</span>
          </div>

          <button className="subscribe-button" onClick={handleSubscribe}>
            Upgrade Now
          </button>

          {/* <div className="security-info">
            <div>
              <FaLock className="icon" /> Secure payment
            </div>
            <div>
              <FaUndo className="icon" /> 30-day money-back guarantee
            </div>
          </div> */}
        </div>

        <div className="testimonial">
          <div className="stars">
            {[...Array(5)].map((_, i) => (
              <FaStar key={i} />
            ))}
          </div>
          <blockquote>
            "Getting PostZilla Pro Plan was the best decision for our team. The
            advanced features have significantly increased our Linkedin Post
            Impressions and Outreach.
          </blockquote>
          <div className="author">
            {/* Replace src with your real avatar URL */}
            <img
              src="/path/to/avatar.jpg"
              alt="Michael Thompson"
              className="avatar"
            />
            <div>
              <p className="name">Michael Thompson</p>
              <p className="role">Product Manager, TechCorp</p>
            </div>
          </div>
          {/* <p className="faq-link">
            <a href="/faq">Have questions? Check our FAQ →</a>
          </p> */}
        </div>
      </div>
    </div>
  );
}
