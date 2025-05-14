import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Table, 
  BarChart2, 
  Sliders, 
  Search, 
  RefreshCw, 
  AlertCircle, 
  ArrowUp, 
  ArrowDown, 
  CloudLightning, 
  Filter, 
  Clock,
  Database
} from 'lucide-react';
import PriceFilters from '../components/PriceFilters';
import PriceTable from '../components/PriceTable';
import PriceChart from '../components/PriceChart';
import { fetchInstances } from '../api';

const PROVIDERS = [
  { id: 'aws', name: 'AWS', color: '#FF9900' },
  { id: 'azure', name: 'Azure', color: '#0078D4' },
  { id: 'gcp', name: 'GCP', color: '#4285F4' },
];

const providerIcons = {
  aws: "⟁", // Custom cloud symbol for AWS
  azure: "☁", // Cloud symbol for Azure
  gcp: "◍", // Circle dot symbol for GCP
};

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
  const [filters, setFilters] = useState({
    providers: [],
    regions: [],
    vCPUs: [1, 16],
    ram: [1, 64],
    gpu: false,
    instanceTypes: [],
  });

  const toggleFilter = () => setIsFilterOpen(!isFilterOpen);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchInstances(provider);
      const transformedData = (res.data || []).map(item => ({
        provider: item.provider.toUpperCase(),
        region: item.region,
        vCPUs: item.specs.vCPUs,
        ram: item.specs.memory,
        price: item.pricing.onDemand,
        costPerCore: item.pricing.onDemand / item.specs.vCPUs,
        costPerGB: item.pricing.onDemand / item.specs.memory,
        instanceType: item.instanceType,
        specs: item.specs,
      }));
      setData(transformedData);
      if (res.data.length === 0) {
        setError(`No instances found for ${provider.toUpperCase()}.`);
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

  // Apply filters and search
  const filteredData = data.filter(item => {
    const matchesProvider = filters.providers.length === 0 || filters.providers.includes(item.provider.toLowerCase());
    const matchesRegion = filters.regions.length === 0 || filters.regions.includes(item.region);
    const matchesVCPUs = item.vCPUs >= filters.vCPUs[0] && item.vCPUs <= filters.vCPUs[1];
    const matchesRam = item.ram >= filters.ram[0] && item.ram <= filters.ram[1];
    const matchesGpu = !filters.gpu || item.specs.gpu;
    const matchesInstanceType = filters.instanceTypes.length === 0 || filters.instanceTypes.some(type => item.instanceType.includes(type));
    const matchesSearch = searchQuery === '' || 
      item.instanceType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.region.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesProvider && matchesRegion && matchesVCPUs && matchesRam && matchesGpu && matchesInstanceType && matchesSearch;
  });

  // Apply sorting
  const sortedData = [...filteredData].sort((a, b) => {
    const aValue = a[sortBy] || 0;
    const bValue = b[sortBy] || 0;
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    }
    return aValue < bValue ? 1 : -1;
  });
  
  // Get current provider color
  const currentProviderColor = PROVIDERS.find(p => p.id === provider)?.color || '#4285F4';

  return (
    <section className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <div className="inline-flex items-center justify-center mb-3">
            <CloudLightning 
              className="h-10 w-10 mr-3" 
              style={{ color: currentProviderColor }}
            />
            <h1 className="text-4xl font-extrabold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              Cloud Instance Explorer
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Compare VM prices across major cloud providers and find the best fit for your workload.
          </p>
        </motion.div>

        {/* Provider Selector */}
        <div className="mb-8 flex justify-center">
          <div className="inline-flex rounded-xl shadow-md overflow-hidden bg-white">
            {PROVIDERS.map(p => (
              <button
                key={p.id}
                onClick={() => setProvider(p.id)}
                className={`px-6 py-3 flex items-center justify-center transition-all duration-300 ${
                  provider === p.id 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-700 text-white font-medium' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
                style={provider === p.id ? { boxShadow: `0 4px 14px rgba(0, 0, 0, 0.1)` } : {}}
              >
                <span className="text-xl mr-2" style={{ color: provider === p.id ? 'white' : p.color }}>
                  {providerIcons[p.id]}
                </span>
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Search and Controls */}
        <motion.div 
          className="bg-white rounded-2xl shadow-lg p-5 mb-6 border border-gray-100"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full md:w-auto relative group">
              <div className="absolute inset-0 bg-blue-100 opacity-0 rounded-lg filter blur-md group-hover:opacity-30 transition-opacity duration-300"></div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-500 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search instances, regions, or providers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 hover:shadow"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4 flex-wrap justify-center">
              <button
                onClick={toggleFilter}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                  isFilterOpen 
                    ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                    : 'text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <Filter className="h-5 w-5" />
                {isFilterOpen ? 'Hide Filters' : 'Show Filters'}
              </button>
              
              <div className="flex items-center rounded-xl border border-gray-200 overflow-hidden bg-white">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2.5 focus:outline-none text-gray-700 border-r border-gray-200"
                >
                  <option value="price">Sort by Price</option>
                  <option value="costPerCore">Sort by Cost/Core</option>
                  <option value="costPerGB">Sort by Cost/GB</option>
                  <option value="vCPUs">Sort by vCPUs</option>
                  <option value="ram">Sort by RAM</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                  aria-label={sortOrder === 'asc' ? 'Sort ascending' : 'Sort descending'}
                >
                  {sortOrder === 'asc' ? 
                    <ArrowUp className="h-5 w-5 text-blue-500" /> : 
                    <ArrowDown className="h-5 w-5 text-blue-500" />
                  }
                </button>
              </div>
            </div>
          </div>
        </motion.div>

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
              <div className="bg-white rounded-2xl shadow-lg p-5 mb-6 border border-gray-100">
                <PriceFilters filters={filters} setFilters={setFilters} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* View Toggle */}
        <motion.div 
          className="flex justify-center mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="inline-flex rounded-xl overflow-hidden border border-gray-200 p-1 bg-white shadow-md">
            <button
              onClick={() => setView('table')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg transition-all duration-200 ${
                view === 'table'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Table className="h-5 w-5" />
              Table View
            </button>
            <button
              onClick={() => setView('chart')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg transition-all duration-200 ${
                view === 'chart'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <BarChart2 className="h-5 w-5" />
              Chart View
            </button>
          </div>
        </motion.div>

        {/* Data Display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100"
          >
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                <div className="relative w-16 h-16 mb-4">
                  <motion.div 
                    className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                </div>
                <p className="text-lg font-medium">Loading {provider.toUpperCase()} instances...</p>
                <p className="text-sm text-gray-400 mt-2">Fetching the latest pricing data</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                <div className="bg-orange-50 rounded-full p-3 mb-4 text-orange-500">
                  <AlertCircle className="h-8 w-8" />
                </div>
                <p className="text-lg font-medium text-orange-600">{error}</p>
                <p className="text-sm text-gray-500 mt-1 mb-4">Unable to fetch the requested data</p>
                <button
                  onClick={fetchData}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                >
                  <RefreshCw className="h-5 w-5" />
                  Refresh Data
                </button>
              </div>
            ) : sortedData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                <div className="bg-gray-50 rounded-full p-3 mb-4">
                  <Database className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-lg font-medium">No instances found</p>
                <p className="text-sm text-gray-500 mt-1">Try adjusting your filters or search criteria</p>
              </div>
            ) : view === 'table' ? (
              <div className="p-4">
                <PriceTable data={sortedData} sortBy={sortBy} sortOrder={sortOrder} />
              </div>
            ) : (
              <div className="p-4">
                <PriceChart data={sortedData} />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Data Stats & Last Updated */}
        {!loading && !error && sortedData.length > 0 && (
          <motion.div 
            className="mt-6 py-3 px-4 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center justify-between text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center text-gray-600 mb-2 sm:mb-0">
              <Database className="h-4 w-4 mr-2 text-blue-500" />
              <span>Showing <strong>{sortedData.length}</strong> of <strong>{data.length}</strong> instances</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Clock className="h-4 w-4 mr-2 text-blue-500" />
              <span>Last updated: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</span>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}

export default Explore;