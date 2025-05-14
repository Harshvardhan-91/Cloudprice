import { motion } from 'framer-motion';
import { BarChart } from 'lucide-react';

function PriceChart({ data }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white p-6 rounded-lg shadow-md text-center"
    >
      <BarChart className="h-12 w-12 text-blue-500 mx-auto mb-4" />
      <p className="text-gray-600">Charts coming soon (Recharts in Phase 6)!</p>
      <p className="text-sm text-gray-500 mt-2">Will display cost vs. vCPUs and region-wise comparisons.</p>
    </motion.div>
  );
}

export default PriceChart;