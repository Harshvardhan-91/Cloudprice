const express = require('express');
const providerRouter = express.Router();
const instancesRouter = express.Router();
const Instance = require('../models/Instance');
const cloudProviderService = require('../services/cloudProviderService');

// Provider Router: Handles /api/v1/providers endpoints
// Get all available regions for a provider
providerRouter.get('/:provider/regions', async (req, res) => {
  try {
    const { provider } = req.params;
    
    const regions = await Instance.distinct('region', { provider });
    
    res.json({
      status: 'success',
      data: regions
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Get instance categories for a provider
providerRouter.get('/:provider/categories', async (req, res) => {
  try {
    const { provider } = req.params;
    
    const categories = await Instance.distinct('category', { provider });
    
    res.json({
      status: 'success',
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Get instance types for a provider and region
providerRouter.get('/:provider/instances', async (req, res) => {
  try {
    const { provider } = req.params;
    const { region, category } = req.query;
    
    const filter = { provider };
    if (region) filter.region = region;
    if (category) filter.category = category;
    
    const instances = await Instance.find(filter)
      .select('instanceType specs pricing')
      .sort({ 'pricing.onDemand': 1 });
    
    res.json({
      status: 'success',
      data: instances
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Get pricing history for an instance type
providerRouter.get('/:provider/pricing-history', async (req, res) => {
  try {
    const { provider } = req.params;
    const { instanceType, region } = req.query;
    
    if (!instanceType || !region) {
      return res.status(400).json({
        status: 'error',
        message: 'Instance type and region are required'
      });
    }
    
    const instances = await Instance.find({
      provider,
      instanceType,
      region
    })
    .select('pricing lastUpdated')
    .sort({ lastUpdated: -1 })
    .limit(30); // Last 30 updates
    
    res.json({
      status: 'success',
      data: instances
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Instances Router: Handles /api/v1/instances endpoints
// Get instances for a provider (used by frontend Explore page)
instancesRouter.get('/:provider', async (req, res) => {
  try {
    const { provider } = req.params;
    const { refresh } = req.query;

    // Validate provider
    const validProviders = ['aws', 'gcp', 'azure'];
    if (!validProviders.includes(provider)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid provider. Must be one of: aws, gcp, azure'
      });
    }    let instances = [];
    
    // First try to get data from database
    try {
      instances = await Instance.find({ provider }).limit(100);
      console.log(`Found ${instances.length} ${provider} instances in database`);
    } catch (dbError) {
      console.warn('Database error:', dbError);
    }
    
    // If refresh is requested or no instances found in database, get from API
    if (refresh === 'true' || instances.length === 0) {
      console.log(`Fetching fresh data for ${provider} from API`);
      
      try {
        if (provider === 'aws') {
          instances = await cloudProviderService.fetchAWSInstances();
        } else if (provider === 'gcp') {
          instances = await cloudProviderService.fetchGCPInstances();
        } else if (provider === 'azure') {
          instances = await cloudProviderService.fetchAzureInstances();
        }
        
        console.log(`Fetched ${instances.length} instances from ${provider} API`);

        // Try to save to database if we have valid instances
        try {
          // Only save if we have actual instances (not dummy data)
          const isDummyData = 
            (provider === 'aws' && instances.length === 1 && instances[0].instanceType === 't2.micro') ||
            (provider === 'gcp' && instances.length === 1 && instances[0].instanceType === 'e2-micro') ||
            (provider === 'azure' && instances.length === 1 && instances[0].instanceType === 'D2s v3');
            
          if (instances.length > 0 && !isDummyData) {
            // Clear existing data for this provider to remove any stale data
            await Instance.deleteMany({ provider });
            await Instance.insertMany(instances);
            console.log(`Saved ${instances.length} ${provider} instances to database`);
          }
        } catch (saveError) {
          console.warn('Failed to save instances to database:', saveError);
        }
      } catch (fetchError) {
        console.error(`Error fetching ${provider} instances:`, fetchError);
      }
    }

    // Fetch the saved instances from the database - use a query parameter to limit results if too many
    const limit = parseInt(req.query.limit) || 100;
    const savedInstances = await Instance.find({ provider }).sort({ 'pricing.onDemand': 1 }).limit(limit);

    res.json({
      status: 'success',
      data: savedInstances
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = { providerRouter, instancesRouter };