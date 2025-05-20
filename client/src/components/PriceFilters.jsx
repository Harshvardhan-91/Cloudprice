import { motion } from 'framer-motion';
import { Filter, X, Sliders, Cpu, HardDrive, Globe, Zap, Database } from 'lucide-react';

function PriceFilters({ filters, setFilters, selectedProviders, setSelectedProviders }) {
  const providers = [
    { id: 'aws', name: 'AWS', color: 'orange' },
    { id: 'azure', name: 'Azure', color: 'blue' },
    { id: 'gcp', name: 'GCP', color: 'red' },
  ];

  const regions = [
    { provider: 'aws', name: 'US East (N. Virginia)', value: 'us-east-1' },
    { provider: 'aws', name: 'US West (Oregon)', value: 'us-west-2' },
    { provider: 'azure', name: 'East US', value: 'eastus' },
    { provider: 'azure', name: 'West Europe', value: 'westeurope' },
    { provider: 'gcp', name: 'US Central', value: 'us-central1' },
    { provider: 'gcp', name: 'Europe West', value: 'europe-west1' },
  ];

  const instanceTypes = [
    { category: 'General Purpose', types: ['t3', 'D2s', 'e2'] },
    { category: 'Compute Optimized', types: ['c5', 'Fsv2', 'c2'] },
    { category: 'Memory Optimized', types: ['r5', 'Esv3', 'm2'] },
  ];

  const handleProviderToggle = (provider) => {
    setSelectedProviders(prev =>
      prev.includes(provider)
        ? prev.filter(p => p !== provider)
        : [...prev, provider]
    );
  };

  const handleRegionToggle = (region) => {
    setFilters(prev => ({
      ...prev,
      regions: prev.regions.includes(region)
        ? prev.regions.filter(r => r !== region)
        : [...prev.regions, region]
    }));
  };

  const handleInstanceTypeToggle = (type) => {
    setFilters(prev => ({
      ...prev,
      instanceTypes: prev.instanceTypes.includes(type)
        ? prev.instanceTypes.filter(t => t !== type)
        : [...prev.instanceTypes, type]
    }));
  };

  const handleRangeChange = (field, index, value) => {
    setFilters(prev => {
      const newRange = [...prev[field]];
      newRange[index] = parseInt(value);
      return { ...prev, [field]: newRange };
    });
  };

  const clearFilters = () => {
    setFilters({
      regions: [],
      vCPUs: [0, 16],
      ram: [0, 64],
      gpu: false,
      instanceTypes: [],
      includeRDS: false,
    });
    setSelectedProviders(['aws', 'azure', 'gcp']);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-sm p-6 mb-8"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sliders className="h-5 w-5 text-blue-500" />
          <h2 className="text-xl font-semibold">Advanced Filters</h2>
        </div>
        <button
          onClick={clearFilters}
          className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1"
        >
          <X className="h-4 w-4" />
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Providers */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-gray-700">
            <Globe className="h-5 w-5" />
            <h3 className="font-medium">Cloud Providers</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {providers.map(provider => (
              <button
                key={provider.id}
                onClick={() => handleProviderToggle(provider.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedProviders.includes(provider.id)
                    ? `bg-${provider.color}-500 text-white`
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {provider.name}
              </button>
            ))}
          </div>
        </div>

        {/* Regions */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-gray-700">
            <Globe className="h-5 w-5" />
            <h3 className="font-medium">Regions</h3>
          </div>
          <div className="max-h-32 overflow-y-auto">
            {regions.map(region => (
              <label
                key={region.value}
                className="flex items-center gap-2 py-1 text-sm text-gray-600 hover:text-gray-900 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={filters.regions.includes(region.value)}
                  onChange={() => handleRegionToggle(region.value)}
                  className="rounded text-blue-500 focus:ring-blue-500"
                />
                {region.name}
              </label>
            ))}
          </div>
        </div>

        {/* Instance Types */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-gray-700">
            <Cpu className="h-5 w-5" />
            <h3 className="font-medium">Instance Types</h3>
          </div>
          <div className="max-h-32 overflow-y-auto">
            {instanceTypes.map(category => (
              <div key={category.category} className="mb-2">
                <h4 className="text-xs font-medium text-gray-500 mb-1">{category.category}</h4>
                <div className="flex flex-wrap gap-1">
                  {category.types.map(type => (
                    <button
                      key={type}
                      onClick={() => handleInstanceTypeToggle(type)}
                      className={`px-2 py-0.5 text-xs rounded ${
                        filters.instanceTypes.includes(type)
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* vCPUs Range */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-gray-700">
            <Cpu className="h-5 w-5" />
            <h3 className="font-medium">vCPUs Range</h3>
          </div>
          <div className="px-2">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-sm text-gray-500">Min</label>
                <input
                  type="range"
                  min="0"
                  max={filters.vCPUs[1]}
                  value={filters.vCPUs[0]}
                  onChange={(e) => handleRangeChange('vCPUs', 0, e.target.value)}
                  className="w-full"
                />
                <span className="text-sm text-gray-500">{filters.vCPUs[0]} vCPUs</span>
              </div>
              <div className="flex-1">
                <label className="text-sm text-gray-500">Max</label>
                <input
                  type="range"
                  min={filters.vCPUs[0]}
                  max="64"
                  value={filters.vCPUs[1]}
                  onChange={(e) => handleRangeChange('vCPUs', 1, e.target.value)}
                  className="w-full"
                />
                <span className="text-sm text-gray-500">{filters.vCPUs[1]} vCPUs</span>
              </div>
            </div>
          </div>
        </div>

        {/* RAM Range */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-gray-700">
            <HardDrive className="h-5 w-5" />
            <h3 className="font-medium">RAM Range (GB)</h3>
          </div>
          <div className="px-2">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-sm text-gray-500">Min</label>
                <input
                  type="range"
                  min="0"
                  max={filters.ram[1]}
                  value={filters.ram[0]}
                  onChange={(e) => handleRangeChange('ram', 0, e.target.value)}
                  className="w-full"
                />
                <span className="text-sm text-gray-500">{filters.ram[0]} GB</span>
              </div>
              <div className="flex-1">
                <label className="text-sm text-gray-500">Max</label>
                <input
                  type="range"
                  min={filters.ram[0]}
                  max="256"
                  value={filters.ram[1]}
                  onChange={(e) => handleRangeChange('ram', 1, e.target.value)}
                  className="w-full"
                />
                <span className="text-sm text-gray-500">{filters.ram[1]} GB</span>
              </div>
            </div>
          </div>
        </div>

        {/* GPU Toggle */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-gray-700">
            <Zap className="h-5 w-5" />
            <h3 className="font-medium">GPU Support</h3>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={filters.gpu}
              onChange={(e) => setFilters(prev => ({ ...prev, gpu: e.target.checked }))}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            <span className="ml-3 text-sm text-gray-600">
              {filters.gpu ? 'GPU Instances Only' : 'All Instances'}
            </span>
          </label>
        </div>

        {/* RDS Toggle (AWS-specific) */}
        {selectedProviders.includes('aws') && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-gray-700">
              <Database className="h-5 w-5" />
              <h3 className="font-medium">Include RDS Instances</h3>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.includeRDS}
                onChange={(e) => setFilters(prev => ({ ...prev, includeRDS: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              <span className="ml-3 text-sm text-gray-600">
                {filters.includeRDS ? 'Include RDS Instances' : 'Exclude RDS Instances'}
              </span>
            </label>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default PriceFilters;