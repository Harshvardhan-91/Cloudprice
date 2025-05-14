import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';

function Button({ text, to, icon }) {
  return (
    <NavLink to={to} tabIndex={-1}>
      <motion.button
        whileHover={{ scale: 1.05, boxShadow: '0 8px 24px rgba(59,130,246,0.15)' }}
        whileTap={{ scale: 0.97 }}
        className="inline-flex items-center justify-center custom-gradient btn-3d text-white font-semibold py-3 px-7 rounded-xl shadow-lg hover:shadow-xl transition-all text-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
      >
        {text}
        {icon && <span className="ml-2">{icon}</span>}
      </motion.button>
    </NavLink>
  );
}

export default Button;