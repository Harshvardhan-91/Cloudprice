import { motion } from 'framer-motion';
import { Cloud, Filter, BarChart, Cpu, Globe, Clock, Database, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const detailedFeatures = [
  {
    icon: Cloud,
    title: 'Dynamic Price Sync',
    description: 'Automatically fetch and normalize pricing data from AWS, Azure, and GCP every 3–7 days.',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20'
  },
  {
    icon: Filter,
    title: 'Powerful Filters',
    description: 'Filter by provider, region, vCPUs, RAM, GPU, and instance type for tailored results.',
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20'
  },
  {
    icon: BarChart,
    title: 'Interactive Charts',
    description: 'Visualize cost vs. performance and region-wise pricing with Recharts.',
    color: 'from-cyan-500 to-cyan-600',
    bgColor: 'bg-cyan-50 dark:bg-cyan-900/20'
  },
  {
    icon: Cpu,
    title: 'Cost Optimization',
    description: 'Sort by cost-per-core or alphabetical order to find the best value.',
    color: 'from-amber-500 to-amber-600',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20'
  },
  {
    icon: Globe,
    title: 'Region Analysis',
    description: 'Compare prices across all global regions to find the most cost-effective locations.',
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-50 dark:bg-green-900/20'
  },
  {
    icon: Clock,
    title: 'Up-to-date Data',
    description: 'All pricing information is regularly refreshed to ensure accuracy in decision making.',
    color: 'from-red-500 to-red-600',
    bgColor: 'bg-red-50 dark:bg-red-900/20'
  },
  {
    icon: Database,
    title: 'Comprehensive Coverage',
    description: 'Access data on all instance types across major cloud providers in one place.',
    color: 'from-indigo-500 to-indigo-600',
    bgColor: 'bg-indigo-50 dark:bg-indigo-900/20'
  },
  {
    icon: Shield,
    title: 'Secure Platform',
    description: 'Enterprise-grade security ensures your data and preferences are protected.',
    color: 'from-teal-500 to-teal-600',
    bgColor: 'bg-teal-50 dark:bg-teal-900/20'
  }
];

// Animation variants
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1.0]
    } 
  }
};

function FeaturesPage() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
      className="py-24 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 min-h-screen"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-1.5 text-sm text-white rounded-full">
              CloudPrice Features
            </span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-center mt-12 mb-20"
        >
          <h1 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent inline-block">
            Powerful Features For Smart Cloud Decisions
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-lg">
            CloudPrice offers a comprehensive suite of tools designed to help you navigate the complex 
            world of cloud pricing and find the perfect solution for your needs.
          </p>
          <div className="mt-10">
            <Link
              to="/pricing"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 hover:shadow-lg"
            >
              View Pricing Plans
            </Link>
          </div>
        </motion.div>
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {detailedFeatures.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ 
                scale: 1.03,
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
              }}
              transition={{ duration: 0.2 }}
              className="glass-card p-8 rounded-2xl shadow-lg flex flex-col items-center text-center bg-white/60 dark:bg-gray-900/60 backdrop-blur-md border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-900 transition-all overflow-hidden"
            >
              <div className={`feature-icon-wrapper mb-6 p-4 rounded-2xl ${feature.bgColor}`}>
                <feature.icon className={`h-8 w-8 text-gradient bg-gradient-to-r ${feature.color}`} />
              </div>
              <h2 className="text-xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {feature.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>
              <div className="mt-6 w-full">
                <div className={`h-1 w-12 mx-auto rounded-full bg-gradient-to-r ${feature.color}`}></div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700 max-w-3xl mx-auto"
          >
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Ready to Experience CloudPrice?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Join thousands of companies making smarter cloud infrastructure decisions.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/pricing"
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:shadow-lg transition-all"
              >
                Get Started
              </Link>
              <Link
                to="/contact"
                className="px-6 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
              >
                Contact Sales
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}

export default FeaturesPage;