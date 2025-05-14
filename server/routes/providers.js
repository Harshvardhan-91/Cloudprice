const express = require('express');
const router = express.Router();
const Instance = require('../models/Instance');

// Get all available regions for a provider
router.get('/:provider/regions', async (req, res) => {
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
router.get('/:provider/categories', async (req, res) => {
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
router.get('/:provider/instances', async (req, res) => {
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
router.get('/:provider/pricing-history', async (req, res) => {
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

module.exports = router; 