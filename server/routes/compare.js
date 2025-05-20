const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');

// Read allowed origins from environment variable (comma-separated list)
if (!process.env.FRONTEND_URL) {
  throw new Error('FRONTEND_URL environment variable is not set. Please set it to the allowed frontend origin(s).');
}
const ALLOWED_ORIGINS = process.env.FRONTEND_URL.split(',');

// Configure CORS to dynamically allow origins
router.use(cors({
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy: Origin ${origin} is not allowed. Allowed origins: ${ALLOWED_ORIGINS.join(', ')}`));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

const CLOUDPRICE_API_KEY = process.env.CLOUDPRICE_API_KEY;
const CLOUDPRICE_API_ENDPOINT = process.env.CLOUDPRICE_API_ENDPOINT;

// Simulated exchange rates (hardcoded for simplicity)
const EXCHANGE_RATES = {
  USD: 1,
  EUR: 0.85,
  GBP: 0.73,
  INR: 83.0,
};

// Helper function to fetch instances for a provider
const fetchInstancesForProvider = async (provider, queryParams) => {
  try {
    let url;
    if (provider === 'azure') {
      url = `${CLOUDPRICE_API_ENDPOINT}/api/v1/region_prices`;
    } else {
      const providerPaths = {
        'aws': 'aws/ec2/instances',
        'gcp': 'gcp/compute/instances',
      };
      const providerPath = providerPaths[provider] || provider;
      const query = new URLSearchParams(queryParams).toString();
      url = query ? `${CLOUDPRICE_API_ENDPOINT}/api/v2/${providerPath}?${query}` : `${CLOUDPRICE_API_ENDPOINT}/api/v2/${providerPath}`;
    }

    logger.info(`Fetching data for ${provider} from URL: ${url}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'subscription-key': CLOUDPRICE_API_KEY,
      },
    });

    if (!response.ok) {
      logger.error(`CloudPrice API error for ${provider}: ${response.status} ${response.statusText}`);
      return [];
    }

    const data = await response.json();
    logger.info(`Successfully fetched data for ${provider}`);

    const responseString = JSON.stringify(data, null, 2).substring(0, 1000);
    logger.info(`Raw response for ${provider} (first 1000 chars): ${responseString}`);

    let instances = [];

    if (provider === 'azure') {
      if (data && Array.isArray(data.PricesPerRegion)) {
        logger.info(`Found PricesPerRegion array for Azure`);
        instances = data.PricesPerRegion.map(item => ({
          id: uuidv4(),
          provider: provider,
          Region: item.regionId || 'unknown',
          PricePerHour: item.averagePrice || 0,
          InstanceType: 'N/A',
          ProcessorVCPUCount: 0,
          MemorySizeInMB: 0,
          GPUCount: 0,
          InstanceFamily: 'General',
          isRegionBased: true,
        }));
      } else {
        logger.warn(`Unexpected response format for ${provider}: Expected an object with PricesPerRegion array`);
        return [];
      }
    } else {
      logger.info(`Does data.Data.Items exist and is it an array? ${data.Data && data.Data.Items && Array.isArray(data.Data.Items)}`);
      if (data.Data && data.Data.Items && Array.isArray(data.Data.Items)) {
        logger.info(`Found instance array in data.Data.Items field`);
        instances = data.Data.Items.map(item => ({
          ...item,
          provider: provider,
          Region: item.Region || (data.Data && data.Data.Region) || 'unknown',
          isRegionBased: false,
        }));
      } else if (Array.isArray(data)) {
        logger.info(`Found instance array directly in data`);
        instances = data.map(item => ({
          ...item,
          provider: provider,
          Region: item.Region || 'unknown',
          isRegionBased: false,
        }));
      } else {
        logger.error(`Unexpected response format for ${provider}: No valid instance array found`);
        return [];
      }
    }

    // Simulate RDS instances for AWS (placeholder)
    if (provider === 'aws') {
      const rdsInstances = instances.slice(0, 2).map((item, index) => ({
        ...item,
        id: uuidv4(),
        InstanceType: `db.${item.InstanceType || 't3.micro'}`,
        InstanceFamily: 'RDS',
        PricePerHour: (item.PricePerHour || 0) * 1.2, // Simulate higher price for RDS
      }));
      instances = [...instances, ...rdsInstances];
    }

    logger.info(`Total instances fetched for ${provider}: ${instances.length}`);
    return instances;
  } catch (error) {
    logger.error(`Error fetching data for ${provider}: ${error.message}`, error);
    return [];
  }
};

