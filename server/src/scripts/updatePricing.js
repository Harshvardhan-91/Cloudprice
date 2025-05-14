require('dotenv').config();
const cloudProviderService = require('../services/cloudProviderService');
const logger = require('../utils/logger');

async function updatePricing() {
  try {
    logger.info('Starting pricing update...');

    // Update AWS instances
    logger.info('Updating AWS instances...');
    await cloudProviderService.fetchAWSInstances();
    logger.info('AWS instances updated successfully');

    // Update Azure instances
    logger.info('Updating Azure instances...');
    await cloudProviderService.fetchAzureInstances();
    logger.info('Azure instances updated successfully');

    // Update GCP instances
    logger.info('Updating GCP instances...');
    await cloudProviderService.fetchGCPInstances();
    logger.info('GCP instances updated successfully');

    logger.info('Pricing update completed successfully');
  } catch (error) {
    logger.error('Error updating pricing:', error);
    process.exit(1);
  }
}

// Run the update
updatePricing(); 