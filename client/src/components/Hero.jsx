import { motion } from 'framer-motion';
import { Cloud } from 'lucide-react';
import Button from './Button';

function Hero() {
  return (
    <section className="relative custom-gradient text-white py-20">
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Cloud className="h-16 w-16 mx-auto mb-4" />
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
            Compare Cloud Prices Instantly
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Discover the best VM pricing across AWS, Azure, and GCP with our intelligent comparison tool.
          </p>
          <Button text="Explore Prices" to="/explore" /> {/* Updated */}
        </motion.div>
      </div>
    </section>
  );
}

export default Hero;