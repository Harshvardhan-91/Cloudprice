import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Table, 
  BarChart2, 
  Search, 
  RefreshCw, 
  AlertCircle, 
  ArrowUp, 
  ArrowDown, 
  CloudLightning, 
  Filter, 
  Clock,
  Database,
  Cpu,
  MemoryStick,
  Globe,
  DollarSign,
  Layers,
  Activity
} from 'lucide-react';
import PriceFilters from '../components/PriceFilters';
import PriceTable from '../components/PriceTable';
import PriceChart from '../components/PriceChart';
import { fetchInstances } from '../api';

const PROVIDERS = [
  { id: 'aws', name: 'AWS', color: '#FF9900', gradient: 'from-amber-400 to-orange-500' },
  { id: 'azure', name: 'Azure', color: '#0078D4', gradient: 'from-blue-400 to-blue-600' },
  { id: 'gcp', name: 'GCP', color: '#4285F4', gradient: 'from-blue-500 to-indigo-500' },
];

const providerLogos = {
  aws: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M7.5 13.5h2.25v-1.5H7.5v1.5zm0-3h2.25V9H7.5v1.5zm9 9c-3.375 0-6.375-1.125-8.625-3.375l-.75.75C9.75 19.5 13.125 21 16.5 21s6.75-1.5 9.375-4.125l-.75-.75C22.875 18.375 19.875 19.5 16.5 19.5zM7.5 16.5h2.25v-1.5H7.5v1.5zm9-15c-4.125 0-7.5 3.375-7.5 7.5v3c0 4.125 3.375 7.5 7.5 7.5s7.5-3.375 7.5-7.5v-3c0-4.125-3.375-7.5-7.5-7.5zm6 10.5c0 3.375-2.625 6-6 6s-6-2.625-6-6v-3c0-3.375 2.625-6 6-6s6 2.625 6 6v3z" />
    </svg>
  ),
  azure: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13.05 4.24L6.56 18.05L2 18L7.09 9.24L13.05 4.24ZM13.75 5.33L22 19.76H6.74L16.04 18.1L13.75 5.33Z" />
    </svg>
  ),
  gcp: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3L4 15.5L12 21L20 15.5L12 3ZM8.5 13.5L12 7.78L15.5 13.5H8.5Z" />
    </svg>
  ),
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
  
  const currentProvider = PROVIDERS.find(p => p.id === provider) || PROVIDERS[0];

  // Get key stats
  const getStats = () => {
    if (!sortedData.length) return null;
    
    const avgPrice = sortedData.reduce((sum, item) => sum + item.price, 0) / sortedData.length;
    const minPrice = Math.min(...sortedData.map(item => item.price));
    const maxPrice = Math.max(...sortedData.map(item => item.price));
    const totalInstances = sortedData.length;
    
    return { avgPrice, minPrice, maxPrice, totalInstances };
  };
  
  const stats = getStats();

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-64 overflow-hidden -z-10">
        <div className={`absolute inset-0 bg-gradient-to-r ${currentProvider.gradient} opacity-5`}></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header with Cloud Animation */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-8 text-center relative"
        >
          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 opacity-20 w-full">
            <motion.div 
              className="flex justify-center"
              animate={{ x: [10, -10, 10] }}
              transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
            >
              {[...Array(5)].map((_, i) => (
                <motion.div 
                  key={i}
                  className="cloud-shape bg-blue-100 mx-2"
                  animate={{ 
                    y: [0, i % 2 ? -10 : 10, 0],
                    scale: [1, i % 2 ? 1.05 : 0.95, 1]
                  }}
                  transition={{ repeat: Infinity, duration: 5 + i, ease: "easeInOut" }}
                  style={{ 
                    width: 100 + Math.random() * 50,
                    height: 40 + Math.random() * 20,
                    borderRadius: '50%' 
                  }}
                />
              ))}
            </motion.div>
          </div>

          <div className="relative z-10">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="inline-flex items-center justify-center mb-3"
            >
              <div className={`p-3 rounded-2xl bg-gradient-to-br ${currentProvider.gradient} text-white shadow-lg mr-4`}>
                <CloudLightning className="h-8 w-8" />
              </div>
              <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900">
                Cloud <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Explorer</span>
              </h1>
            </motion.div>
            <motion.p 
              className="text-lg text-slate-600 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.7 }}
            >
              Find the perfect VM instance across major cloud providers with real-time pricing insights.
            </motion.p>
          </div>
        </motion.div>

        {/* Provider Selector - Enhanced */}
        <motion.div 
          className="mb-8 flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="inline-flex p-1.5 rounded-2xl shadow-xl bg-white border border-slate-100">
            {PROVIDERS.map(p => (
              <motion.button
                key={p.id}
                onClick={() => setProvider(p.id)}
                className={`px-6 py-3.5 flex items-center justify-center rounded-xl transition-all duration-300 ${
                  provider === p.id 
                    ? `bg-gradient-to-r ${p.gradient} text-white font-medium shadow-lg` 
                    : 'bg-white text-slate-700 hover:bg-slate-50'
                }`}
                whileHover={{ scale: provider !== p.id ? 1.02 : 1 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="mr-2.5" style={{ color: provider === p.id ? 'white' : p.color }}>
                  {providerLogos[p.id]}
                </span>
                <span className="font-medium">{p.name}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Stats Cards - New! */}
        {!loading && !error && stats && (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="bg-white rounded-2xl p-5 shadow-md border border-slate-100">
              <div className="flex items-center mb-2">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-500 mr-3">
                  <DollarSign className="h-5 w-5" />
                </div>
                <h3 className="text-slate-500 font-medium">Avg Price/hr</h3>
              </div>
              <p className="text-2xl font-bold text-slate-800">${stats.avgPrice.toFixed(4)}</p>
            </div>
            
            <div className="bg-white rounded-2xl p-5 shadow-md border border-slate-100">
              <div className="flex items-center mb-2">
                <div className="p-2 rounded-lg bg-green-50 text-green-500 mr-3">
                  <Activity className="h-5 w-5" />
                </div>
                <h3 className="text-slate-500 font-medium">Price Range</h3>
              </div>
              <p className="text-2xl font-bold text-slate-800">
                ${stats.minPrice.toFixed(4)} - ${stats.maxPrice.toFixed(4)}
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-5 shadow-md border border-slate-100">
              <div className="flex items-center mb-2">
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-500 mr-3">
                  <Layers className="h-5 w-5" />
                </div>
                <h3 className="text-slate-500 font-medium">Instances</h3>
              </div>
              <p className="text-2xl font-bold text-slate-800">
                {sortedData.length} <span className="text-sm font-normal text-slate-500">of {data.length}</span>
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-5 shadow-md border border-slate-100">
              <div className="flex items-center mb-2">
                <div className="p-2 rounded-lg bg-amber-50 text-amber-500 mr-3">
                  <Clock className="h-5 w-5" />
                </div>
                <h3 className="text-slate-500 font-medium">Last Updated</h3>
              </div>
              <p className="text-slate-800 font-medium">
                {new Date().toLocaleDateString()}
              </p>
            </div>
          </motion.div>
        )}

        {/* Search and Controls */}
        <motion.div 
          className="bg-white rounded-2xl shadow-lg p-5 mb-6 border border-slate-100"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full md:w-auto relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <Search className="text-blue-500 h-5 w-5" />
              </div>
              <input
                type="text"
                placeholder="Search instances, regions, or providers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 hover:shadow"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-4 flex-wrap justify-center">
              <motion.button
                onClick={toggleFilter}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all duration-200 ${
                  isFilterOpen 
                    ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                    : 'text-slate-700 hover:bg-slate-50 border border-slate-200'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Filter className="h-5 w-5" />
                {isFilterOpen ? 'Hide Filters' : 'Show Filters'}
              </motion.button>
              
              <div className="flex items-center rounded-xl border border-slate-200 overflow-hidden bg-white">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 focus:outline-none text-slate-700 border-r border-slate-200"
                >
                  <option value="price">Sort by Price</option>
                  <option value="costPerCore">Sort by Cost/Core</option>
                  <option value="costPerGB">Sort by Cost/GB</option>
                  <option value="vCPUs">Sort by vCPUs</option>
                  <option value="ram">Sort by RAM</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-4 py-3 text-slate-700 hover:bg-slate-50 transition-colors flex items-center"
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
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-slate-100">
                <PriceFilters filters={filters} setFilters={setFilters} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* View Toggle - Enhanced */}
        <motion.div 
          className="flex justify-center mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="inline-flex rounded-xl overflow-hidden border border-slate-200 p-1.5 bg-white shadow-lg">
            <motion.button
              onClick={() => setView('table')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-300 ${
                view === 'table'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
              whileHover={{ scale: view !== 'table' ? 1.02 : 1 }}
              whileTap={{ scale: 0.98 }}
            >
              <Table className="h-5 w-5" />
              <span className="font-medium">Table View</span>
            </motion.button>
            <motion.button
              onClick={() => setView('chart')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-300 ${
                view === 'chart'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
              whileHover={{ scale: view !== 'chart' ? 1.02 : 1 }}
              whileTap={{ scale: 0.98 }}
            >
              <BarChart2 className="h-5 w-5" />
              <span className="font-medium">Chart View</span>
            </motion.button>
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
            className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100"
          >
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                <div className="relative w-16 h-16 mb-6">
                  <svg className="animate-spin h-16 w-16 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-xl font-medium">Loading {provider.toUpperCase()} instances...</p>
                  <p className="text-slate-400 mt-2">Fetching the latest pricing data from all regions</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                <div className="bg-orange-50 rounded-full p-4 mb-6 text-orange-500">
                  <AlertCircle className="h-10 w-10" />
                </div>
                <div className="text-center">
                  <p className="text-xl font-medium text-orange-600">{error}</p>
                  <p className="text-slate-500 mt-2 mb-6">Unable to fetch the requested data</p>
                  <motion.button
                    onClick={fetchData}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <RefreshCw className="h-5 w-5" />
                    <span>Refresh Data</span>
                  </motion.button>
                </div>
              </div>
            ) : sortedData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                <div className="bg-slate-50 rounded-full p-4 mb-6">
                  <Database className="h-10 w-10 text-slate-400" />
                </div>
                <div className="text-center">
                  <p className="text-xl font-medium">No instances found</p>
                  <p className="text-slate-500 mt-2">Try adjusting your filters or search criteria</p>
                </div>
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

        {/* Provider Info Cards - New! */}
        <motion.div 
          className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-500 mr-3">
                <Cpu className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">Compute Options</h3>
            </div>
            <p className="text-slate-600">
              Compare vCPU configurations across providers to find the best performance at your price point.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-lg bg-purple-50 text-purple-500 mr-3">
                <MemoryStick className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">Memory Optimized</h3>
            </div>
            <p className="text-slate-600">
              Discover RAM-optimized instances perfect for memory-intensive workloads and databases.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-lg bg-green-50 text-green-500 mr-3">
                <Globe className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">Global Coverage</h3>
            </div>
            <p className="text-slate-600">
              Find the most cost-effective regions for your cloud workloads with global pricing intelligence.
            </p>
          </div>
        </motion.div>
        
        {/* Footer - New! */}
        <motion.div 
          className="mt-10 pt-8 border-t border-slate-200 text-center text-slate-500 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <p>Cloud VM Price Comparison Tool — Pricing data updated regularly</p>
        </motion.div>
      </div>
      
      {/* Global Styles */}
      <style jsx>{`
        .cloud-shape {
          border-radius: 50%;
          filter: blur(10px);
          transform-origin: center center;
        }
      `}</style>
    </section>
  );
}

export default Explore;