import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Activity,
  ChevronLeft,
  ChevronRight,
  Globe2,
} from "lucide-react";
import PriceFilters from "../components/PriceFilters";
import PriceTable from "../components/PriceTable";
import PriceChart from "../components/PriceChart";
import { compareInstances } from "../api";

const PROVIDERS = [
  {
    id: "aws",
    name: "AWS",
    color: "#FF9900",
    gradient: "from-amber-400 to-orange-500",
  },
  {
    id: "azure",
    name: "Azure",
    color: "#0078D4",
    gradient: "from-blue-400 to-blue-600",
  },
  {
    id: "gcp",
    name: "GCP",
    color: "#4285F4",
    gradient: "from-blue-500 to-indigo-500",
  },
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

const SORT_CATEGORIES = {
  aws: [
    { value: 'instancePricing', label: 'EC2 Instances' },
    { value: 'rdsPricing', label: 'RDS Instances' },
    { value: 'spotPrice', label: 'Spot Price History' },
    { value: 'regionPricing', label: 'Region Pricing' },
  ],
  azure: [
    { value: 'instancePricing', label: 'Virtual Machines' },
    { value: 'spotPrice', label: 'Spot Price History' },
    { value: 'regionPricing', label: 'Region Pricing' },
    { value: 'pricePerPerformance', label: 'VMs Price/Performance' },
  ],
  gcp: [
    { value: 'instancePricing', label: 'Compute Engine Instances' },
    { value: 'spotPrice', label: 'Spot Price History' },
    { value: 'regionPricing', label: 'Region Pricing' },
    { value: 'pricePerPerformance', label: 'Instances Price/Performance' },
  ],
};

function Explore() {
  const [view, setView] = useState("table");
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("price");
  const [sortOrder, setSortOrder] = useState("asc");
  const [sortCategory, setSortCategory] = useState("instancePricing");
  const [currency, setCurrency] = useState("USD");
  const [selectedProviders, setSelectedProviders] = useState([
    "aws",
    "azure",
    "gcp",
  ]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    regions: [],
    vCPUs: [0, 16],
    ram: [0, 64],
    gpu: false,
    instanceTypes: [],
    includeRDS: false, // New filter for RDS
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const toggleFilter = () => setIsFilterOpen(!isFilterOpen);

  const fetchData = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    try {
      const filterParams = {
        providers: selectedProviders.join(","),
        minCpu: filters.vCPUs[0],
        maxCpu: filters.vCPUs[1],
        minMemory: filters.ram[0],
        maxMemory: filters.ram[1],
        gpu: filters.gpu,
        sortBy:
          sortBy === "price"
            ? "pricing.onDemand"
            : sortBy === "costPerCore"
            ? "costPerVCPU"
            : sortBy === "costPerGB"
            ? "costPerGB"
            : sortBy,
        sortOrder,
        page,
        searchTerm: searchQuery,
        instanceTypes: filters.instanceTypes.join(","),
        sortCategory: sortCategory, // Pass sort category
        currency: currency, // Pass currency
      };
      if (filters.regions.length > 0) {
        filterParams.region = filters.regions[0];
      }

      const res = await compareInstances(filterParams);

      const transformedData = (res.data || []).map((item) => ({
        id: item.id,
        provider: item.provider.toUpperCase(),
        region: item.region,
        vCPUs: item.vCPUs,
        ram: item.ram,
        price: item.price,
        averagePrice: item.averagePrice,
        spotPrice: item.spotPrice,
        costPerCore: item.costPerCore,
        costPerGB: item.costPerGB,
        costPerVCPU: item.costPerVCPU,
        performanceScore: item.performanceScore,
        instanceType: item.instanceType,
        specs: item.specs,
        gpu: item.gpu,
        gpuType: item.gpuType,
        reserved: item.pricing?.reserved,
        spot: item.pricing?.spot,
        category: item.category,
        isRegionBased: item.isRegionBased,
        isRDS: item.isRDS,
        currency: res.currency || 'USD',
      }));

      setData(transformedData);
      setTotalPages(res.pagination?.pages || 1);

      if (!res.data || res.data.length === 0) {
        setError(`No instances found matching the current filters.`);
      }
    } catch (err) {
      setError(`Unable to fetch the requested data: ${err.message}`);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedProviders, filters, sortBy, sortOrder, sortCategory, currency, page, searchQuery]);

  const handleProviderChange = (providers) => {
    setSelectedProviders(providers);
    setPage(1);
    // Reset sort category to a valid option for the selected providers
    const provider = providers.length === 1 ? providers[0] : 'aws';
    setSortCategory(SORT_CATEGORIES[provider][0].value);
  };

  const sortedData = [...data].sort((a, b) => {
    const aValue = a[sortBy] || 0;
    const bValue = b[sortBy] || 0;
    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : -1;
    }
    return aValue < bValue ? 1 : -1;
  });

  const currentProvider =
    selectedProviders.length === 1
      ? PROVIDERS.find((p) => p.id === selectedProviders[0])
      : PROVIDERS[0];

  const getStats = () => {
    if (!sortedData.length) return null;

    const totalInstances = totalPages * 10;
    const avgPrice =
      sortedData.reduce((sum, item) => sum + (item.price || item.averagePrice || item.spotPrice || 0), 0) / sortedData.length;
    const minPrice = Math.min(...sortedData.map((item) => item.price || item.averagePrice || item.spotPrice || 0));
    const maxPrice = Math.max(...sortedData.map((item) => item.price || item.averagePrice || item.spotPrice || 0));

    return { avgPrice, minPrice, maxPrice, totalInstances };
  };

  const stats = getStats();

  const hasAzureDataWithoutInstances =
    selectedProviders.includes("azure") &&
    sortedData.some(
      (item) => item.provider === "AZURE" && item.isRegionBased
    );

  const azureFilteredOut =
    selectedProviders.includes("azure") &&
    sortedData.every((item) => item.provider !== "AZURE") &&
    (filters.vCPUs[0] > 0 || filters.ram[0] > 0 || filters.gpu);

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const getSortCategoryOptions = () => {
    if (selectedProviders.length === 1) {
      return SORT_CATEGORIES[selectedProviders[0]] || SORT_CATEGORIES.aws;
    }
    // If multiple providers are selected, show a combined set of options
    return [
      { value: 'instancePricing', label: 'Instances' },
      { value: 'spotPrice', label: 'Spot Price History' },
      { value: 'regionPricing', label: 'Region Pricing' },
      { value: 'pricePerPerformance', label: 'Price/Performance' },
    ];
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100">
      <div className="absolute top-0 left-0 w-full h-64 overflow-hidden -z-10">
        <div
          className={`absolute inset-0 bg-gradient-to-r ${
            currentProvider?.gradient || "from-blue-400 to-indigo-500"
          } opacity-5`}
        ></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-8 text-center relative"
        >
          <div className="relative z-10">
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900">
              Cloud{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                VM Price Comparison
              </span>
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto mt-2">
              Compare VM pricing across AWS, Azure, and GCP to find the perfect
              instance for your workload
            </p>
          </div>
        </motion.div>

        <motion.div
          className="mb-8 flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="inline-flex p-1.5 rounded-2xl shadow-xl bg-white border border-slate-100">
            {PROVIDERS.map((p) => (
              <motion.button
                key={p.id}
                onClick={() => handleProviderChange([p.id])}
                className={`px-6 py-3.5 flex items-center justify-center rounded-xl transition-all duration-300 ${
                  selectedProviders.length === 1 &&
                  selectedProviders[0] === p.id
                    ? `bg-gradient-to-r ${p.gradient} text-white font-medium shadow-lg`
                    : "bg-white text-slate-700 hover:bg-slate-50"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span
                  className="mr-2.5"
                  style={{
                    color:
                      selectedProviders.length === 1 &&
                      selectedProviders[0] === p.id
                        ? "white"
                        : p.color,
                  }}
                >
                  {providerLogos[p.id]}
                </span>
                <span className="font-medium">{p.name}</span>
              </motion.button>
            ))}
            <motion.button
              onClick={() => handleProviderChange(["aws", "azure", "gcp"])}
              className={`px-6 py-3.5 flex items-center justify-center rounded-xl transition-all duration-300 ${
                selectedProviders.length === 3
                  ? `bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium shadow-lg`
                  : "bg-white text-slate-700 hover:bg-slate-50"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="font-medium">All Clouds</span>
            </motion.button>
          </div>
        </motion.div>

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
              <p className="text-2xl font-bold text-slate-800">
                {currency} {stats.avgPrice.toFixed(4)}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-md border border-slate-100">
              <div className="flex items-center mb-2">
                <div className="p-2 rounded-lg bg-green-50 text-green-500 mr-3">
                  <Activity className="h-5 w-5" />
                </div>
                <h3 className="text-slate-500 font-medium">Price Range</h3>
              </div>
              <p className="text-2xl font-bold text-slate-800">
                {currency} {stats.minPrice.toFixed(4)} - {currency} {stats.maxPrice.toFixed(4)}
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
                {stats.totalInstances}
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

        {hasAzureDataWithoutInstances && !loading && !error && (
          <motion.div
            className="mb-6 text-center text-sm text-orange-600 bg-orange-50 p-4 rounded-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <p>
              Note: Azure data currently shows average prices per region. Instance-specific details are not available.
            </p>
          </motion.div>
        )}

        {azureFilteredOut && !loading && !error && (
          <motion.div
            className="mb-6 text-center text-sm text-orange-600 bg-orange-50 p-4 rounded-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <p>
              Warning: Azure data may be filtered out due to vCPUs, RAM, or GPU filters, as Azure data is region-based and lacks instance-specific details.
            </p>
          </motion.div>
        )}

        <motion.div
          key={selectedProviders.join(",")}
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
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-4 flex-wrap justify-center">
              <motion.button
                onClick={toggleFilter}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all duration-200 border border-slate-200 shadow-sm ${
                  isFilterOpen
                    ? "bg-blue-50 text-blue-600 border-blue-200"
                    : "bg-white text-slate-700 hover:bg-slate-50"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Filter className="h-5 w-5" />
                {isFilterOpen ? "Hide Filters" : "Show Filters"}
              </motion.button>

              <div className="flex items-center rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
                <select
                  value={sortCategory}
                  onChange={(e) => setSortCategory(e.target.value)}
                  className="px-4 py-3 focus:outline-none text-slate-700 border-r border-slate-200 bg-white"
                >
                  {getSortCategoryOptions().map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 focus:outline-none text-slate-700 border-r border-slate-200 bg-white"
                >
                  {sortCategory === 'regionPricing' ? (
                    <>
                      <option value="averagePrice">Sort by Avg Price</option>
                      <option value="region">Sort by Region</option>
                    </>
                  ) : sortCategory === 'spotPrice' ? (
                    <>
                      <option value="spotPrice">Sort by Spot Price</option>
                      <option value="instanceType">Sort by Instance Type</option>
                    </>
                  ) : sortCategory === 'pricePerPerformance' ? (
                    <>
                      <option value="performanceScore">Sort by Performance Score</option>
                      <option value="costPerVCPU">Sort by Cost/vCPU</option>
                      <option value="costPerGB">Sort by Cost/GB</option>
                    </>
                  ) : (
                    <>
                      <option value="price">Sort by Price</option>
                      <option value="costPerCore">Sort by Cost/Core</option>
                      <option value="costPerGB">Sort by Cost/GB</option>
                      <option value="vCPUs">Sort by vCPUs</option>
                      <option value="ram">Sort by RAM</option>
                    </>
                  )}
                </select>
                <button
                  onClick={() =>
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                  }
                  className="px-4 py-3 text-slate-700 hover:bg-slate-50 transition-colors flex items-center bg-white"
                  aria-label={
                    sortOrder === "asc" ? "Sort ascending" : "Sort descending"
                  }
                >
                  {sortOrder === "asc" ? (
                    <ArrowUp className="h-5 w-5 text-blue-500" />
                  ) : (
                    <ArrowDown className="h-5 w-5 text-blue-500" />
                  )}
                </button>
              </div>

              {selectedProviders.includes('azure') && (
                <div className="flex items-center rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="px-4 py-3 focus:outline-none text-slate-700 bg-white"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="INR">INR</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-slate-100">
                <PriceFilters
                  filters={filters}
                  setFilters={setFilters}
                  selectedProviders={selectedProviders}
                  setSelectedProviders={setSelectedProviders}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          className="flex justify-center mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="inline-flex rounded-xl overflow-hidden border border-slate-200 p-1.5 bg-white shadow-lg">
            <motion.button
              onClick={() => setView("table")}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-300 ${
                view === "table"
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
              whileHover={{ scale: view !== "table" ? 1.02 : 1 }}
              whileTap={{ scale: 0.98 }}
            >
              <Table className="h-5 w-5" />
              <span className="font-medium">Table View</span>
            </motion.button>
            <motion.button
              onClick={() => setView("chart")}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-300 ${
                view === "chart"
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
              whileHover={{ scale: view !== "chart" ? 1.02 : 1 }}
              whileTap={{ scale: 0.98 }}
            >
              <BarChart2 className="h-5 w-5" />
              <span className="font-medium">Chart View</span>
            </motion.button>
          </div>
        </motion.div>

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
                  <svg
                    className="animate-spin h-16 w-16 text-blue-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="2"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-xl font-medium">
                    Loading cloud instances...
                  </p>
                  <p className="text-slate-400 mt-2">
                    Fetching the latest pricing data from selected providers
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                <div className="bg-orange-50 rounded-full p-4 mb-6 text-orange-500">
                  <AlertCircle className="h-10 w-10" />
                </div>
                <div className="text-center">
                  <p className="text-xl font-medium text-orange-600">{error}</p>
                  <p className="text-slate-500 mt-2 mb-6">
                    Unable to fetch the requested data
                  </p>
                  <motion.button
                    onClick={() => fetchData(true)}
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
                  <p className="text-slate-500 mt-2">
                    Try adjusting your filters or search criteria
                  </p>
                </div>
              </div>
            ) : view === "table" ? (
              <div className="p-4">
                <PriceTable
                  data={sortedData}
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  sortCategory={sortCategory}
                  currency={currency}
                />
              </div>
            ) : (
              <div className="p-4">
                <PriceChart data={sortedData} />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {!loading && !error && totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <div className="inline-flex rounded-xl overflow-hidden border border-slate-200 bg-white shadow">
              <button
                onClick={handlePreviousPage}
                disabled={page === 1}
                className={`px-4 py-2 flex items-center gap-1 ${
                  page === 1
                    ? "text-slate-400"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </button>
              <div className="px-4 py-2 border-x border-slate-200 flex items-center">
                <span className="text-slate-800 font-medium">
                  Page {page} of {totalPages}
                </span>
              </div>
              <button
                onClick={handleNextPage}
                disabled={page === totalPages}
                className={`px-4 py-2 flex items-center gap-1 ${
                  page === totalPages
                    ? "text-slate-400"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

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
              <h3 className="text-lg font-semibold text-slate-800">
                Compute Options
              </h3>
            </div>
            <p className="text-slate-600">
              Compare vCPU configurations across providers to find the best
              performance at your price point.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-lg bg-purple-50 text-purple-500 mr-3">
                <MemoryStick className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text text-slate-800">
                Memory Optimized
              </h3>
            </div>
            <p className="text-slate-600">
              Discover RAM-optimized instances perfect for memory-intensive
              workloads and databases.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-lg bg-green-50 text-green-500 mr-3">
                <Globe className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">
                Global Coverage
              </h3>
            </div>
            <p className="text-slate-600">
              Find the most cost-effective regions for your cloud workloads with
              global pricing intelligence.
            </p>
          </div>
        </motion.div>

        <motion.div
          className="mt-10 pt-8 border-t border-slate-200 text-center text-slate-500 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <p>
            Cloud VM Price Comparison Tool — Pricing data updated every 3 days
          </p>
        </motion.div>
      </div>
    </section>
  );
}

export default Explore;