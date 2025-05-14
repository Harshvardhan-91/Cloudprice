import { useState } from 'react';
import { motion } from 'framer-motion';
import { Filter } from 'lucide-react';

function PriceFilters() {
  const [provider, setProvider] = useState('');
  const [region, setRegion] = useState('');
  const [vCPUs, setVCPUs] = useState([1, 16]);
  const [ram, setRam] = useState([1, 64]);
  const [gpu, setGpu] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white p-6 rounded-lg shadow-md mb-8"
    >
      <div className="flex items-center space-x-2 mb-4">
        <Filter className="h-6 w-6 text-blue-500" />
        <h2 className="text-xl font-semibold">Filter Instances</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Provider</label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          >
            <option value="">All Providers</option>
            <option value="AWS">AWS</option>
            <option value="Azure">Azure</option>
            <option value="GCP">GCP</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Region</label>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          >
            <option value="">All Regions</option>
            <option value="us-east-1">US East (AWS)</option>
            <option value="eastus">East US (Azure)</option>
            <option value="us-central1">US Central (GCP)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">GPU</label>
          <input
            type="checkbox"
            checked={gpu}
            onChange={() => setGpu(!gpu)}
            className="mt-2 h-4 w-4 text-blue-600"
          />
          <span className="ml-2 text-gray-600">Include GPU</span>
        </div>
      </div>
      {/* Add sliders for vCPUs and RAM in Phase 5 */}
    </motion.div>
  );
}

export default PriceFilters;