import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown, Info, Eye, ExternalLink } from 'lucide-react';
import { useState } from 'react';

function PriceTable({ data, sortBy, sortOrder, sortCategory, currency }) {
  const [hoveredRow, setHoveredRow] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);

  // Define columns based on sortCategory
  const getColumns = () => {
    if (sortCategory === 'regionPricing') {
      return [
        { key: 'provider', label: 'Provider', tooltip: 'Cloud service provider' },
        { key: 'region', label: 'Region', tooltip: 'Geographic location' },
        { key: 'averagePrice', label: `Avg Price (${currency}/hr)`, tooltip: 'Average hourly price for the region' },
      ];
    } else if (sortCategory === 'spotPrice') {
      return [
        { key: 'provider', label: 'Provider', tooltip: 'Cloud service provider' },
        { key: 'instanceType', label: 'Instance Type', tooltip: 'Provider-specific instance identifier' },
        { key: 'region', label: 'Region', tooltip: 'Geographic location of the instance' },
        { key: 'spotPrice', label: `Spot Price (${currency}/hr)`, tooltip: 'Spot price per hour' },
      ];
    } else if (sortCategory === 'pricePerPerformance') {
      return [
        { key: 'provider', label: 'Provider', tooltip: 'Cloud service provider' },
        { key: 'instanceType', label: 'Instance Type', tooltip: 'Provider-specific instance identifier' },
        { key: 'region', label: 'Region', tooltip: 'Geographic location of the instance' },
        { key: 'vCPUs', label: 'vCPUs', tooltip: 'Number of virtual CPUs' },
        { key: 'ram', label: 'RAM (GB)', tooltip: 'Amount of memory in gigabytes' },
        { key: 'costPerVCPU', label: `Cost/vCPU (${currency})`, tooltip: 'Cost per vCPU' },
        { key: 'costPerGB', label: `Cost/GB (${currency})`, tooltip: 'Cost per GB of RAM' },
        { key: 'performanceScore', label: 'Performance Score', tooltip: 'Simplified performance score' },
      ];
    } else {
      // Default: instancePricing (and rdsPricing)
      return [
        { key: 'provider', label: 'Provider', tooltip: 'Cloud service provider' },
        { key: 'instanceType', label: 'Instance Type', tooltip: 'Provider-specific instance identifier' },
        { key: 'region', label: 'Region', tooltip: 'Geographic location of the instance' },
        { key: 'vCPUs', label: 'vCPUs', tooltip: 'Number of virtual CPUs' },
        { key: 'ram', label: 'RAM (GB)', tooltip: 'Amount of memory in gigabytes' },
        { key: 'price', label: `Price (${currency}/hr)`, tooltip: 'Hourly on-demand cost' },
        { key: 'costPerCore', label: `Cost/Core (${currency})`, tooltip: 'Cost per vCPU core' },
        { key: 'costPerGB', label: `Cost/GB (${currency})`, tooltip: 'Cost per GB of RAM' },
      ];
    }
  };

  const columns = getColumns();

  const formatCurrency = (value) => {
    if (value === undefined || value === null) return '-';
    return `${currency} ${value.toFixed(4)}`;
  };

  const handleRowExpand = (id) => {
    if (expandedRow === id) {
      setExpandedRow(null);
    } else {
      setExpandedRow(id);
    }
  };

  const getProviderColor = (provider) => {
    switch(provider.toLowerCase()) {
      case 'aws': return 'text-amber-600 bg-amber-50';
      case 'azure': return 'text-blue-600 bg-blue-50';
      case 'gcp': return 'text-indigo-600 bg-indigo-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  const getProviderDocLink = (provider, instanceType) => {
    const providerLower = provider.toLowerCase();
    if (providerLower === 'aws') {
      const family = instanceType.split('.')[0];
      return `https://aws.amazon.com/ec2/instance-types/${family.toLowerCase()}/`;
    } else if (providerLower === 'azure') {
      return 'https://azure.microsoft.com/en-us/pricing/details/virtual-machines/';
    } else if (providerLower === 'gcp') {
      const family = instanceType.split('-')[0];
      return `https://cloud.google.com/compute/docs/machine-types#${family.toLowerCase()}`;
    }
    return '#';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-sm overflow-hidden"
    >
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">
                &nbsp;
              </th>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase relative ${
                    sortBy === column.key ? 'text-blue-600' : ''
                  }`}
                >
                  <div className="flex items-center group">
                    <span>{column.label}</span>
                    {sortBy === column.key && (
                      sortOrder === 'asc' ? 
                        <ArrowUp className="h-3.5 w-3.5 ml-1 text-blue-500" /> : 
                        <ArrowDown className="h-3.5 w-3.5 ml-1 text-blue-500" />
                    )}
                    {column.tooltip && (
                      <div className="group-hover:opacity-100 opacity-0 absolute z-10 bg-slate-800 text-white p-2 rounded text-xs whitespace-nowrap transition-opacity -top-7 left-1/2 transform -translate-x-1/2 pointer-events-none">
                        {column.tooltip}
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((instance) => (
              <>
                <tr 
                  key={instance.id}
                  className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                    hoveredRow === instance.id ? 'bg-slate-50' : ''
                  }`}
                  onMouseEnter={() => setHoveredRow(instance.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  onClick={() => handleRowExpand(instance.id)}
                >
                  <td className="px-4 py-4 whitespace-nowrap">
                    <button className={`p-1.5 rounded-full ${expandedRow === instance.id ? 'bg-blue-100 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                  {sortCategory === 'regionPricing' ? (
                    <>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${getProviderColor(instance.provider)}`}>
                          {instance.provider}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-700">
                        {instance.region}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-slate-800">
                        {formatCurrency(instance.averagePrice)}
                      </td>
                    </>
                  ) : sortCategory === 'spotPrice' ? (
                    <>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${getProviderColor(instance.provider)}`}>
                          {instance.provider}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-slate-800">
                        {instance.instanceType}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-700">
                        {instance.region}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-slate-800">
                        {formatCurrency(instance.spotPrice)}
                      </td>
                    </>
                  ) : sortCategory === 'pricePerPerformance' ? (
                    <>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${getProviderColor(instance.provider)}`}>
                          {instance.provider}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-slate-800">
                        {instance.instanceType}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-700">
                        {instance.region}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-700">
                        {instance.vCPUs}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-700">
                        {instance.ram}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-700">
                        {formatCurrency(instance.costPerVCPU)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-700">
                        {formatCurrency(instance.costPerGB)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-700">
                        {instance.performanceScore?.toFixed(2) || '-'}
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${getProviderColor(instance.provider)}`}>
                          {instance.provider}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-slate-800">
                        {instance.instanceType}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-700">
                        {instance.region}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-700">
                        {instance.vCPUs}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-700">
                        {instance.ram}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-slate-800">
                        {formatCurrency(instance.price)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-700">
                        {formatCurrency(instance.costPerCore)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-700">
                        {formatCurrency(instance.costPerGB)}
                      </td>
                    </>
                  )}
                </tr>

                {expandedRow === instance.id && (
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <td colSpan={columns.length + 1} className="px-8 py-6">
                      {sortCategory === 'regionPricing' || instance.isRegionBased ? (
                        <div className="text-sm text-slate-600">
                          <p className="text-orange-600 mb-4">
                            Note: This is an average price for the region. Instance-specific details are not available for {instance.provider} at this time.
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                              <h4 className="text-sm font-semibold text-slate-700 mb-3">Region Details</h4>
                              <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                  <span className="text-slate-500">Region:</span>
                                  <span className="font-medium text-slate-700">{instance.region}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                  <span className="text-slate-500">Average Price:</span>
                                  <span className="font-medium text-slate-700">{formatCurrency(instance.averagePrice)}/hr</span>
                                </div>
                              </div>
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-slate-700 mb-3">Provider Details</h4>
                              <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                  <span className="text-slate-500">Provider:</span>
                                  <span className="font-medium text-slate-700">{instance.provider}</span>
                                </div>
                                <div className="mt-4">
                                  <a 
                                    href={getProviderDocLink(instance.provider, instance.instanceType)}
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-xs inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
                                  >
                                    <span>Learn more about {instance.provider} pricing</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : sortCategory === 'spotPrice' ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <h4 className="text-sm font-semibold text-slate-700 mb-3">Instance Details</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Instance Type:</span>
                                <span className="font-medium text-slate-700">{instance.instanceType}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Region:</span>
                                <span className="font-medium text-slate-700">{instance.region}</span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-slate-700 mb-3">Spot Pricing</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Spot Price:</span>
                                <span className="font-medium text-slate-700">{formatCurrency(instance.spotPrice)}/hr</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-500">On-Demand Price:</span>
                                <span className="font-medium text-slate-700">{formatCurrency(instance.price)}/hr</span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-slate-700 mb-3">Provider Details</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Provider:</span>
                                <span className="font-medium text-slate-700">{instance.provider}</span>
                              </div>
                              <div className="mt-4">
                                <a 
                                  href={getProviderDocLink(instance.provider, instance.instanceType)}
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
                                >
                                  <span>Learn more about this instance</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : sortCategory === 'pricePerPerformance' ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <h4 className="text-sm font-semibold text-slate-700 mb-3">Performance Metrics</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Performance Score:</span>
                                <span className="font-medium text-slate-700">{instance.performanceScore?.toFixed(2) || '-'}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Cost per vCPU:</span>
                                <span className="font-medium text-slate-700">{formatCurrency(instance.costPerVCPU)}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Cost per GB RAM:</span>
                                <span className="font-medium text-slate-700">{formatCurrency(instance.costPerGB)}</span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-slate-700 mb-3">Instance Specs</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-500">vCPUs:</span>
                                <span className="font-medium text-slate-700">{instance.vCPUs}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-500">RAM:</span>
                                <span className="font-medium text-slate-700">{instance.ram} GB</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-500">GPU:</span>
                                <span className="font-medium text-slate-700">
                                  {instance.gpu ? `Yes (${instance.gpuType || 'Unknown type'})` : 'No'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-slate-700 mb-3">Provider Details</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Provider:</span>
                                <span className="font-medium text-slate-700">{instance.provider}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Region:</span>
                                <span className="font-medium text-slate-700">{instance.region}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Instance Type:</span>
                                <span className="font-medium text-slate-700">{instance.instanceType}</span>
                              </div>
                              <div className="mt-4">
                                <a 
                                  href={getProviderDocLink(instance.provider, instance.instanceType)}
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
                                >
                                  <span>Learn more about this instance</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <h4 className="text-sm font-semibold text-slate-700 mb-3">Specification Details</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Category:</span>
                                <span className="font-medium text-slate-700">{instance.category || 'General Purpose'}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Architecture:</span>
                                <span className="font-medium text-slate-700">{instance.specs?.architecture || 'x86_64'}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-500">CPU Model:</span>
                                <span className="font-medium text-slate-700">{instance.specs?.cpuModel || 'Unknown'}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Network Throughput:</span>
                                <span className="font-medium text-slate-700">{instance.specs?.networkThroughput || 'Up to 10 Gbps'}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Storage:</span>
                                <span className="font-medium text-slate-700">{instance.specs?.storage || 'EBS Only'}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Storage Type:</span>
                                <span className="font-medium text-slate-700">{instance.specs?.storageType || 'Unknown'}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-500">GPU:</span>
                                <span className="font-medium text-slate-700">
                                  {instance.gpu ? `Yes (${instance.gpuType || 'Unknown type'})` : 'No'}
                                </span>
                              </div>
                              {instance.isRDS && (
                                <div className="flex justify-between text-xs">
                                  <span className="text-slate-500">Service:</span>
                                  <span className="font-medium text-slate-700">RDS</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-slate-700 mb-3">Pricing Options</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-500">On-Demand:</span>
                                <span className="font-medium text-slate-700">{formatCurrency(instance.price)}/hr</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Reserved:</span>
                                <span className="font-medium text-slate-700">
                                  {instance.reserved ? formatCurrency(instance.reserved) + '/hr' : 'N/A'}
                                </span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Spot:</span>
                                <span className="font-medium text-slate-700">
                                  {instance.spot ? formatCurrency(instance.spot) + '/hr' : 'N/A'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-slate-700 mb-3">Provider Details</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Provider:</span>
                                <span className="font-medium text-slate-700">{instance.provider}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Region:</span>
                                <span className="font-medium text-slate-700">{instance.region}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Instance Type:</span>
                                <span className="font-medium text-slate-700">{instance.instanceType}</span>
                              </div>
                              <div className="mt-4">
                                <a 
                                  href={getProviderDocLink(instance.provider, instance.instanceType)}
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
                                >
                                  <span>Learn more about this instance</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

export default PriceTable;