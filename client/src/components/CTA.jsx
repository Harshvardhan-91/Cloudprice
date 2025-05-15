import { motion } from 'framer-motion';
import { ArrowRightCircle, TrendingUp, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

function CTA() {
  return (
    <section className="relative py-24 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 text-white overflow-hidden">
      {/* Animated floating elements with more subtle colors */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-20 -left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl"
          animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute -bottom-20 -right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl"
          animate={{ x: [0, -40, 0], y: [0, -30, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute top-1/4 right-1/4 w-64 h-64 bg-white/3 rounded-full blur-2xl"
          animate={{ x: [0, 60, 0], y: [0, -40, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        />
      </div>
      
      {/* Main content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="flex flex-col items-center"
        >
          <motion.div 
            className="inline-flex items-center mb-6 px-4 py-2 rounded-full bg-slate-600/50 backdrop-blur-md text-sm font-medium"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            <span>Prices updated every 3-7 days</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 drop-shadow-lg"
          >
            Ready to Optimize Your Cloud Costs?
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-lg sm:text-2xl mb-10 text-white/90 max-w-3xl"
          >
            Discover the best VM pricing across AWS, Azure, and GCP. Start saving today with CloudPrice.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link 
              to="/features"
              className="px-8 py-4 rounded-xl bg-slate-100 text-slate-800 font-semibold text-lg hover:bg-slate-200 transition-all flex items-center shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              Explore Now <ArrowRightCircle className='ml-2 h-5 w-5' />
            </Link>
            
            <Link 
              to="/pricing"
              className="px-8 py-4 rounded-xl bg-slate-700 text-white font-semibold text-lg hover:bg-slate-600 transition-all flex items-center border border-slate-500"
            >
              View Pricing <TrendingUp className='ml-2 h-5 w-5' />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export default CTA;