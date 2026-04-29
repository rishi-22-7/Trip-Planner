/*
  Footer.jsx – Simple site-wide footer.
  Renders brand info and a few quick links.
  Displayed on public-facing pages (Home, Destinations).
*/
import { Link } from 'react-router-dom';
import { Plane } from 'lucide-react';

const Footer = () => (
  <footer className="bg-white border-t border-slate-200 mt-auto">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">

        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <Plane className="w-3.5 h-3.5 text-white" strokeWidth={2} />
          </div>
          <span className="font-bold text-slate-900">Trip Planner</span>
        </div>

        {/* Links */}
        <nav className="flex items-center gap-6 text-sm text-slate-500">
          <Link to="/"             className="hover:text-blue-600 transition-colors">Home</Link>
          <Link to="/destinations" className="hover:text-blue-600 transition-colors">Destinations</Link>
          <Link to="/login"        className="hover:text-blue-600 transition-colors">Login</Link>
          <Link to="/register"     className="hover:text-blue-600 transition-colors">Register</Link>
        </nav>
      </div>

      <p className="text-center text-xs text-slate-400 mt-6">
        © {new Date().getFullYear()} Trip Planner. Built with React + Express + MongoDB.
      </p>
    </div>
  </footer>
);

export default Footer;