// Aggregate region pricing for AWS and GCP
const aggregateRegionPricing = (instances) => {
  const regionMap = {};

  instances.forEach(item => {
    if (item.isRegionBased) return; // Skip Azure, already region-based

    const region = item.Region || 'unknown';
    if (!regionMap[region]) {
      regionMap[region] = {
        provider: item.provider,
        Region: region,
        totalPrice: 0,
        count: 0,
        averagePrice: 0,
      };
    }
    regionMap[region].totalPrice += item.PricePerHour || 0;
    regionMap[region].count += 1;
    regionMap[region].averagePrice = regionMap[region].totalPrice / regionMap[region].count;
  });

  return Object.values(regionMap).map(item => ({
    id: uuidv4(),
    provider: item.provider,
    Region: item.Region,
    averagePrice: item.averagePrice,
    isRegionBased: true,
    InstanceType: 'N/A',
    vCPUs: 0,
    ram: 0,
    GPUCount: 0,
    InstanceFamily: 'General',
  }));
};

// Proxy to CloudPrice API to fetch data for all providers
router.get('/', async (req, res) => {
  try {
    logger.info('Fetching data for all providers from CloudPrice API');

    const providers = req.query.providers
      ? req.query.providers.split(',')
      : ['aws', 'azure', 'gcp'];

    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const searchTerm = req.query.searchTerm || '';
    const instanceTypes = req.query.instanceTypes ? req.query.instanceTypes.split(',') : [];
    const currency = req.query.currency || 'USD';
    const sortCategory = req.query.sortCategory || 'instancePricing'; // New: sort category

    const queryParams = providers.map(provider => provider !== 'azure' ? { paymentType: 'OnDemand' } : {});
    const fetchPromises = providers.map((provider, index) =>
      fetchInstancesForProvider(provider, queryParams[index])
    );
    const results = await Promise.all(fetchPromises);

    let combinedInstances = results.flat();

    // Apply search filter
    if (searchTerm) {
      combinedInstances = combinedInstances.filter(item =>
        (item.InstanceType || 'N/A').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.Region || 'unknown').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.provider || 'unknown').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply instance types filter
    if (instanceTypes.length > 0) {
      combinedInstances = combinedInstances.filter(item => {
        if (item.isRegionBased) return true;
        const instanceTypePrefix = (item.InstanceType || '').split('.')[0].toLowerCase();
        return instanceTypes.some(type => instanceTypePrefix === type.toLowerCase());
      });
    }

    // Apply filters (vCPUs, RAM, GPU, Region)
    if (req.query.minCpu || req.query.maxCpu || req.query.minMemory || req.query.maxMemory || req.query.gpu || req.query.region) {
      const minVCPUs = parseInt(req.query.minCpu) || 0;
      const maxVCPUs = parseInt(req.query.maxCpu) || Infinity;
      const minRam = parseInt(req.query.minMemory) || 0;
      const maxRam = parseInt(req.query.maxMemory) || Infinity;
      const gpu = req.query.gpu === 'true';
      const region = req.query.region;

      combinedInstances = combinedInstances.filter(item => {
        if (item.isRegionBased) {
          const matchesRegion = region ? (item.Region || 'unknown') === region : true;
          return matchesRegion;
        }

        const vCPUs = item.ProcessorVCPUCount || item.vCPUs || 0;
        const ram = (item.MemorySizeInMB || item.ram || 0) / 1024;
        const hasGpu = (item.GPUCount || item.GPU || 0) > 0;
        const matchesRegion = region ? (item.Region || 'unknown') === region : true;

        return (
          vCPUs >= minVCPUs &&
          vCPUs <= maxVCPUs &&
          ram >= minRam &&
          ram <= maxRam &&
          (gpu ? hasGpu : true) &&
          matchesRegion
        );
      });
    }

    // Handle sorting category
    let transformedData = [];
    if (sortCategory === 'regionPricing') {
      // Aggregate region pricing for AWS and GCP, Azure already has this
      const regionPricingData = aggregateRegionPricing(combinedInstances.filter(item => !item.isRegionBased));
      const azureRegionData = combinedInstances.filter(item => item.isRegionBased && item.provider === 'azure');
      transformedData = [...regionPricingData, ...azureRegionData].map(item => ({
        id: item.id,
        provider: item.provider.toLowerCase(),
        region: item.Region,
        averagePrice: item.averagePrice || item.PricePerHour,
        isRegionBased: true,
      }));
    } else if (sortCategory === 'spotPrice') {
      transformedData = combinedInstances
        .filter(item => !item.isRegionBased) // Spot pricing for instances only
        .map(item => {
          const price = item.PricePerHour || item.price || item.pricing?.onDemand || 0;
          const spotPrice = item.spot || (price * 0.7); // Simulate spot price if not available
          return {
            id: item.id,
            provider: item.provider.toLowerCase(),
            instanceType: item.InstanceType || 'N/A',
            region: item.Region || 'unknown',
            spotPrice: spotPrice,
            isRegionBased: false,
          };
        });
    } else if (sortCategory === 'pricePerPerformance') {
      transformedData = combinedInstances
        .filter(item => !item.isRegionBased)
        .map(item => {
          const vCPUs = item.ProcessorVCPUCount || item.vCPUs || 0;
          const ram = (item.MemorySizeInMB || item.ram || 0) / 1024;
          const price = item.PricePerHour || item.price || item.pricing?.onDemand || 0;
          const costPerVCPU = vCPUs > 0 ? price / vCPUs : 0;
          const costPerGB = ram > 0 ? price / ram : 0;
          return {
            id: item.id,
            provider: item.provider.toLowerCase(),
            instanceType: item.InstanceType || 'N/A',
            region: item.Region || 'unknown',
            vCPUs: vCPUs,
            ram: ram,
            price: price,
            costPerVCPU: costPerVCPU,
            costPerGB: costPerGB,
            performanceScore: (vCPUs * 0.6 + ram * 0.4) / (price || 1), // Simplified performance score
            isRegionBased: false,
          };
        });
    } else {
      // Default: instancePricing
      transformedData = combinedInstances.map(item => {
        const provider = item.provider ? item.provider.toLowerCase() : 'unknown';
        const vCPUs = item.ProcessorVCPUCount || item.vCPUs || 0;
        const ram = item.MemorySizeInMB || item.ram || 0;
        const price = item.PricePerHour || item.price || item.pricing?.onDemand || 0;

        return {
          id: item.id || uuidv4(),
          provider: provider,
          instanceType: item.InstanceType || 'N/A',
          region: item.Region || 'unknown',
          vCPUs: vCPUs,
          ram: ram / 1024,
          price: price,
          costPerCore: vCPUs > 0 ? price / vCPUs : 0,
          costPerGB: ram > 0 ? price / (ram / 1024) : 0,
          category: item.InstanceFamily || 'general',
          gpu: (item.GPUCount || item.GPU || 0) > 0,
          gpuType: item.GPUType || undefined,
          isRegionBased: item.isRegionBased || false,
          isRDS: item.InstanceFamily === 'RDS', // Flag for RDS instances
          specs: {
            vCPUs: vCPUs,
            memory: ram / 1024,
            architecture: item.ProcessorArchitecture?.[0] || 'x86_64',
            networkThroughput: item.NetworkingPerformance || 'Up to 10 Gbps',
            storage: item.InstanceStorage || 'EBS Only',
            storageType: item.StorageType || 'Unknown',
            cpuModel: item.CPUModel || 'Unknown',
            gpu: (item.GPUCount || item.GPU || 0) > 0,
            gpuType: item.GPUType || undefined,
          },
          pricing: {
            onDemand: price,
            reserved: item.reserved || undefined,
            spot: item.spot || (price * 0.7), // Simulate spot price
          },
          costPerVCPU: vCPUs > 0 ? price / vCPUs : 0,
          costPerGB: ram > 0 ? price / (ram / 1024) : 0,
        };
      });
    }

    // Apply currency conversion (for Azure exchange rates)
    transformedData = transformedData.map(item => {
      let price = item.price || item.averagePrice || item.spotPrice || 0;
      const convertedPrice = price * (EXCHANGE_RATES[currency] || 1);
      return {
        ...item,
        price: item.price ? convertedPrice : item.price,
        averagePrice: item.averagePrice ? convertedPrice : item.averagePrice,
        spotPrice: item.spotPrice ? convertedPrice : item.spotPrice,
        costPerCore: item.costPerCore ? item.costPerCore * (EXCHANGE_RATES[currency] || 1) : item.costPerCore,
        costPerGB: item.costPerGB ? item.costPerGB * (EXCHANGE_RATES[currency] || 1) : item.costPerGB,
        costPerVCPU: item.costPerVCPU ? item.costPerVCPU * (EXCHANGE_RATES[currency] || 1) : item.costPerVCPU,
        currency: currency,
      };
    });

    // Apply sorting
    if (req.query.sortBy && req.query.sortOrder) {
      const sortKey = req.query.sortBy === 'pricing.onDemand' ? 'price' : req.query.sortBy;
      const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
      transformedData.sort((a, b) => {
        const aValue = a[sortKey] || 0;
        const bValue = b[sortKey] || 0;
        return (aValue - bValue) * sortOrder;
      });
    }

    // Apply pagination
    const totalItems = transformedData.length;
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (page - 1) * limit;
    const paginatedData = transformedData.slice(startIndex, startIndex + limit);

    res.json({
      data: paginatedData,
      pagination: { pages: totalPages },
      currency: currency,
    });
  } catch (error) {
    logger.error('Error fetching data from CloudPrice API:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch data from CloudPrice API',
      error: error.message,
    });
  }
});

module.exports = router;