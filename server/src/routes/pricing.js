const express = require('express');
const router = express.Router();
const Instance = require('../models/Instance');

// Get all instances with optional filtering
router.get('/', async (req, res) => {
  try {
    const {
      provider,
      region,
      minCpu,
      maxCpu,
      minMemory,
      maxMemory,
      category,
      gpu,
      sortBy = 'onDemand',
      sortOrder = 'asc'
    } = req.query;

    // Build filter object
    const filter = {};
    if (provider) filter.provider = provider;
    if (region) filter.region = region;
    if (category) filter.category = category;
    if (gpu) filter['specs.gpu'] = gpu === 'true';

    // Add CPU and memory range filters
    if (minCpu || maxCpu) {
      filter['specs.vCPUs'] = {};
      if (minCpu) filter['specs.vCPUs'].$gte = Number(minCpu);
      if (maxCpu) filter['specs.vCPUs'].$lte = Number(maxCpu);
    }

    if (minMemory || maxMemory) {
      filter['specs.memory'] = {};
      if (minMemory) filter['specs.memory'].$gte = Number(minMemory);
      if (maxMemory) filter['specs.memory'].$lte = Number(maxMemory);
    }

    // Build sort object
    const sort = {};
    sort[`pricing.${sortBy}`] = sortOrder === 'asc' ? 1 : -1;

    const instances = await Instance.find(filter)
      .sort(sort)
      .limit(100);

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

// Get instance details by ID
router.get('/:id', async (req, res) => {
  try {
    const instance = await Instance.findById(req.params.id);
    if (!instance) {
      return res.status(404).json({
        status: 'error',
        message: 'Instance not found'
      });
    }
    res.json({
      status: 'success',
      data: instance
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Get price comparison for specific specs
router.post('/compare', async (req, res) => {
  try {
    const { vCPUs, memory, region, category } = req.body;

    const filter = {
      'specs.vCPUs': vCPUs,
      'specs.memory': memory,
      region
    };
    if (category) filter.category = category;

    const instances = await Instance.find(filter)
      .sort({ 'pricing.onDemand': 1 })
      .limit(10);

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