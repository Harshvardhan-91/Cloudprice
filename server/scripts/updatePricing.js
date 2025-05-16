require('dotenv').config({ path: './.env' });
const cloudProviderService = require('../services/cloudProviderService');
const logger = require('../utils/logger');
const Instance = require('../models/Instance');

async function updatePricing() {
  try {
    logger.info('Starting pricing update...');

    // Update AWS instances
    if (cloudProviderService.awsClient) {
      logger.info('Updating AWS instances...');
      const awsInstances = await cloudProviderService.fetchAWSInstances();
      if (awsInstances && awsInstances.length > 0) {
        await Instance.deleteMany({ provider: 'aws' });
        await Instance.insertMany(awsInstances);
        logger.info(`Saved ${awsInstances.length} AWS instances to the database`);
      }
      logger.info(`AWS instances updated successfully: ${awsInstances.length} records`);
    } else {
      logger.warn('Skipping AWS update: AWS client not initialized');
    }

    // Update Azure instances
    if (cloudProviderService.azureClient) {
      logger.info('Updating Azure instances...');
      const azureInstances = await cloudProviderService.fetchAzureInstances();
      if (azureInstances && azureInstances.length > 0) {
        await Instance.deleteMany({ provider: 'azure' });
        await Instance.insertMany(azureInstances);
        logger.info(`Saved ${azureInstances.length} Azure instances to the database`);
      }
      logger.info(`Azure instances updated successfully: ${azureInstances.length} records`);
    } else {
      logger.warn('Skipping Azure update: Azure client not initialized');
    }

    // Update GCP instances
    if (cloudProviderService.gcpClient) {
      logger.info('Updating GCP instances...');
      const gcpInstances = await cloudProviderService.fetchGCPInstances();
      if (gcpInstances && gcpInstances.length > 0) {
        await Instance.deleteMany({ provider: 'gcp' });
        await Instance.insertMany(gcpInstances);
        logger.info(`Saved ${gcpInstances.length} GCP instances to the database`);
      }
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