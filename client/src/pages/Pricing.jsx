import { motion } from 'framer-motion';
import { CheckCircle, Star, Shield } from 'lucide-react';

const tiers = [
  {
    name: 'Basic',
    price: '$9/mo',
    features: ['Access to 1 provider', 'Basic filtering', 'Email support'],
    icon: CheckCircle,
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$29/mo',
    features: ['All providers', 'Advanced filtering', 'Chart visualizations', 'Priority support'],
    icon: Star,
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    features: ['All Pro features', 'API access', 'Dedicated support', 'Custom integrations'],
    icon: Shield,
    highlight: false,
  },
];

function Pricing() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="py-20 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-4xl sm:text-5xl font-bold text-center mb-12 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
        >
          Pricing Plans
        </motion.h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              whileHover={{ scale: 1.04, boxShadow: '0 8px 32px rgba(59,130,246,0.10)' }}
              className={`glass-card p-8 rounded-2xl shadow-lg border transition-all flex flex-col items-center text-center bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border-gray-100 dark:border-gray-800 ${tier.highlight ? 'ring-2 ring-blue-400 dark:ring-cyan-400 scale-105' : ''}`}
            >
              <span className="mb-4">
                <tier.icon className={`h-10 w-10 ${tier.highlight ? 'text-blue-500 dark:text-cyan-400' : 'text-gray-400 dark:text-gray-500'}`} />
              </span>
              <h2 className="text-2xl font-semibold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {tier.name}
              </h2>
              <p className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">{tier.price}</p>
              <ul className="space-y-2 mb-6">
                {tier.features.map((feature, i) => (
                  <li key={i} className="text-gray-600 dark:text-gray-300 flex items-center gap-2 justify-center">
                    <CheckCircle className="h-4 w-4 text-blue-400" /> {feature}
                  </li>
                ))}
              </ul>
              <button className="custom-gradient btn-3d text-white font-semibold py-2 px-6 rounded-lg w-full shadow-md hover:shadow-xl transition-all text-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2">
                Choose Plan
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

export default Pricing;