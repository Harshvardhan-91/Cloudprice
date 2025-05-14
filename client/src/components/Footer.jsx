import { NavLink } from 'react-router-dom';
import { Cloud, Github, Twitter, Linkedin, Mail, MapPin, Phone } from 'lucide-react';
import { useState, useEffect } from 'react';
import { NAV_LINKS } from '../lib/constants';

function Footer() {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  
  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="bg-white/70 dark:bg-gray-900/80 backdrop-blur-lg border-t border-gray-100 dark:border-gray-800 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Logo and company info */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-400 p-2 rounded-lg">
                <Cloud className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent select-none">
                CloudPrice
              </span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Helping businesses find the most cost-effective cloud computing solutions across multiple providers.
            </p>
            <div className="flex space-x-3 mt-4">
              <a href="https://github.com/" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-gray-700 transition-colors">
                <Github className="h-5 w-5 text-gray-500 dark:text-gray-300" />
              </a>
              <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-gray-700 transition-colors">
                <Twitter className="h-5 w-5 text-blue-400" />
              </a>
              <a href="https://linkedin.com/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-gray-700 transition-colors">
                <Linkedin className="h-5 w-5 text-blue-600" />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="flex flex-col space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Links</h3>
            <ul className="space-y-2">
              {NAV_LINKS.map((link) => (
                <li key={link.name}>
                  <NavLink
                    to={link.path}
                    className={({isActive}) => 
                      `text-gray-500 dark:text-gray-300 hover:text-blue-600 dark:hover:text-cyan-400 text-sm font-medium transition-colors flex items-center ${isActive ? 'text-blue-600 dark:text-cyan-400' : ''}`
                    }
                  >
                    {link.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Contact */}
          <div className="flex flex-col space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-blue-500 mt-0.5" />
                <span className="text-gray-500 dark:text-gray-300 text-sm">support@cloudprice.com</span>
              </div>
              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-blue-500 mt-0.5" />
                <span className="text-gray-500 dark:text-gray-300 text-sm">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-blue-500 mt-0.5" />
                <span className="text-gray-500 dark:text-gray-300 text-sm">
                  123 Cloud Street<br />
                  San Francisco, CA 94103
                </span>
              </div>
            </div>
          </div>
          
          {/* Newsletter */}
          <div className="flex flex-col space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Stay Updated</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Subscribe to receive updates on cloud pricing and new features.
            </p>
            <div className="flex mt-2">
              <input
                type="email"
                placeholder="Your email"
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-l-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm flex-grow focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-r-lg text-sm font-medium hover:opacity-90 transition-opacity">
                Subscribe
              </button>
            </div>
          </div>
        </div>
        
        {/* Bottom section */}
        <div className="pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            &copy; {currentYear} CloudPrice. All rights reserved.
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm">Privacy Policy</a>
            <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm">Terms of Service</a>
            <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;