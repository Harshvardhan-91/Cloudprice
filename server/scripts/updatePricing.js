require('dotenv').config();
const cloudProviderService = require('../services/cloudProviderService');
const logger = require('../utils/logger');

async function updatePricing() {
  try {
    logger.info('Starting pricing update...');

    // Update AWS instances
    logger.info('Updating AWS instances...');
    const awsInstances = await cloudProviderService.fetchAWSInstances();
    logger.info(`AWS instances updated successfully: ${awsInstances.length} records`);

    // Update Azure instances
    logger.info('Updating Azure instances...');
    const azureInstances = await cloudProviderService.fetchAzureInstances();
    logger.info(`Azure instances updated successfully: ${azureInstances.length} records`);

    // Update GCP instances
    logger.info('Updating GCP instances...');
    const gcpInstances = await cloudProviderService.fetchGCPInstances();
    logger.info(`GCP instances updated successfully: ${gcpInstances.length} records`);

    logger.info('Pricing update completed successfully');
  } catch (error) {
    logger.error('Error updating pricing:', error);
    process.exit(1);
  }
}

// Run the update
updatePricing();require('dotenv').config({ path: './.env' });
const cloudProviderService = require('../services/cloudProviderService');
const logger = require('../utils/logger');

async function updatePricing() {
  try {
    logger.info('Starting pricing update...');

    // Update AWS instances
    if (cloudProviderService.awsClient) {
      logger.info('Updating AWS instances...');
      const awsInstances = await cloudProviderService.fetchAWSInstances();
      logger.info(`AWS instances updated successfully: ${awsInstances.length} records`);
    } else {
      logger.warn('Skipping AWS update: AWS client not initialized');
    }

    // Update Azure instances
    if (cloudProviderService.azureClient) {
      logger.info('Updating Azure instances...');
      const azureInstances = await cloudProviderService.fetchAzureInstances();
      logger.info(`Azure instances updated successfully: ${azureInstances.length} records`);
    } else {
      logger.warn('Skipping Azure update: Azure client not initialized');
    }

    // Update GCP instances
    if (cloudProviderService.gcpBillingClient) {
      logger.info('Updating GCP instances...');
      const gcpInstances = await cloudProviderService.fetchGCPInstances();
      logger.info(`GCP instances updated successfully: ${gcpInstances.length} records`);
    } else {
      logger.warn('Skipping GCP update: GCP client not initialized');
    }

    logger.info('Pricing update completed successfully');
  } catch (error) {
    logger.error('Error updating pricing:', error);
    process.exit(1);
  }
}

// Run the update
updatePricing();require('dotenv').config({ path: './.env' });
const cloudProviderService = require('../services/cloudProviderService');
const logger = require('../utils/logger');

async function updatePricing() {
  try {
    logger.info('Starting pricing update...');

    // Update AWS instances
    if (cloudProviderService.awsClient) {
      logger.info('Updating AWS instances...');
      const awsInstances = await cloudProviderService.fetchAWSInstances();
      logger.info(`AWS instances updated successfully: ${awsInstances.length} records`);
    } else {
      logger.warn('Skipping AWS update: AWS client not initialized');
    }

    // Update Azure instances
    if (cloudProviderService.azureClient) {
      logger.info('Updating Azure instances...');
      const azureInstances = await cloudProviderService.fetchAzureInstances();
      logger.info(`Azure instances updated successfully: ${azureInstances.length} records`);
    } else {
      logger.warn('Skipping Azure update: Azure client not initialized');
    }

    // Update GCP instances
    if (cloudProviderService.gcpBillingClient) {
      logger.info('Updating GCP instances...');
      const gcpInstances = await cloudProviderService.fetchGCPInstances();
      logger.info(`GCP instances updated successfully: ${gcpInstances.length} records`);
    } else {
      logger.warn('Skipping GCP update: GCP client not initialized');
    }

    logger.info('Pricing update completed successfully');
  } catch (error) {
    logger.error('Error updating pricing:', error);
    process.exit(1);
  }
}

// Run the update
updatePricing();