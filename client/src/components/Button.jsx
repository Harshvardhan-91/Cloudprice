import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';

function Button({ text, to, icon, variant = "primary" }) {
  // Button style variants
  const variants = {
    primary: "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white",
    secondary: "bg-white text-blue-600 border border-blue-200 hover:bg-blue-50",
    outline: "bg-transparent border-2 border-blue-500 text-blue-600 hover:bg-blue-50",
  };

  // Button shadow and reflection effect
  const getShadowClass = () => {
    if (variant === "primary") return "shadow-blue-500/30";
    if (variant === "secondary") return "shadow-gray-200/50";
    return "shadow-none";
  };

  return (
    <NavLink to={to} tabIndex={-1} className="outline-none">
      <motion.button
        whileHover={{ 
          scale: 1.05, 
          boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.4)" 
        }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
        className={`
          relative overflow-hidden flex items-center justify-center
          ${variants[variant]}
          rounded-xl py-3.5 px-8 shadow-lg ${getShadowClass()}
          font-semibold text-lg 
          transition-all duration-300 ease-out
          focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2
        `}
      >
        {/* Button shine effect on hover */}
        <span className="absolute inset-0 w-full h-full">
          <span className="absolute -left-10 top-0 h-full w-20 bg-white opacity-10 transform rotate-12 transition-all duration-1000 ease-out translate-x-[-200%] group-hover:translate-x-[1000%]"></span>
        </span>
        
        {/* Text and icon */}
        <span className="relative flex items-center gap-2">
          {text}
          {icon && <span className="ml-1">{icon}</span>}
        </span>
      </motion.button>
    </NavLink>
  );
}

export default Button;