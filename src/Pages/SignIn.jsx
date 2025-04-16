import "./HomePage.css";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

const CLIENT_ID = "77szn4r1ff9i3g";
const REDIRECT_URI = "https://linked-in-test-v1.netlify.app/signin";

const SignIn = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const authorizationCode = searchParams.get("code");
    console.log("====================================");
    console.log("authorizationCode", authorizationCode);
    console.log("====================================");

    const exchangeCodeForToken = async (code) => {
      await new Promise((resolve) => setTimeout(resolve, 60000));
      try {
        const response = await axios.post(
          "https://api-2jx5jiopma-uc.a.run.app/getLinkedInToken",
          { code },
          { withCredentials: true }
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

    if (authorizationCode) {
      exchangeCodeForToken(authorizationCode);
    }
  }, [navigate, searchParams]);

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

// const features = [
//   {
//     title: "Autogenerate Posts with AI",
//     image: "/images/auto-ai.png",
//   },
//   {
//     title: "Generate using context",
//     image: "/images/context.png",
//   },
//   {
//     title: "Customise and Schedule posts",
//     image: "/images/schedule.png",
//   },
// ];

// export default function HomePage() {
//   const [activeFeature, setActiveFeature] = useState(0);
//   const [searchParams] = useSearchParams();
//   const navigate = useNavigate();

//   useEffect(() => {
//     const authorizationCode = searchParams.get("code");
//     console.log("====================================");
//     console.log("authorizationCode", authorizationCode);
//     console.log("====================================");

//     if (authorizationCode) {
//       exchangeCodeForToken(authorizationCode);
//     }
//   }, []);

//   const exchangeCodeForToken = async (code) => {
//     await new Promise((resolve) => setTimeout(resolve, 60000));
//     try {
//       const response = await axios.post(
//         "http://localhost:8080/getLinkedInToken",
//         { code }
//       );

//       const accessToken = response.data.accessToken;
//       // const userInfo = response.data.userInfo;
//       console.log("====================================");
//       console.log("response.data", response.data);
//       console.log("====================================");
//       localStorage.setItem("linkedin_access_token", accessToken);
//       // localStorage.setItem("userInfo", JSON.stringify(userInfo));
//       localStorage.setItem("user_sub", response.data.sub);

//       await new Promise((resolve) => setTimeout(resolve, 5000));
//       navigate("/dashboard");
//     } catch (error) {
//       console.error("Error exchanging code for token", error);
//     }
//   };

//   const handleLinkedInLogin = () => {
//     window.location.href = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=profile%20w_member_social%20openid`;
//   };

//   return (
//     <div className="container">
//       {/* Navbar */}
//       <nav className="navbar">
//         <div className="nav-left">
//           <button>Home</button>
//           <button>Pricing</button>
//           <button>About Us</button>
//         </div>
//         <button className="linkedin-btn">Sign in with LinkedIn</button>
//       </nav>

//       {/* Hero Section */}
//       <section className="hero">
//         <h1>Grow your Linkedin presence with ease</h1>
//         <p>
//           Our ghostwriting app simplifies the process of creating and posting
//           engaging content on LinkedIn. Sign in with LinkedIn to get started!
//         </p>
//         <button className="linkedin-btn">Sign in with LinkedIn</button>
//       </section>

//       {/* Feature Section */}
//       <section className="features">
//         <div className="feature-image">
//           <img
//             src={features[activeFeature].image}
//             alt={features[activeFeature].title}
//           />
//         </div>

//         <div className="feature-titles">
//           {features.map((feature, index) => (
//             <button
//               key={index}
//               onClick={() => setActiveFeature(index)}
//               className={
//                 activeFeature === index ? "active-title" : "inactive-title"
//               }
//             >
//               {feature.title}
//             </button>
//           ))}
//         </div>
//       </section>

//       {/* Footer */}
//       <footer className="footer">
//         <a href="#">Contact Us</a>
//         <a href="#">About Us</a>
//         <a href="#">Privacy Policy</a>
//       </footer>
//     </div>
//   );
// }
