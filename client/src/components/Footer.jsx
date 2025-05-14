import { NavLink } from 'react-router-dom';
import { Cloud, Github, Twitter, Linkedin } from 'lucide-react';
import { NAV_LINKS } from '../lib/constants';

function Footer() {
  return (
    <footer className="bg-white/70 dark:bg-gray-900/80 backdrop-blur-lg border-t border-gray-100 dark:border-gray-800 py-10 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
        {/* Logo and tagline */}
        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="flex items-center space-x-2">
            <Cloud className="h-8 w-8 text-blue-500" />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent select-none">
              CloudPrice
            </span>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">Multi-Cloud Price Intelligence</span>
        </div>
        {/* Quick Links */}
        <div className="flex flex-wrap gap-4 justify-center">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className="text-gray-500 dark:text-gray-300 hover:text-blue-600 dark:hover:text-cyan-400 text-sm font-medium transition-colors"
            >
              {link.name}
            </NavLink>
          ))}
        </div>
        {/* Socials */}
        <div className="flex gap-4">
          <a href="https://github.com/" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-gray-700 transition-colors">
            <Github className="h-5 w-5 text-gray-500 dark:text-gray-300" />
          </a>
          <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-gray-700 transition-colors">
            <Twitter className="h-5 w-5 text-blue-400" />
          </a>
          <a href="https://linkedin.com/" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-gray-700 transition-colors">
            <Linkedin className="h-5 w-5 text-blue-600" />
          </a>
        </div>
      </div>
      <div className="mt-8 text-center text-xs text-gray-400 dark:text-gray-500">
        &copy; {new Date().getFullYear()} CloudPrice. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;