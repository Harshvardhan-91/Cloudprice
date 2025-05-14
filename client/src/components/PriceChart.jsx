import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { BarChart2, LineChart as LineChartIcon, TrendingUp, DollarSign } from 'lucide-react';
import { useState } from 'react';

function PriceChart({ data }) {
  const [chartType, setChartType] = useState('bar'); // 'bar' or 'line'

  // Prepare data for charts
  const providerData = data.reduce((acc, item) => {
    const existing = acc.find(p => p.provider === item.provider);
    if (existing) {
      existing.price += item.price || 0;
      existing.count += 1;
    } else {
      acc.push({
        provider: item.provider,
        price: item.price || 0,
        count: 1,
      });
    }
    return acc;
  }, []).map(item => ({
    ...item,
    avgPrice: item.price / item.count,
  }));

  const performanceData = data.map(item => ({
    name: item.instanceType,
    price: item.price || 0,
    costPerCore: item.costPerCore || 0,
    costPerGB: item.costPerGB || 0,
  }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Chart Type Toggle */}
      <div className="flex justify-center gap-4">
        <button
          onClick={() => setChartType('bar')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            chartType === 'bar'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <BarChart2 className="h-5 w-5" />
          Bar Chart
        </button>
        <button
          onClick={() => setChartType('line')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            chartType === 'line'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <LineChartIcon className="h-5 w-5" />
          Line Chart
        </button>
      </div>

      {/* Provider Comparison Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-blue-500" />
          Average Price by Provider
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' ? (
              <BarChart data={providerData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="provider" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [`$${value.toFixed(3)}`, 'Average Price']}
                  labelFormatter={(label) => `${label} Instances`}
                />
                <Legend />
                <Bar
                  dataKey="avgPrice"
                  fill="#3B82F6"
                  name="Average Price ($/hr)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            ) : (
              <LineChart data={providerData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="provider" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [`$${value.toFixed(3)}`, 'Average Price']}
                  labelFormatter={(label) => `${label} Instances`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="avgPrice"
                  stroke="#3B82F6"
                  name="Average Price ($/hr)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Performance Metrics Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-500" />
          Cost vs Performance
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip
                formatter={(value, name) => [
                  `$${value.toFixed(3)}`,
                  name === 'costPerCore' ? 'Cost per Core' : name === 'costPerGB' ? 'Cost per GB' : 'Price',
                ]}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="costPerCore"
                stroke="#3B82F6"
                name="Cost per Core ($/hr)"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="costPerGB"
                stroke="#10B981"
                name="Cost per GB ($/hr)"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}

export default PriceChart;