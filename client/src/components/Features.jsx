
import { motion } from 'framer-motion';
import { Cloud, Filter, BarChart, Zap, Monitor } from 'lucide-react';

const features = [
  {
    icon: Cloud,
    title: 'Multi-Cloud Sync',
    description: 'Fetch and compare prices from AWS, Azure, and GCP in real-time.',
    color: 'from-blue-500 to-blue-600'
  },
  {
    icon: Filter,
    title: 'Advanced Filtering',
    description: 'Filter by region, vCPUs, RAM, and more for precise results.',
    color: 'from-purple-500 to-purple-600'
  },
  {
    icon: BarChart,
    title: 'Visual Insights',
    description: 'Visualize pricing trends with interactive charts and tables.',
    color: 'from-cyan-500 to-cyan-600'
  },
  {
    icon: Zap,
    title: 'Cost Optimization',
    description: 'Find the most cost-effective options for your specific needs.',
    color: 'from-green-500 to-green-600'
  },
  {
    icon: Monitor,
    title: 'Real-time Updates',
    description: 'Stay current with auto-refreshed pricing data every 3-7 days.',
    color: 'from-amber-500 to-amber-600'
  },
];

// Container variants
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15
    }
  }
};

// Item variants
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

function Features() {
  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent inline-block">
            Why Choose CloudPrice?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-lg">
            Powerful tools to help you make informed decisions about your cloud infrastructure costs.
          </p>
        </motion.div>
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.slice(0, 3).map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
            >
              <div className="h-2 bg-gradient-to-r w-full ${feature.color}"></div>
              <div className="p-8">
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-700 p-4 rounded-xl mb-6 inline-flex group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className={`h-8 w-8 text-gradient bg-gradient-to-r ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                <div className="mt-6 flex">
                  <div className="h-1 w-12 bg-gradient-to-r ${feature.color} rounded-full"></div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default Features;