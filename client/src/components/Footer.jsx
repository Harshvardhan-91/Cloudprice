import { NavLink } from 'react-router-dom';
import { Cloud } from 'lucide-react';
import { NAV_LINKS } from '../lib/constants';

function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Cloud className="h-8 w-8 text-blue-500" />
            <span className="text-xl font-bold custom-gradient bg-clip-text text-transparent">
              CloudPrice
            </span>
          </div>
          <div className="flex space-x-4">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className="text-gray-300 hover:text-white"
              >
                {link.name}
              </NavLink>
            ))}
          </div>
        </div>
        <div className="mt-4 text-center text-gray-400">
          &copy; {new Date().getFullYear()} CloudPrice. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;