import { motion } from 'framer-motion';
import { Table } from 'lucide-react';

function PriceTable({ data }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-lg shadow-md overflow-x-auto"
    >
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Provider
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Region
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              vCPUs
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              RAM (GB)
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Price ($/hr)
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Instance Type
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item, index) => (
            <tr key={index}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.provider}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.region}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.vCPUs}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.ram}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.price}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.instanceType}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Add pagination in Phase 5 */}
    </motion.div>
  );
}

export default PriceTable;