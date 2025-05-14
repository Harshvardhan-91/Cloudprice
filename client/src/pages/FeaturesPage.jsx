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
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-4xl sm:text-5xl font-bold text-center mb-12"
        >
          Our Features
        </motion.h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {detailedFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <feature.icon className="h-10 w-10 text-blue-500 mb-4" />
              <h2 className="text-2xl font-semibold mb-2">{feature.title}</h2>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturesPage;