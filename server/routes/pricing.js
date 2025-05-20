const express = require('express');
const router = express.Router();
const Instance = require('../models/Instance');
const logger = require('../utils/logger');

// Get AWS instances
router.get('/aws', async (req, res) => {
  try {
    logger.info('Fetching AWS instances');
    
    // Try to get instances from database
    const instances = await Instance.find({ provider: 'aws' }).limit(100);
    logger.info(`Found ${instances.length} AWS instances in database`);

    if (instances.length === 0) {
      logger.info('No AWS instances found in database');
      return res.status(404).json({
        status: 'error',
        message: 'No AWS instances found. Please use the /compare endpoint to fetch data via the CloudPrice API.',
      });
    }
    
    res.json({ status: 'success', data: instances });
  } catch (error) {
    logger.error('Error fetching AWS instances:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Get GCP instances
router.get('/gcp', async (req, res) => {
  try {
    logger.info('Fetching GCP instances');
    
    // Try to get instances from database
    const instances = await Instance.find({ provider: 'gcp' }).limit(100);
    logger.info(`Found ${instances.length} GCP instances in database`);

    if (instances.length === 0) {
      logger.info('No GCP instances found in database');
      return res.status(404).json({
        status: 'error',
        message: 'No GCP instances found. Please use the /compare endpoint to fetch data via the CloudPrice API.',
      });
    }
    
    res.json({ status: 'success', data: instances });
  } catch (error) {
    logger.error('Error fetching GCP instances:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Get Azure instances
router.get('/azure', async (req, res) => {
  try {
    logger.info('Fetching Azure instances');
    
    // Try to get instances from database
    const instances = await Instance.find({ provider: 'azure' }).limit(100);
    logger.info(`Found ${instances.length} Azure instances in database`);

    if (instances.length === 0) {
      logger.info('No Azure instances found in database');
      return res.status(404).json({
        status: 'error',
        message: 'No Azure instances found. Please use the /compare endpoint to fetch data via the CloudPrice API.',
      });
    }
    
    res.json({ status: 'success', data: instances });
  } catch (error) {
    logger.error('Error fetching Azure instances:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Get instance details by ID
router.get('/:id', async (req, res) => {
  try {
    logger.info(`Fetching instance with ID: ${req.params.id}`);
    const instance = await Instance.findById(req.params.id);
    if (!instance) {
      logger.warn(`Instance not found: ${req.params.id}`);
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
    logger.error(`Error fetching instance ${req.params.id}:`, error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

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

    logger.info('Fetching instances with filters:', { provider, region, minCpu, maxCpu, minMemory, maxMemory, category, gpu });

    // Build filter object
    const filter = {};
    if (provider) filter.provider = provider.toLowerCase();
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

    logger.info(`Found ${instances.length} instances with filters`);
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
    logger.error('Error fetching instances:', error);
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

    logger.info('Comparing instances with specs:', { vCPUs, memory, region, category });

    const filter = {
      'specs.vCPUs': vCPUs,
      'specs.memory': memory,
      region
    };
    if (category) filter.category = category;

    const instances = await Instance.find(filter)
      .sort({ 'pricing.onDemand': 1 })
      .limit(10);

    logger.info(`Found ${instances.length} instances for comparison`);
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
    logger.error('Error comparing instances:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router;