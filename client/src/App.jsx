import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import FeaturesPage from './pages/FeaturesPage';
import Pricing from './pages/Pricing';
import Contact from './pages/Contact';
import Explore from './pages/Explore'; // New

function App() {
  return (
    <div className="min-h-screen flex flex-col relative bg-gray-50 dark:bg-gray-950 overflow-x-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 -z-10">
        <div className="w-full h-full bg-gradient-to-br from-blue-50 via-white to-purple-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 opacity-80" />
        <div className="absolute inset-0 grid-pattern pointer-events-none opacity-10" />
      </div>
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} /> {/* New */}
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;