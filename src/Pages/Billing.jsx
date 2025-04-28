import { useEffect, useState } from "react";

import { loadStripe } from "@stripe/stripe-js";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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

  async function handleSubscribe(priceId) {
    // Call backend to create Checkout session
    // const res = await fetch("/create-checkout-session", {
    //   method: "POST",
    //   {
    //     Authorization: localStorage.getItem("session_token"),
    //   },
    //   body: JSON.stringify({ priceId }),
    // });
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
    <div className="flex flex-col items-center justify-center h-screen">
      <h3>{products[0].name}</h3>
      <p>{products[0].description}</p>
      <button onClick={() => handleSubscribe(products[0].priceId)}>
        Subscribe ${products[0].price} ${products[0].currency}/month
      </button>
    </div>
  );
}
