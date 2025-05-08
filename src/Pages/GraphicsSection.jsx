import { motion } from "framer-motion";
import { Hash, ThumbsUp, Heart } from "lucide-react";
import "./GraphicsSection.css";

const Particle = ({ left, top, size, delay }) => {
  return (
    <motion.span
      initial={{ opacity: 0, y: 0 }}
      animate={{
        y: [0, -10, 0],
        opacity: [0, 1, 0],
      }}
      transition={{
        repeat: Infinity,
        duration: 3,
        ease: "easeInOut",
        delay,
      }}
      style={{
        position: "absolute",
        left: `${left}%`,
        top: `${top}%`,
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: "white",
        borderRadius: "50%",
        opacity: 0.5,
        pointerEvents: "none",
      }}
    />
  );
};

const generateParticles = (count = 30) => {
  return Array.from({ length: count }).map((_, i) => {
    const left = Math.random() * 100;
    const top = Math.random() * 100;
    const size = Math.random() * 4 + 2;
    const delay = Math.random() * 5;

    return <Particle key={i} left={left} top={top} size={size} delay={delay} />;
  });
};

export default function SignInGraphicSection() {
  return (
    <div className="signin-graphic-section">
      <h2>Grow your LinkedIn presence with ease!</h2>

      <div className="icon-field">
        <div className="icon-box box-blue wobble icon1">
          <Hash size={40} />
        </div>
        <div className="icon-box box-yellow wobble icon2">
          <ThumbsUp size={45} />
        </div>
        <div className="icon-box box-pink wobble icon3">
          <Heart />
        </div>
      </div>
      {generateParticles(100)}

      <div className="signup-testimonial">
        <p>
          "Zilla has transformed how I engage with my network. My posts get 3x
          more engagement!"
        </p>
        <p>
          <strong>— Sarah Johnson, Marketing Director</strong>
        </p>
      </div>
    </div>
  );
}
