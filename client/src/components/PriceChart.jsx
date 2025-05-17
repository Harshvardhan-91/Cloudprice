import { motion } from 'framer-motion';
import { useState } from 'react';
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
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { BarChart2, LineChart as LineChartIcon, PieChart as PieChartIcon, Activity, Cpu, TrendingUp, DollarSign, Maximize } from 'lucide-react';

function PriceChart({ data }) {
  const [chartType, setChartType] = useState('bar'); // 'bar', 'line', 'pie', 'scatter', 'radar'
  const [metric, setMetric] = useState('price'); // 'price', 'vCPUs', 'ram', 'costPerCore', 'costPerGB'

  // Define provider colors
  const providerColors = {
    AWS: "#FF9900",
    AZURE: "#0078D4",
    GCP: "#4285F4",
  };

  // Common colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  // Prepare data for different chart types
  const prepareChartData = () => {
    switch (chartType) {
      case 'bar':
      case 'line':
        return prepareBarLineData();
      case 'pie':
        return preparePieData();
      case 'scatter':
        return prepareScatterData();
      case 'radar':
        return prepareRadarData();
      default:
        return prepareBarLineData();
    }
  };
  
  // Prepare data for bar and line charts
  const prepareBarLineData = () => {
    const providerData = data.reduce((acc, item) => {
      const providerName = item.provider;
      const existing = acc.find(p => p.name === providerName);
      
      if (existing) {
        existing.values.push({ 
          instanceType: item.instanceType,
          value: item[metric] || 0,
          label: metric,
          provider: providerName
        });
      } else {
        acc.push({
          name: providerName,
          values: [{ 
            instanceType: item.instanceType, 
            value: item[metric] || 0,
            label: metric,
            provider: providerName
          }],
          color: providerColors[providerName] || '#888'
        });
      }
      return acc;
    }, []);
    
    // Sort values by the selected metric for each provider
    providerData.forEach(provider => {
      provider.values.sort((a, b) => a.value - b.value);
      // Take only top 5 for visual clarity
      provider.values = provider.values.slice(0, 5);
    });
    
    return providerData;
  };
  
  // Prepare data for pie chart
  const preparePieData = () => {
    const aggregatedByProvider = data.reduce((acc, item) => {
      const providerName = item.provider;
      if (!acc[providerName]) {
        acc[providerName] = { 
          name: providerName, 
          value: 0,
          instances: 0,
          avgPrice: 0,
          avgVCPUs: 0,
          avgRAM: 0,
          color: providerColors[providerName] || '#888'
        };
      }
      
      acc[providerName].instances += 1;
      acc[providerName].value += item[metric] || 0;
      acc[providerName].avgPrice += item.price || 0;
      acc[providerName].avgVCPUs += item.vCPUs || 0;
      acc[providerName].avgRAM += item.ram || 0;
      
      return acc;
    }, {});
    
    // Calculate averages
    Object.values(aggregatedByProvider).forEach(item => {
      if (item.instances > 0) {
        item.avgPrice = item.avgPrice / item.instances;
        item.avgVCPUs = item.avgVCPUs / item.instances;
        item.avgRAM = item.avgRAM / item.instances;
      }
      
      if (metric !== 'price' && metric !== 'vCPUs' && metric !== 'ram') {
        item.value = item.value / item.instances; // Average for ratios
      }
    });
    
    return Object.values(aggregatedByProvider);
  };
  
  // Prepare data for scatter plot (vCPUs vs Price)
  const prepareScatterData = () => {
    return data.map(item => ({
      name: item.provider,
      x: item.vCPUs || 0, // vCPUs as x-axis
      y: item[metric] || 0, // Selected metric as y-axis
      z: item.ram || 0, // RAM as point size
      instanceType: item.instanceType,
      provider: item.provider,
      color: providerColors[item.provider] || '#888'
    }));
  };
  
  // Prepare data for radar chart
  const prepareRadarData = () => {
    const aggregatedByProvider = data.reduce((acc, item) => {
      const providerName = item.provider;
      if (!acc[providerName]) {
        acc[providerName] = { 
          name: providerName, 
          price: 0,
          vCPUs: 0,
          ram: 0,
          costPerCore: 0,
          costPerGB: 0,
          instances: 0,
          color: providerColors[providerName] || '#888'
        };
      }
      
      acc[providerName].instances += 1;
      acc[providerName].price += item.price || 0;
      acc[providerName].vCPUs += item.vCPUs || 0;
      acc[providerName].ram += item.ram || 0;
      acc[providerName].costPerCore += item.costPerCore || 0;
      acc[providerName].costPerGB += item.costPerGB || 0;
      
      return acc;
    }, {});
    
    // Calculate averages
    Object.values(aggregatedByProvider).forEach(item => {
      if (item.instances > 0) {
        item.price = item.price / item.instances;
        item.vCPUs = item.vCPUs / item.instances;
        item.ram = item.ram / item.instances;
        item.costPerCore = item.costPerCore / item.instances;
        item.costPerGB = item.costPerGB / item.instances;
      }
    });
    
    // Normalize values for radar chart (scale from 0-100)
    const maxValues = {
      price: Math.max(...Object.values(aggregatedByProvider).map(item => item.price)),
      vCPUs: Math.max(...Object.values(aggregatedByProvider).map(item => item.vCPUs)),
      ram: Math.max(...Object.values(aggregatedByProvider).map(item => item.ram)),
      costPerCore: Math.max(...Object.values(aggregatedByProvider).map(item => item.costPerCore)),
      costPerGB: Math.max(...Object.values(aggregatedByProvider).map(item => item.costPerGB))
    };
    
    Object.values(aggregatedByProvider).forEach(item => {
      // Invert price and cost metrics so lower is better in the radar chart
      item.price = maxValues.price > 0 ? (1 - item.price / maxValues.price) * 100 : 0;
      item.costPerCore = maxValues.costPerCore > 0 ? (1 - item.costPerCore / maxValues.costPerCore) * 100 : 0;
      item.costPerGB = maxValues.costPerGB > 0 ? (1 - item.costPerGB / maxValues.costPerGB) * 100 : 0;
      
      // Higher is better for vCPUs and RAM
      item.vCPUs = maxValues.vCPUs > 0 ? (item.vCPUs / maxValues.vCPUs) * 100 : 0;
      item.ram = maxValues.ram > 0 ? (item.ram / maxValues.ram) * 100 : 0;
    });
    
    return Object.values(aggregatedByProvider);
  };
  
  const chartData = prepareChartData();
  
  const formatYAxis = (value) => {
    if (metric === 'price' || metric === 'costPerCore' || metric === 'costPerGB') {
      return `$${value.toFixed(2)}`;
    }
    return value;
  };
  
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      if (chartType === 'scatter') {
        return (
          <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
            <p className="font-semibold">{payload[0].payload.provider}</p>
            <p className="text-sm">{payload[0].payload.instanceType}</p>
            <p className="text-xs text-gray-500">vCPUs: {payload[0].payload.x}</p>
            <p className="text-xs text-gray-500">
              {metric === 'price' && `Price: $${payload[0].payload.y.toFixed(4)}/hr`}
              {metric === 'costPerCore' && `Cost per Core: $${payload[0].payload.y.toFixed(4)}`}
              {metric === 'costPerGB' && `Cost per GB: $${payload[0].payload.y.toFixed(4)}`}
              {metric === 'vCPUs' && `vCPUs: ${payload[0].payload.y}`}
              {metric === 'ram' && `RAM: ${payload[0].payload.y} GB`}
            </p>
            <p className="text-xs text-gray-500">RAM: {payload[0].payload.z} GB</p>
          </div>
        );
      }
      
      if (chartType === 'pie') {
        const data = payload[0].payload;
        return (
          <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
            <p className="font-semibold">{data.name}</p>
            <p className="text-xs text-gray-500">Instances: {data.instances}</p>
            <p className="text-xs text-gray-500">Avg Price: ${data.avgPrice.toFixed(4)}/hr</p>
            <p className="text-xs text-gray-500">Avg vCPUs: {data.avgVCPUs.toFixed(2)}</p>
            <p className="text-xs text-gray-500">Avg RAM: {data.avgRAM.toFixed(2)} GB</p>
            <p className="text-xs text-gray-500">
              {metric === 'price' && `Total Price: $${data.value.toFixed(4)}/hr`}
              {metric === 'costPerCore' && `Avg Cost per Core: $${data.value.toFixed(4)}`}
              {metric === 'costPerGB' && `Avg Cost per GB: $${data.value.toFixed(4)}`}
              {metric === 'vCPUs' && `Total vCPUs: ${data.value}`}
              {metric === 'ram' && `Total RAM: ${data.value} GB`}
            </p>
          </div>
        );
      }
      
      if (chartType === 'radar') {
        return null; // No tooltip for radar chart
      }
      
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold">{payload[0].payload.instanceType}</p>
          <p className="text-xs text-gray-500">Provider: {payload[0].payload.provider}</p>
          <p className="text-xs text-gray-500">
            {metric === 'price' && `Price: $${payload[0].payload.value.toFixed(4)}/hr`}
            {metric === 'costPerCore' && `Cost per Core: $${payload[0].payload.value.toFixed(4)}`}
            {metric === 'costPerGB' && `Cost per GB: $${payload[0].payload.value.toFixed(4)}`}
            {metric === 'vCPUs' && `vCPUs: ${payload[0].payload.value}`}
            {metric === 'ram' && `RAM: ${payload[0].payload.value} GB`}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={500}>
            <BarChart margin={{ top: 20, right: 30, left: 20, bottom: 100 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="instanceType" type="category" allowDuplicatedCategory={false} />
              <YAxis dataKey="value" type="number" name={metric} formatter={formatYAxis} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {chartData.map(provider => (
                <Bar 
                  key={provider.name} 
                  name={provider.name} 
                  dataKey="value" 
                  data={provider.values} 
                  fill={provider.color} 
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={500}>
            <LineChart margin={{ top: 20, right: 30, left: 20, bottom: 100 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="instanceType" type="category" allowDuplicatedCategory={false} />
              <YAxis dataKey="value" type="number" name={metric} formatter={formatYAxis} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {chartData.map(provider => (
                <Line 
                  key={provider.name} 
                  name={provider.name} 
                  type="monotone"
                  dataKey="value" 
                  data={provider.values} 
                  stroke={provider.color} 
                  activeDot={{ r: 8 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={500}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={150}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
        
      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={500}>
            <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 100 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" dataKey="x" name="vCPUs" />
              <YAxis type="number" dataKey="y" name={metric} formatter={formatYAxis} />
              <ZAxis type="number" dataKey="z" range={[50, 400]} name="RAM (GB)" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
              <Legend />
              {Object.keys(providerColors).map(provider => {
                const filteredData = chartData.filter(item => item.provider === provider);
                return filteredData.length > 0 ? (
                  <Scatter 
                    key={provider} 
                    name={provider} 
                    data={filteredData} 
                    fill={providerColors[provider]} 
                  />
                ) : null;
              })}
            </ScatterChart>
          </ResponsiveContainer>
        );
        
      case 'radar':
        return (
          <ResponsiveContainer width="100%" height={500}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="name" />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              <Radar name="Price Efficiency" dataKey="price" stroke="#8884d8" fill="#8884d8" fillOpacity={0.2} />
              <Radar name="vCPU Power" dataKey="vCPUs" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.2} />
              <Radar name="RAM Capacity" dataKey="ram" stroke="#ffc658" fill="#ffc658" fillOpacity={0.2} />
              <Radar name="Cost per Core" dataKey="costPerCore" stroke="#ff8042" fill="#ff8042" fillOpacity={0.2} />
              <Radar name="Cost per GB" dataKey="costPerGB" stroke="#0088fe" fill="#0088fe" fillOpacity={0.2} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <div className="mb-4 md:mb-0">
          <h3 className="text-lg font-semibold text-slate-800">
            {chartType === 'radar' 
              ? 'Provider Comparison Radar' 
              : chartType === 'scatter' 
                ? 'vCPUs vs. Price Scatter Plot'
                : `${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart: ${metric.charAt(0).toUpperCase() + metric.slice(1)}`}
          </h3>
          <p className="text-sm text-slate-500">
            {chartType === 'radar' 
              ? 'Comparing providers across all metrics (higher is better)'
              : chartType === 'scatter'
                ? 'Comparing vCPUs to price across providers'
                : `Comparing ${metric} across cloud providers`}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <div className="inline-flex p-1 bg-slate-100 rounded-md">
            <button 
              onClick={() => setChartType('bar')} 
              className={`p-2 rounded ${chartType === 'bar' ? 'bg-white shadow-sm' : 'hover:bg-slate-200'}`}
              title="Bar Chart"
            >
              <BarChart2 className="h-5 w-5 text-slate-700" />
            </button>
            <button 
              onClick={() => setChartType('line')} 
              className={`p-2 rounded ${chartType === 'line' ? 'bg-white shadow-sm' : 'hover:bg-slate-200'}`}
              title="Line Chart"
            >
              <LineChartIcon className="h-5 w-5 text-slate-700" />
            </button>
            <button 
              onClick={() => setChartType('pie')} 
              className={`p-2 rounded ${chartType === 'pie' ? 'bg-white shadow-sm' : 'hover:bg-slate-200'}`}
              title="Pie Chart"
            >
              <PieChartIcon className="h-5 w-5 text-slate-700" />
            </button>
            <button 
              onClick={() => setChartType('scatter')} 
              className={`p-2 rounded ${chartType === 'scatter' ? 'bg-white shadow-sm' : 'hover:bg-slate-200'}`}
              title="Scatter Plot"
            >
              <Maximize className="h-5 w-5 text-slate-700" />
            </button>
            <button 
              onClick={() => setChartType('radar')} 
              className={`p-2 rounded ${chartType === 'radar' ? 'bg-white shadow-sm' : 'hover:bg-slate-200'}`}
              title="Radar Chart"
            >
              <Activity className="h-5 w-5 text-slate-700" />
            </button>
          </div>
          
          {chartType !== 'radar' && (
            <select 
              value={metric}
              onChange={(e) => setMetric(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="price">Price ($/hour)</option>
              <option value="costPerCore">Cost per Core</option>
              <option value="costPerGB">Cost per GB RAM</option>
              <option value="vCPUs">vCPUs</option>
              <option value="ram">RAM (GB)</option>
            </select>
          )}
        </div>
      </div>
      
      {chartData.length === 0 ? (
        <div className="h-80 flex items-center justify-center text-slate-400 flex-col">
          <Database className="h-12 w-12 mb-4" />
          <p>No data available for the selected chart type</p>
        </div>
      ) : (
        renderChart()
      )}
      
      <div className="mt-6 text-xs text-slate-500 text-center">
        {chartType === 'bar' && 'Showing top 5 instances per provider for better visibility'}
        {chartType === 'line' && 'Showing trend of pricing across top 5 instances per provider'}
        {chartType === 'pie' && 'Aggregated metrics by provider'}
        {chartType === 'scatter' && 'Each point represents an instance. Point size represents RAM capacity.'}
        {chartType === 'radar' && 'Higher values indicate better performance in each category'}
      </div>
    </div>
  );
}

export default PriceChart;