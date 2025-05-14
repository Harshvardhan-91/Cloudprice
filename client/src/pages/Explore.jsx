import { useState } from 'react';
import { motion } from 'framer-motion';
import PriceFilters from '../components/PriceFilters';
import PriceTable from '../components/PriceTable';
import PriceChart from '../components/PriceChart';

// Sample data (replace with API data in Phase 5)
const sampleData = [
  {
    provider: 'AWS',
    region: 'us-east-1',
    vCPUs: 2,
    ram: 8,
    price: 0.1,
    instanceType: 't3.medium',
  },
  {
    provider: 'Azure',
    region: 'eastus',
    vCPUs: 4,
    ram: 16,
    price: 0.2,
    instanceType: 'D4s_v5',
  },
  {
    provider: 'GCP',
    region: 'us-central1',
    vCPUs: 2,
    ram: 7.5,
    price: 0.08,
    instanceType: 'e2-standard-2',
  },
];

function Explore() {
  const [view, setView] = useState('table'); // Toggle between table and chart

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-4xl sm:text-5xl font-bold text-center mb-12"
        >
          Compare Cloud Prices
        </motion.h1>
        <PriceFilters />
        <div className="flex justify-center mb-6">
          <button
            onClick={() => setView('table')}
            className={`px-4 py-2 mx-2 rounded-lg ${
              view === 'table' ? 'custom-gradient text-white' : 'bg-gray-200'
            }`}
          >
            Table View
          </button>
          <button
            onClick={() => setView('chart')}
            className={`px-4 py-2 mx-2 rounded-lg ${
              view === 'chart' ? 'custom-gradient text-white' : 'bg-gray-200'
            }`}
          >
            Chart View
          </button>
        </div>
        {view === 'table' ? (
          <PriceTable data={sampleData} />
        ) : (
          <PriceChart data={sampleData} />
        )}
      </div>
    </section>
  );
}

export default Explore;