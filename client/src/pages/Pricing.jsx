import { motion } from 'framer-motion';

const tiers = [
  {
    name: 'Basic',
    price: '$9/mo',
    features: ['Access to 1 provider', 'Basic filtering', 'Email support'],
  },
  {
    name: 'Pro',
    price: '$29/mo',
    features: ['All providers', 'Advanced filtering', 'Chart visualizations', 'Priority support'],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    features: ['All Pro features', 'API access', 'Dedicated support', 'Custom integrations'],
  },
];

function Pricing() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-4xl sm:text-5xl font-bold text-center mb-12"
        >
          Pricing Plans
        </motion.h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="bg-white/80 backdrop-blur-md p-6 rounded-lg shadow-md border border-gray-200"
            >
              <h2 className="text-2xl font-semibold mb-4">{tier.name}</h2>
              <p className="text-3xl font-bold mb-6">{tier.price}</p>
              <ul className="space-y-2 mb-6">
                {tier.features.map((feature, i) => (
                  <li key={i} className="text-gray-600">• {feature}</li>
                ))}
              </ul>
              <button className="custom-gradient text-white font-semibold py-2 px-4 rounded-lg w-full">
                Choose Plan
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Pricing;