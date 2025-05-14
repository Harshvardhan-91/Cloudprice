import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X, Cloud } from 'lucide-react';
import { motion } from 'framer-motion';
import { NAV_LINKS } from '../lib/constants';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 bg-white shadow-md"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <NavLink to="/" className="flex items-center space-x-2">
              <Cloud className="h-8 w-8 text-blue-500" />
              <span className="text-2xl font-bold custom-gradient bg-clip-text text-transparent">
                CloudPrice
              </span>
            </NavLink>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `px-3 py-2 text-sm font-medium ${
                    isActive ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </div>
          <div className="md:hidden flex items-center">
            <button onClick={toggleMenu} className="text-gray-700">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
          className="md:hidden bg-white shadow-md"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={toggleMenu}
                className={({ isActive }) =>
                  `block px-3 py-2 text-base font-medium ${
                    isActive ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}

export default Navbar;