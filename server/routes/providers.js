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

    // Validate provider
    const validProviders = ['aws', 'gcp', 'azure'];
    if (!validProviders.includes(provider)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid provider. Must be one of: aws, gcp, azure'
      });
    }

    // Fetch fresh data from the provider's API
    let instances;
    if (provider === 'aws') {
      instances = await cloudProviderService.fetchAWSInstances();
    } else if (provider === 'gcp') {
      instances = await cloudProviderService.fetchGCPInstances();
    } else if (provider === 'azure') {
      instances = await cloudProviderService.fetchAzureInstances();
    }

    // Clear existing data for this provider to remove any stale dummy data
    await Instance.deleteMany({ provider });

    // Save the new instances to the database
    if (instances && instances.length > 0) {
      await Instance.insertMany(instances);
    }

    // Fetch the saved instances from the database
    const savedInstances = await Instance.find({ provider }).sort({ 'pricing.onDemand': 1 });

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