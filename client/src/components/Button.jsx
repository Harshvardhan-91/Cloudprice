import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';

function Button({ text, to }) {
  return (
    <NavLink to={to}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="custom-gradient text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
      >
        {text}
      </motion.button>
    </NavLink>
  );
}

export default Button;