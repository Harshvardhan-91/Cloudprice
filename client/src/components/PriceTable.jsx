import { motion } from 'framer-motion';
import { Table, ArrowUp, ArrowDown, Info } from 'lucide-react';
import { useState } from 'react';

function PriceTable({ data }) {
  const [sortConfig, setSortConfig] = useState({ key: 'price', direction: 'asc' });
  const [hoveredRow, setHoveredRow] = useState(null);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const sortedData = [...data].sort((a, b) => {
    if (sortConfig.direction === 'asc') {
      return a[sortConfig.key] > b[sortConfig.key] ? 1 : -1;
    }
    return a[sortConfig.key] < b[sortConfig.key] ? 1 : -1;
  });

  const columns = [
    { key: 'provider', label: 'Provider', tooltip: 'Cloud service provider' },
    { key: 'region', label: 'Region', tooltip: 'Geographic location of the instance' },
    { key: 'vCPUs', label: 'vCPUs', tooltip: 'Number of virtual CPUs' },
    { key: 'ram', label: 'RAM (GB)', tooltip: 'Amount of memory in gigabytes' },
    { key: 'price', label: 'Price ($/hr)', tooltip: 'Hourly cost in USD' },
    { key: 'costPerCore', label: 'Cost/Core', tooltip: 'Cost per vCPU core' },
    { key: 'costPerGB', label: 'Cost/GB', tooltip: 'Cost per GB of RAM' },
    { key: 'instanceType', label: 'Instance Type', tooltip: 'Provider-specific instance identifier' },
  ];

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
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="group px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    <div className="relative">
                      <Info className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {column.tooltip}
                      </div>
                    </div>
                    {sortConfig.key === column.key && (
                      sortConfig.direction === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.map((item, index) => (
              <motion.tr
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`hover:bg-blue-50 transition-colors ${
                  hoveredRow === index ? 'bg-blue-50' : ''
                }`}
                onMouseEnter={() => setHoveredRow(index)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className={`h-3 w-3 rounded-full mr-2 ${
                      item.provider === 'AWS' ? 'bg-orange-500' :
                      item.provider === 'Azure' ? 'bg-blue-500' :
                      'bg-red-500'
                    }`} />
                    <span className="text-sm font-medium text-gray-900">{item.provider}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.region}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.vCPUs}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.ram}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.price.toFixed(3)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.costPerCore.toFixed(3)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.costPerGB.toFixed(3)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.instanceType}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-gray-50 px-6 py-3 text-sm text-gray-500">
        Showing {data.length} instances
      </div>
    </motion.div>
  );
}

export default PriceTable;