import { motion } from 'framer-motion';
import Button from './Button';
import { ArrowRightCircle } from 'lucide-react';

function CTA() {
  return (
    <section className="relative py-20 bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-600 text-white overflow-hidden">
      {/* Animated gradient blobs */}
      <motion.div
        className="absolute -top-20 -left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"
        animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute -bottom-20 -right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"
        animate={{ x: [0, -40, 0], y: [0, -30, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
      />
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-5xl font-bold mb-6 drop-shadow-lg"
        >
          Ready to Optimize Your Cloud Costs?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-lg sm:text-2xl mb-10 text-white/90"
        >
          Discover the best VM pricing across AWS, Azure, and GCP. Start saving today with CloudPrice.
        </motion.p>
        <Button text="Explore Now" to="/features" icon={<ArrowRightCircle className='ml-2 h-6 w-6' />} />
      </div>
    </section>
  );
}

export default CTA;