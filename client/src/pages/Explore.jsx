
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Table, BarChart2, Sliders, Search, RefreshCw, AlertCircle } from 'lucide-react';
import PriceFilters from '../components/PriceFilters';
import PriceTable from '../components/PriceTable';
import PriceChart from '../components/PriceChart';
import { fetchInstances } from '../api';

const PROVIDERS = [
  { id: 'aws', name: 'AWS' },
  { id: 'azure', name: 'Azure' },
  { id: 'gcp', name: 'GCP' },
];

function Explore() {
  const [view, setView] = useState('table');
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('price');
  const [sortOrder, setSortOrder] = useState('asc');
  const [provider, setProvider] = useState('gcp');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const toggleFilter = () => setIsFilterOpen(!isFilterOpen);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchInstances(provider);
      setData(res.data || []);
      if (res.data.length === 0) {
        setError(`No ${provider.toUpperCase()} instances found. Try refreshing the data.`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [provider]);

  return (
    <section className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Cloud Instance Explorer
          </h1>
          <p className="text-lg text-gray-600">
            Compare VM prices across major cloud providers and find the best fit for your workload.
          </p>
        </motion.div>

        {/* Provider Selector */}
        <div className="mb-6 flex justify-end">
          <select
            value={provider}
            onChange={e => setProvider(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {PROVIDERS.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Search and Controls */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search instances..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleFilter}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <Sliders className="h-5 w-5" />
                {isFilterOpen ? 'Hide Filters' : 'Show Filters'}
              </button>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="price">Price</option>
                <option value="costPerCore">Cost per Core</option>
                <option value="costPerGB">Cost per GB</option>
                <option value="vCPUs">vCPUs</option>
                <option value="ram">RAM</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 text-gray-700 hover:text-blue-600 transition-colors"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <PriceFilters />
            </motion.div>
          )}
        </AnimatePresence>

        {/* View Toggle */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex rounded-lg border border-gray-200 p-1 bg-white">
            <button
              onClick={() => setView('table')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                view === 'table'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              <Table className="h-5 w-5" />
              Table
            </button>
            <button
              onClick={() => setView('chart')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                view === 'chart'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              <BarChart2 className="h-5 w-5" />
              Charts
            </button>
          </div>
        </div>

        {/* Data Display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {loading ? (
              <div className="text-center py-10 text-gray-500">
                Loading {provider.toUpperCase()} instances...
              </div>
            ) : error ? (
              <div className="text-center py-10 text-red-500 flex flex-col items-center gap-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-6 w-6" />
                  <span>{error}</span>
                </div>
                <button
                  onClick={fetchData}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : data.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                No instances found for {provider.toUpperCase()}
              </div>
            ) : view === 'table' ? (
              <PriceTable data={data} />
            ) : (
              <PriceChart data={data} />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Last Updated */}
        <div className="mt-6 text-center text-sm text-gray-500 flex items-center justify-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>
    </section>
  );
}

export default Explore;