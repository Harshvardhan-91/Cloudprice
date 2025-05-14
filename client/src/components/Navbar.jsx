import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Cloud, Moon, Sun, ChevronDown } from 'lucide-react';

// Assume NAV_LINKS is imported from constants
const NAV_LINKS = [
  { name: 'Home', path: '/' },
  { name: 'Features', path: '/features' },
  { name: 'Pricing', path: '/pricing' },
  { name: 'Explore', path: '/explore' },
  { name: 'Contact', path: '/contact' },
];

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dark, setDark] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const location = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleDark = () => setDark((d) => !d);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setDropdownOpen(null);
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`sticky top-0 z-50 backdrop-blur-xl transition-all duration-300 ${
        scrolled 
          ? 'shadow-lg shadow-blue-900/5 border-b' 
          : 'shadow-none'
      } ${
        dark 
          ? 'bg-gray-900/90 border-gray-800' 
          : 'bg-white/90 border-gray-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <NavLink 
            to="/" 
            className="flex items-center space-x-2 group"
          >
            <div className="flex items-center relative">
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{ 
                  duration: 8, 
                  repeat: Infinity, 
                  ease: 'easeInOut' 
                }}
                className="relative z-10"
              >
                <Cloud className="h-8 w-8 text-blue-500 group-hover:text-blue-600 transition-colors" />
                <div className="absolute inset-0 bg-blue-400/30 rounded-full blur-lg group-hover:blur-xl scale-90 group-hover:scale-125 transition-all duration-500"></div>
              </motion.div>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent select-none relative">
              CloudPrice
              <motion.span 
                className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500/0 via-blue-500/70 to-purple-500/0"
                animate={{ 
                  scaleX: [0, 1, 0],
                  x: [-20, 0, 20]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  ease: 'easeInOut' 
                }}
              />
            </span>
          </NavLink>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-1">
            {NAV_LINKS.map((link, index) => (
              <div key={link.name} className="relative group">
                {link.dropdown ? (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDropdownOpen(dropdownOpen === index ? null : index);
                      }}
                      className={`relative px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center gap-1 outline-none ${
                        dark
                          ? 'text-gray-200 hover:text-white hover:bg-gray-800'
                          : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                      }`}
                    >
                      {link.name}
                      <ChevronDown 
                        className={`h-4 w-4 transition-transform duration-200 ${
                          dropdownOpen === index ? 'rotate-180' : ''
                        }`} 
                      />
                    </button>
                    <AnimatePresence>
                      {dropdownOpen === index && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                          className={`absolute left-0 mt-1 w-48 rounded-md shadow-lg py-1 z-30 ${
                            dark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'
                          }`}
                        >
                          {link.dropdown.map((item) => (
                            <NavLink
                              key={item.name}
                              to={item.path}
                              className={({ isActive }) => `
                                block px-4 py-2 text-sm transition-colors ${
                                  isActive
                                    ? 'bg-blue-50 text-blue-600 dark:bg-gray-700 dark:text-cyan-400'
                                    : `${
                                        dark 
                                          ? 'text-gray-300 hover:bg-gray-700' 
                                          : 'text-gray-700 hover:bg-gray-50'
                                      }`
                                }
                              `}
                              onClick={() => setDropdownOpen(null)}
                            >
                              {item.name}
                            </NavLink>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <NavLink
                    to={link.path}
                    className={({ isActive }) => `
                      relative px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                        isActive
                          ? 'text-blue-600 dark:text-cyan-400'
                          : `${
                              dark 
                                ? 'text-gray-300 hover:text-white hover:bg-gray-800' 
                                : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                            }`
                      }
                    `}
                  >
                    <span className="relative">
                      {link.name}
                      {location.pathname === link.path && (
                        <motion.div
                          layoutId="nav-underline"
                          className="absolute left-0 right-0 -bottom-1 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                      )}
                    </span>
                  </NavLink>
                )}
              </div>
            ))}

            {/* Dark mode toggle with enhanced animation */}
            <button
              onClick={toggleDark}
              className={`ml-4 p-2 rounded-full transition-all duration-300 outline-none ${
                dark 
                  ? 'bg-gray-800 hover:bg-gray-700 text-yellow-300' 
                  : 'bg-gray-100 hover:bg-blue-100 text-gray-700'
              }`}
              title={dark ? "Switch to light mode" : "Switch to dark mode"}
            >
              <div className="relative w-5 h-5">
                <motion.div
                  initial={false}
                  animate={{ 
                    rotate: dark ? 0 : 180,
                    opacity: dark ? 1 : 0,
                    scale: dark ? 1 : 0 
                  }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0"
                >
                  <Sun className="h-5 w-5" />
                </motion.div>
                <motion.div
                  initial={false}
                  animate={{ 
                    rotate: dark ? 180 : 0, 
                    opacity: dark ? 0 : 1,
                    scale: dark ? 0 : 1 
                  }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0"
                >
                  <Moon className="h-5 w-5" />
                </motion.div>
              </div>
            </button>
          </div>

          {/* Mobile menu button with enhanced animation */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={toggleMenu} 
              className={`p-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors outline-none focus:ring-2 focus:ring-blue-400`}
              aria-label="Toggle menu"
            >
              <div className="relative w-6 h-6">
                <motion.div
                  initial={false}
                  animate={{ 
                    rotate: isOpen ? 90 : 0,
                    opacity: isOpen ? 0 : 1,
                    scale: isOpen ? 0 : 1 
                  }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <Menu className="h-6 w-6" />
                </motion.div>
                <motion.div
                  initial={false}
                  animate={{ 
                    rotate: isOpen ? 0 : -90, 
                    opacity: isOpen ? 1 : 0,
                    scale: isOpen ? 1 : 0 
                  }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <X className="h-6 w-6" />
                </motion.div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav with enhanced animation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`md:hidden overflow-hidden ${
              dark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'
            } border-b`}
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {NAV_LINKS.map((link, index) => (
                <div key={link.name}>
                  {link.dropdown ? (
                    <div>
                      <button
                        onClick={() => setDropdownOpen(dropdownOpen === index ? null : index)}
                        className={`flex items-center justify-between w-full px-3 py-2 text-base font-medium rounded-md transition-colors ${
                          dark
                            ? 'text-gray-200 hover:text-white hover:bg-gray-800'
                            : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                        }`}
                      >
                        {link.name}
                        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${
                          dropdownOpen === index ? 'rotate-180' : ''
                        }`} />
                      </button>
                      <AnimatePresence>
                        {dropdownOpen === index && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="pl-4 mt-1 space-y-1 border-l-2 border-gray-200 dark:border-gray-700"
                          >
                            {link.dropdown.map((item) => (
                              <NavLink
                                key={item.name}
                                to={item.path}
                                className={({ isActive }) => `
                                  block px-3 py-2 text-sm rounded-md transition-colors ${
                                    isActive
                                      ? 'bg-blue-50 text-blue-600 dark:bg-gray-700 dark:text-cyan-400'
                                      : `${
                                          dark 
                                            ? 'text-gray-300 hover:bg-gray-700' 
                                            : 'text-gray-700 hover:bg-gray-50'
                                        }`
                                  }
                                `}
                                onClick={() => {
                                  setDropdownOpen(null);
                                  setIsOpen(false);
                                }}
                              >
                                {item.name}
                              </NavLink>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <NavLink
                      to={link.path}
                      onClick={() => setIsOpen(false)}
                      className={({ isActive }) => `
                        block px-3 py-2 text-base font-medium rounded-md transition-colors ${
                          isActive
                            ? 'text-blue-600 dark:text-cyan-400 bg-blue-50 dark:bg-gray-800'
                            : `${
                                dark 
                                  ? 'text-gray-200 hover:text-white hover:bg-gray-800' 
                                  : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                              }`
                        }
                      `}
                    >
                      {link.name}
                    </NavLink>
                  )}
                </div>
              ))}
              
              {/* Dark mode toggle in mobile menu */}
              <div className="px-3 py-4 flex items-center">
                <span className={`text-sm font-medium ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {dark ? 'Light Mode' : 'Dark Mode'}
                </span>
                <button
                  onClick={toggleDark}
                  className={`ml-auto p-2 rounded-full ${
                    dark ? 'bg-gray-800 text-yellow-300' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

export default Navbar;