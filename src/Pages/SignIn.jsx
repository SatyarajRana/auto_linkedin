import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import "./SignIn.css";

const CLIENT_ID = "77szn4r1ff9i3g";
const REDIRECT_URI = "http://localhost:3000/signin";

const SignIn = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const authorizationCode = searchParams.get("code");
    console.log("====================================");
    console.log("authorizationCode", authorizationCode);
    console.log("====================================");

    if (authorizationCode) {
      exchangeCodeForToken(authorizationCode);
    }
  }, []);

  const exchangeCodeForToken = async (code) => {
    await new Promise((resolve) => setTimeout(resolve, 5000));
    try {
      const response = await axios.post(
        "http://localhost:8080/getLinkedInToken",
        { code }
      );

      const accessToken = response.data.accessToken;
      // const userInfo = response.data.userInfo;
      console.log("====================================");
      console.log("response.data", response.data);
      console.log("====================================");
      localStorage.setItem("linkedin_access_token", accessToken);
      // localStorage.setItem("userInfo", JSON.stringify(userInfo));
      localStorage.setItem("user_sub", response.data.sub);

      await new Promise((resolve) => setTimeout(resolve, 5000));
      navigate("/dashboard");
    } catch (error) {
      console.error("Error exchanging code for token", error);
    }
  };

  const handleLinkedInLogin = () => {
    window.location.href = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=profile%20w_member_social%20openid`;
  };

  return (
    <div className="signin-container">
      <div className="signin-box">
        <h2>Welcome! Please sign in</h2>
        <button className="signin-btn" onClick={handleLinkedInLogin}>
          Sign in with LinkedIn
        </button>
      </div>
    </div>
  );
};

export default SignIn;
