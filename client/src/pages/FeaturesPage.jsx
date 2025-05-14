import { motion } from 'framer-motion';
import { Cloud, Filter, BarChart, Cpu } from 'lucide-react';

const detailedFeatures = [
  {
    icon: Cloud,
    title: 'Dynamic Price Sync',
    description: 'Automatically fetch and normalize pricing data from AWS, Azure, and GCP every 3–7 days.',
  },
  {
    icon: Filter,
    title: 'Powerful Filters',
    description: 'Filter by provider, region, vCPUs, RAM, GPU, and instance type for tailored results.',
  },
  {
    icon: BarChart,
    title: 'Interactive Charts',
    description: 'Visualize cost vs. performance and region-wise pricing with Recharts.',
  },
  {
    icon: Cpu,
    title: 'Cost Optimization',
    description: 'Sort by cost-per-core or alphabetical order to find the best value.',
  },
];

function FeaturesPage() {
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
          Our Features
        </motion.h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {detailedFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              whileHover={{ scale: 1.04, boxShadow: '0 8px 32px rgba(59,130,246,0.10)' }}
              className="glass-card p-8 rounded-2xl shadow-lg flex flex-col items-center text-center bg-white/60 dark:bg-gray-900/60 backdrop-blur-md border border-gray-100 dark:border-gray-800 transition-all"
            >
              <span className="feature-icon-wrapper mb-4">
                <feature.icon className="h-10 w-10 text-blue-500" />
              </span>
              <h2 className="text-2xl font-semibold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {feature.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-base">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

export default FeaturesPage;