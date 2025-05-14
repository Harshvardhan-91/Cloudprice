import { motion } from 'framer-motion';
import Button from './Button';

function CTA() {
  return (
    <section className="py-16 bg-blue-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-3xl sm:text-4xl font-bold mb-6"
        >
          Ready to Optimize Your Cloud Costs?
        </motion.h2>
        <Button text="Explore Now" to="/features" />
      </div>
    </section>
  );
}

export default CTA;