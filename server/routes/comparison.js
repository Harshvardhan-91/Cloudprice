const express = require('express');
const router = express.Router();
const Instance = require('../models/Instance');

// Get detailed comparison between instances
router.post('/detailed', async (req, res) => {
  try {
    const { instanceIds } = req.body;
    
    if (!instanceIds || !Array.isArray(instanceIds)) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide an array of instance IDs'
      });
    }

    const instances = await Instance.find({
      _id: { $in: instanceIds }
    });

    if (instances.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No instances found'
      });
    }

    // Calculate cost per vCPU and cost per GB of memory
    const comparison = instances.map(instance => ({
      ...instance.toObject(),
      costPerVCPU: instance.pricing.onDemand / instance.specs.vCPUs,
      costPerGB: instance.pricing.onDemand / instance.specs.memory
    }));

    res.json({
      status: 'success',
      data: comparison
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Get cost savings analysis
router.post('/savings', async (req, res) => {
  try {
    const { instanceId, usageHours } = req.body;

    const instance = await Instance.findById(instanceId);
    if (!instance) {
      return res.status(404).json({
        status: 'error',
        message: 'Instance not found'
      });
    }

    const monthlyHours = usageHours || 730; // Default to 730 hours (full month)
    const onDemandCost = instance.pricing.onDemand * monthlyHours;
    const reservedCost = instance.pricing.reserved ? instance.pricing.reserved * monthlyHours : null;
    const spotCost = instance.pricing.spot ? instance.pricing.spot * monthlyHours : null;

    const savings = {
      onDemand: onDemandCost,
      reserved: reservedCost ? {
        cost: reservedCost,
        savings: onDemandCost - reservedCost,
        savingsPercentage: ((onDemandCost - reservedCost) / onDemandCost) * 100
      } : null,
      spot: spotCost ? {
        cost: spotCost,
        savings: onDemandCost - spotCost,
        savingsPercentage: ((onDemandCost - spotCost) / onDemandCost) * 100
      } : null
    };

    res.json({
      status: 'success',
      data: savings
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Get similar instances across providers
router.post('/similar', async (req, res) => {
  try {
    const { vCPUs, memory, region } = req.body;

    const instances = await Instance.find({
      'specs.vCPUs': vCPUs,
      'specs.memory': memory,
      region
    }).sort({ 'pricing.onDemand': 1 });

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