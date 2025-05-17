require('dotenv').config();
const mongoose = require('mongoose');
const fetch = require('node-fetch');
const logger = require('../utils/logger');
const Instance = require('../models/Instance');

// MongoDB connection
async function connectToDatabase() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/cloudprice';
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    logger.info('Connected to MongoDB');
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// Fetch GCP instances using public API
async function fetchGCPInstances() {
  try {
    logger.info('Fetching GCP instances using public pricing API');
    const gcpPricingUrl = 'https://cloudpricingcalculator.appspot.com/static/data/pricelist.json';
    const response = await fetch(gcpPricingUrl);
    
    if (!response.ok) {
      throw new Error(`GCP pricing API returned ${response.status}: ${response.statusText}`);
    }
    
    const pricingData = await response.json();
    logger.info('GCP pricing data fetched successfully');
    
    if (!pricingData || !pricingData.gcp_price_list || !pricingData.gcp_price_list['CP-COMPUTEENGINE-VMIMAGE-N1-STANDARD']) {
      logger.warn('Invalid GCP pricing data structure');
      return [];
    }
    
    // Map instance types and pricing
    const standardVMs = pricingData.gcp_price_list['CP-COMPUTEENGINE-VMIMAGE-N1-STANDARD'];
    const e2VMs = pricingData.gcp_price_list['CP-COMPUTEENGINE-VMIMAGE-E2-STANDARD'] || {};
    
    // Merge different instance types
    const instances = [];
    
    // Process regions we want to include
    const regions = ['us-central1', 'us-east1', 'europe-west1', 'asia-east1'];
    
    // Process N1 Standard instances
    Object.entries(standardVMs).forEach(([key, price]) => {
      if (key.includes('PREEMPTIBLE') || !key.includes('us')) return;
      
      // Extract core count from key (e.g., "1-YEAR-us-central1" -> 1)
      const corePart = key.split('-')[0];
      const cores = parseInt(corePart);
      if (isNaN(cores)) return;
      
      regions.forEach(region => {
        const regionPrice = price;
        if (!regionPrice) return;
        
        instances.push({
          provider: 'gcp',
          instanceType: `n1-standard-${cores}`,
          region,
          specs: {
            vCPUs: cores,
            memory: cores * 3.75, // N1 Standard has 3.75GB per core
            storage: 0,
            gpu: false,
            gpuType: null,
            gpuCount: 0
          },
          pricing: {
            onDemand: parseFloat(regionPrice),
            reserved: 0,
            spot: 0
          },
          category: 'general',
          lastUpdated: new Date()
        });
      });
    });
    
    // Add E2 instances (more cost-effective general-purpose)
    Object.entries(e2VMs).forEach(([key, price]) => {
      if (key.includes('PREEMPTIBLE') || !key.includes('us')) return;
      
      const corePart = key.split('-')[0];
      const cores = parseInt(corePart);
      if (isNaN(cores)) return;
      
      regions.forEach(region => {
        const regionPrice = price;
        if (!regionPrice) return;
        
        instances.push({
          provider: 'gcp',
          instanceType: `e2-standard-${cores}`,
          region,
          specs: {
            vCPUs: cores,
            memory: cores * 4, // E2 Standard has 4GB per core
            storage: 0,
            gpu: false,
            gpuType: null,
            gpuCount: 0
          },
          pricing: {
            onDemand: parseFloat(regionPrice),
            reserved: 0,
            spot: 0
          },
          category: 'general',
          lastUpdated: new Date()
        });
      });
    });

    logger.info(`Generated ${instances.length} GCP instances`);
    return instances;
  } catch (error) {
    logger.error('Failed to fetch GCP instances:', error);
    return [];
  }
}

// Fetch Azure instances using public API
async function fetchAzureInstances() {
  try {
    logger.info('Fetching Azure instances using Azure Retail Prices API');

    // Using the Azure Retail Prices REST API
    const apiUrl = 'https://prices.azure.com/api/retail/prices';
    const queryParams = new URLSearchParams({
      '$filter': "serviceFamily eq 'Compute' and serviceName eq 'Virtual Machines' and priceType eq 'Consumption'",
      '$top': '100'
    });

    const response = await fetch(`${apiUrl}?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Azure API returned ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    logger.info('Azure API response:', { 
      itemCount: result.Items?.length || 0
    });

    if (!result.Items || !result.Items.length) {
      logger.warn('No Azure VM pricing data returned from API');
      return [];
    }

    const instances = result.Items
      .filter(item => 
        item.type === 'Consumption' && 
        !item.productName.includes('Windows') && 
        !item.productName.includes('Spot')
      )
      .map(item => {
        // Extract size from skuName (e.g., "Standard_D2s_v3")
        const instanceType = item.armSkuName || item.skuName;
        
        // Extract specs from product name using regex
        const vcpuMatch = item.productName.match(/(\d+) vCPU/);
        const memoryMatch = item.productName.match(/(\d+(\.\d+)?) GB/);
        const vCPUs = vcpuMatch ? parseInt(vcpuMatch[1]) : 2;
        const memory = memoryMatch ? parseFloat(memoryMatch[1]) : 8;
        
        return {
          provider: 'azure',
          instanceType: instanceType,
          region: item.location || 'eastus',
          specs: {
            vCPUs: vCPUs,
            memory: memory,
            storage: 0,
            gpu: item.productName.toLowerCase().includes('gpu'),
            gpuType: item.productName.toLowerCase().includes('gpu') ? 'NVIDIA' : null,
            gpuCount: item.productName.toLowerCase().includes('gpu') ? 1 : 0
          },
          pricing: {
            onDemand: item.retailPrice || 0.096,
            reserved: 0,
            spot: 0
          },
          category: item.productName.toLowerCase().includes('gpu') ? 'gpu' : 
                   item.productName.toLowerCase().includes('compute') ? 'compute' : 
                   item.productName.toLowerCase().includes('memory') ? 'memory' : 'general',
          lastUpdated: new Date()
        };
      });

    logger.info(`Generated ${instances.length} Azure instances`);
    return instances;
  } catch (error) {
    logger.error('Failed to fetch Azure instances:', error);
    return [];
  }
}

// Main function to update pricing
async function updatePricing() {
  await connectToDatabase();

  try {
    // Fetch and update GCP instances
    const gcpInstances = await fetchGCPInstances();
    if (gcpInstances.length > 0) {
      await Instance.deleteMany({ provider: 'gcp' });
      await Instance.insertMany(gcpInstances);
      logger.info(`Saved ${gcpInstances.length} GCP instances to the database`);
    }

    // Fetch and update Azure instances
    const azureInstances = await fetchAzureInstances();
    if (azureInstances.length > 0) {
      await Instance.deleteMany({ provider: 'azure' });
      await Instance.insertMany(azureInstances);
      logger.info(`Saved ${azureInstances.length} Azure instances to the database`);
    }

    logger.info('Price update completed successfully');
  } catch (err) {
    logger.error('Error updating prices:', err);
  } finally {
    mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
  }
}

// Run the update
updatePricing().catch(error => {
  logger.error('Unhandled error:', error);
  process.exit(1);
});
