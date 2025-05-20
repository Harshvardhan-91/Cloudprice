const express = require('express');
const providerRouter = express.Router();
const instancesRouter = express.Router();
const Instance = require('../models/Instance');

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

    // Try to get instances from database
    const limit = parseInt(req.query.limit) || 100;
    const instances = await Instance.find({ provider }).sort({ 'pricing.onDemand': 1 }).limit(limit);

    if (instances.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No instances found in the database. Please use the /compare endpoint to fetch data via the CloudPrice API.',
      });
    }

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

module.exports = { providerRouter, instancesRouter };