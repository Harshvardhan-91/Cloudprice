import { motion } from 'framer-motion';
import { Cloud, Filter, BarChart } from 'lucide-react';

const features = [
  {
    icon: Cloud,
    title: 'Multi-Cloud Sync',
    description: 'Fetch and compare prices from AWS, Azure, and GCP in real-time.',
  },
  {
    icon: Filter,
    title: 'Advanced Filtering',
    description: 'Filter by region, vCPUs, RAM, and more for precise results.',
  },
  {
    icon: BarChart,
    title: 'Visual Insights',
    description: 'Visualize pricing trends with interactive charts and tables.',
  },
];

function Features() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-3xl sm:text-4xl font-bold text-center mb-12"
        >
          Why Choose CloudPrice?
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <feature.icon className="h-12 w-12 text-blue-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;