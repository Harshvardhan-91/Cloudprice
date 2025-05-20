const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

const CLOUDPRICE_API_KEY = process.env.CLOUDPRICE_API_KEY;
const CLOUDPRICE_API_ENDPOINT = process.env.CLOUDPRICE_API_ENDPOINT;

// Helper function to fetch instances for a provider
const fetchInstancesForProvider = async (provider, queryParams) => {
  try {
    let url;
    if (provider === 'azure') {
      // Use the v1 endpoint for Azure to fetch average prices per region
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
      // Expecting data to have a PricesPerRegion array
      if (data && Array.isArray(data.PricesPerRegion)) {
        logger.info(`Found PricesPerRegion array for Azure`);
        instances = data.PricesPerRegion.map(item => ({
          id: uuidv4(),
          provider: provider,
          Region: item.regionId || 'unknown', // Use regionId as the region
          PricePerHour: item.averagePrice || 0, // Use averagePrice as the price
          InstanceType: 'N/A', // Placeholder since we don't have instance data
          ProcessorVCPUCount: 0, // Placeholder
          MemorySizeInMB: 0, // Placeholder
          GPUCount: 0, // Placeholder
          InstanceFamily: 'General', // Placeholder
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
        }));
      } else if (Array.isArray(data)) {
        logger.info(`Found instance array directly in data`);
        instances = data.map(item => ({
          ...item,
          provider: provider,
          Region: item.Region || 'unknown',
        }));
      } else {
        logger.error(`Unexpected response format for ${provider}: No valid instance array found`);
        return [];
      }
    }

    logger.info(`Total instances fetched for ${provider}: ${instances.length}`);
    return instances;
  } catch (error) {
    logger.error(`Error fetching data for ${provider}: ${error.message}`, error);
    return [];
  }
};

// Proxy to CloudPrice API to fetch data for all providers
router.get('/', async (req, res) => {
  try {
    logger.info('Fetching data for all providers from CloudPrice API');

    const providers = req.query.providers
      ? req.query.providers.split(',')
      : ['aws', 'azure', 'gcp'];

    const page = parseInt(req.query.page) || 1;
    const limit = 10; // Items per page
    const searchTerm = req.query.searchTerm || '';

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

    // Apply filters
    if (req.query.minCpu || req.query.maxCpu || req.query.minMemory || req.query.maxMemory || req.query.gpu || req.query.region) {
      const minVCPUs = parseInt(req.query.minCpu) || 0;
      const maxVCPUs = parseInt(req.query.maxCpu) || Infinity;
      const minRam = parseInt(req.query.minMemory) || 0;
      const maxRam = parseInt(req.query.maxMemory) || Infinity;
      const gpu = req.query.gpu === 'true';
      const region = req.query.region;

      combinedInstances = combinedInstances.filter(item => {
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

    const transformedData = combinedInstances.map(item => {
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
        specs: {
          vCPUs: vCPUs,
          memory: ram / 1024,
          architecture: item.ProcessorArchitecture?.[0] || 'x86_64',
          networkThroughput: item.NetworkingPerformance || 'Up to 10 Gbps',
          storage: item.InstanceStorage || 'EBS Only',
          gpu: (item.GPUCount || item.GPU || 0) > 0,
          gpuType: item.GPUType || undefined,
        },
        pricing: {
          onDemand: price,
          reserved: item.reserved || undefined,
          spot: item.spot || undefined,
        },
        costPerVCPU: vCPUs > 0 ? price / vCPUs : 0,
        costPerGB: ram > 0 ? price / (ram / 1024) : 0,
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
      pagination: { pages: totalPages }
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