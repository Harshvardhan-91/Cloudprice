const express = require('express');
const router = express.Router();
const Instance = require('../models/Instance');
const logger = require('../utils/logger');

// Get instances across all providers with advanced filtering
router.get('/', async (req, res) => {
  try {
    const { 
      providers, 
      region, 
      minCpu, 
      maxCpu, 
      minMemory, 
      maxMemory,
      minPrice,
      maxPrice,
      category,
      gpu,
      searchTerm
    } = req.query;
    
    // Build filter based on query parameters
    const filter = {};
    
    // Handle multiple providers
    if (providers) {
      const providerList = providers.split(',');
      filter.provider = { $in: providerList };
    }
    
    if (region) {
      // Handle region pattern matching (since different providers format regions differently)
      filter.region = { $regex: region, $options: 'i' };
    }
    
    if (minCpu || maxCpu) {
      filter['specs.vCPUs'] = {};
      if (minCpu) filter['specs.vCPUs'].$gte = parseInt(minCpu);
      if (maxCpu) filter['specs.vCPUs'].$lte = parseInt(maxCpu);
    }
      if (minMemory || maxMemory) {
      filter['specs.memory'] = {};
      if (minMemory) filter['specs.memory'].$gte = parseFloat(minMemory);
      if (maxMemory) filter['specs.memory'].$lte = parseFloat(maxMemory);
    }
    
    if (minPrice || maxPrice) {
      filter['pricing.onDemand'] = {};
      if (minPrice) filter['pricing.onDemand'].$gte = parseFloat(minPrice);
      if (maxPrice) filter['pricing.onDemand'].$lte = parseFloat(maxPrice);
    }
    
    // If GPU filter is specified
    if (gpu !== undefined) {
      filter['specs.gpu'] = gpu === 'true';
    }
    
    if (category) {
      filter.category = category;
    }
    
    if (gpu) {
      filter['specs.gpu'] = gpu === 'true';
    }
    
    // Search by instance type
    if (searchTerm) {
      filter.instanceType = { $regex: searchTerm, $options: 'i' };
    }
    
    logger.info('Comparison filter:', filter);
    
    // Get sort parameters or use defaults
    const sortField = req.query.sortBy || 'pricing.onDemand';
    const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
    const sort = { [sortField]: sortOrder };
    
    // Apply pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;
      // Execute query
    const instances = await Instance.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);
      
    // If no instances found in database, try to fetch directly from provider APIs
    if (!instances || instances.length === 0) {
      logger.info('No instances found in database, fetching from provider APIs');
      
      const cloudProviderService = require('../services/cloudProviderService');
      const providerList = filter.provider?.$in || ['aws', 'azure', 'gcp'];
      
      let allFetchedInstances = [];
      
      // Fetch instances from each provider
      for (const provider of providerList) {
        try {
          let providerInstances = [];
          
          if (provider === 'aws') {
            providerInstances = await cloudProviderService.fetchAWSInstances();
          } else if (provider === 'gcp') {
            providerInstances = await cloudProviderService.fetchGCPInstances();
          } else if (provider === 'azure') {
            providerInstances = await cloudProviderService.fetchAzureInstances();
          }
          
          logger.info(`Fetched ${providerInstances.length} instances from ${provider} API`);
          allFetchedInstances = [...allFetchedInstances, ...providerInstances];
        } catch (error) {
          logger.error(`Error fetching instances from ${provider} API:`, error);
        }
      }
      
      // If we fetched instances, apply filters and processing
      if (allFetchedInstances.length > 0) {
        // Filter the fetched instances based on our criteria
        const filteredInstances = allFetchedInstances.filter(instance => {
          // Apply vCPU filter
          if (filter['specs.vCPUs']) {
            if (filter['specs.vCPUs'].$gte && instance.specs.vCPUs < filter['specs.vCPUs'].$gte) return false;
            if (filter['specs.vCPUs'].$lte && instance.specs.vCPUs > filter['specs.vCPUs'].$lte) return false;
          }
          
          // Apply memory filter
          if (filter['specs.memory']) {
            if (filter['specs.memory'].$gte && instance.specs.memory < filter['specs.memory'].$gte) return false;
            if (filter['specs.memory'].$lte && instance.specs.memory > filter['specs.memory'].$lte) return false;
          }
          
          // Apply GPU filter
          if (filter['specs.gpu'] !== undefined && instance.specs.gpu !== filter['specs.gpu']) return false;
          
          // Apply category filter
          if (filter.category && instance.category !== filter.category) return false;
          
          // Apply search term filter
          if (filter.instanceType && filter.instanceType.$regex) {
            const regex = new RegExp(filter.instanceType.$regex, filter.instanceType.$options || '');
            if (!regex.test(instance.instanceType)) return false;
          }
          
          return true;
        });
        
        // Apply derived fields
        const processedFetchedInstances = filteredInstances.map(instance => {
          const data = typeof instance.toObject === 'function' ? instance.toObject() : instance;
          data.costPerVCPU = data.pricing.onDemand / data.specs.vCPUs;
          data.costPerGB = data.pricing.onDemand / data.specs.memory;
          return data;
        });
        
        // Use the fetched instances for our response
        return res.json({
          status: 'success',
          data: processedFetchedInstances,
          pagination: {
            total: processedFetchedInstances.length,
            page: 1,
            limit: processedFetchedInstances.length,
            pages: 1,
            note: 'Results fetched directly from cloud provider APIs'
          }
        });
      }
    }
    
    // Process data to add derived fields for easier comparison
    const processedInstances = instances.map(instance => {
      const data = instance.toObject();
      data.costPerVCPU = data.pricing.onDemand / data.specs.vCPUs;
      data.costPerGB = data.pricing.onDemand / data.specs.memory;
      return data;
    });
    
    // Get total count for pagination
    const total = await Instance.countDocuments(filter);
    
    res.json({
      status: 'success',
      data: processedInstances,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Error in comparison route:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Get best price comparison for specific configuration
router.post('/best-price', async (req, res) => {
  try {
    const { vCPUs, memory, gpu } = req.body;
    
    if (!vCPUs || !memory) {
      return res.status(400).json({
        status: 'error',
        message: 'vCPUs and memory are required parameters'
      });
    }
    
    // Find instances with the closest specs
    const filter = {
      'specs.vCPUs': { $gte: vCPUs * 0.8, $lte: vCPUs * 1.2 },
      'specs.memory': { $gte: memory * 0.8, $lte: memory * 1.2 }
    };
    
    if (gpu !== undefined) {
      filter['specs.gpu'] = gpu === true;
    }
    
    const instances = await Instance.find(filter)
      .sort({ 'pricing.onDemand': 1 })
      .limit(10);
    
    // Calculate price-performance metrics
    const results = instances.map(instance => {
      const data = instance.toObject();
      data.costPerVCPU = data.pricing.onDemand / data.specs.vCPUs;
      data.costPerGB = data.pricing.onDemand / data.specs.memory;
      data.pricePerformanceScore = data.specs.vCPUs * data.specs.memory / (data.pricing.onDemand * 1000);
      return data;
    });
    
    // Sort by best price-performance
    results.sort((a, b) => b.pricePerformanceScore - a.pricePerformanceScore);
    
    res.json({
      status: 'success',
      data: results
    });
  } catch (error) {
    logger.error('Error in best-price comparison:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Get side-by-side comparison of specific instances
router.post('/side-by-side', async (req, res) => {
  try {
    const { instanceIds } = req.body;
    
    if (!instanceIds || !Array.isArray(instanceIds)) {
      return res.status(400).json({
        status: 'error',
        message: 'instanceIds must be an array of instance IDs'
      });
    }
    
    const instances = await Instance.find({
      _id: { $in: instanceIds }
    });
    
    if (instances.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No matching instances found'
      });
    }
    
    // Enhance with comparison metrics
    const comparison = instances.map(instance => {
      const data = instance.toObject();
      data.costPerVCPU = data.pricing.onDemand / data.specs.vCPUs;
      data.costPerGB = data.pricing.onDemand / data.specs.memory;
      data.monthlyCost = data.pricing.onDemand * 730; // ~730 hours in a month
      return data;
    });
    
    res.json({
      status: 'success',
      data: comparison
    });
  } catch (error) {
    logger.error('Error in side-by-side comparison:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router;
