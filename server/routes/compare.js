const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

const CLOUDPRICE_API_KEY = process.env.CLOUDPRICE_API_KEY;
const CLOUDPRICE_API_ENDPOINT = process.env.CLOUDPRICE_API_ENDPOINT;

// Helper function to fetch instances for a provider
const fetchInstancesForProvider = async (provider) => {
  try {
    // Map provider to the correct endpoint path
    const providerPaths = {
      'aws': 'aws/ec2/instances',
      'gcp': 'gcp/compute/instances',
      'azure': 'azure/regions' // Updated to the correct Azure endpoint
    };
    
    const providerPath = providerPaths[provider] || provider;
    const url = `${CLOUDPRICE_API_ENDPOINT}/api/v2/${providerPath}`;
    
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

    // Log raw response (limit to first 1000 characters to avoid truncation)
    const responseString = JSON.stringify(data, null, 2).substring(0, 1000);
    logger.info(`Raw response for ${provider} (first 1000 chars): ${responseString}`);

    // Handle response format based on provider
    let instances = [];
    
    if (provider === 'azure') {
      // Azure endpoint returns region data, not instances
      logger.info(`Does data.Data exist and is it an array? ${data.Data && Array.isArray(data.Data)}`);
      if (data.Data && Array.isArray(data.Data)) {
        logger.info(`Found region data in data.Data field for Azure`);
        // Transform region data into a pseudo-instance format
        instances = data.Data.map(region => ({
          provider: provider,
          Region: region.Region || 'unknown',
          AveragePricePerHour: region.AveragePricePerHour || 0,
          Currency: region.Currency || 'USD',
          // Pseudo-instance fields to match the schema
          InstanceType: `avg-${region.Region}`, // Placeholder instance type
          InstanceFamily: 'Region Average',
          ProcessorVCPUCount: 0, // Not available in region data
          MemorySizeInMB: 0,    // Not available in region data
          GPUCount: 0,
          GPUType: null,
          ProcessorArchitecture: ['x86_64'] // Default value
        }));
      } else {
        logger.error(`Unexpected response format for ${provider}: No valid region array found`);
        return [];
      }
    } else {
      // AWS and GCP endpoints return instance data
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

    return instances;
  } catch (error) {
    logger.error(`Error fetching data for ${provider}:`, error);
    return [];
  }
};

// Proxy to CloudPrice API to fetch data for all providers
router.get('/', async (req, res) => {
  try {
    logger.info('Fetching data for all providers from CloudPrice API');

    // Extract providers from query (default to all if not specified)
    const providers = req.query.providers
      ? req.query.providers.split(',')
      : ['aws', 'azure', 'gcp'];

    // Fetch data for each provider concurrently
    const fetchPromises = providers.map(provider =>
      fetchInstancesForProvider(provider)
    );
    const results = await Promise.all(fetchPromises);

    // Combine results from all providers
    let combinedInstances = results.flat();

    // Filter instances based on query parameters (client-side filtering)
    if (req.query.minCpu || req.query.maxCpu || req.query.minMemory || req.query.maxMemory) {
      const minVCPUs = parseInt(req.query.minCpu) || 0;
      const maxVCPUs = parseInt(req.query.maxCpu) || Infinity;
      const minRam = parseInt(req.query.minMemory) || 0;
      const maxRam = parseInt(req.query.maxMemory) || Infinity;

      combinedInstances = combinedInstances.filter(item => {
        const vCPUs = item.ProcessorVCPUCount || item.vCPUs || item.specs?.vCPUs || 0;
        const ram = (item.MemorySizeInMB || item.ram || item.specs?.memory || 0) / 1024;
        return vCPUs >= minVCPUs && vCPUs <= maxVCPUs && ram >= minRam && ram <= maxRam;
      });
    }

    // If no instances are returned, provide a fallback response
    if (combinedInstances.length === 0) {
      logger.warn('No data fetched from any provider');
      return res.status(200).json([]);
    }

    // Transform the combined data to match the expected schema
    const transformedData = combinedInstances.map(item => {
      const provider = item.provider ? item.provider.toLowerCase() : 'unknown';
      const vCPUs = item.ProcessorVCPUCount || item.vCPUs || item.specs?.vCPUs || 0;
      const ram = item.MemorySizeInMB || item.ram || item.specs?.memory || 0;
      const price = item.AveragePricePerHour || item.PricePerHour || item.price || item.pricing?.onDemand || 0;

      return {
        id: item.id || uuidv4(),
        provider: provider,
        instanceType: item.InstanceType || 'unknown',
        region: item.Region || 'unknown',
        vCPUs: vCPUs,
        ram: ram / 1024, // Convert MB to GB
        price: price,
        costPerCore: vCPUs > 0 ? price / vCPUs : 0,
        costPerGB: ram > 0 ? price / (ram / 1024) : 0,
        category: item.InstanceFamily || 'general',
        gpu: (item.GPUCount || item.GPU || item.specs?.gpu || 0) > 0,
        gpuType: item.GPUType || item.specs?.gpuType || undefined,
        specs: {
          architecture: item.ProcessorArchitecture?.[0] || 'x86_64',
          networkThroughput: item.NetworkingPerformance || 'Up to 10 Gbps',
          storage: item.InstanceStorage || 'EBS Only',
        },
        reserved: item.reserved || item.pricing?.reserved || undefined,
        spot: item.spot || item.pricing?.spot || undefined,
      };
    });

    // Apply sorting if specified (client-side sorting since API may not support it)
    if (req.query.sortBy && req.query.sortOrder) {
      const sortKey = req.query.sortBy === 'pricing.onDemand' ? 'price' : req.query.sortBy;
      const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
      transformedData.sort((a, b) => {
        const aValue = a[sortKey] || 0;
        const bValue = b[sortKey] || 0;
        return (aValue - bValue) * sortOrder;
      });
    }

    res.json(transformedData);
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