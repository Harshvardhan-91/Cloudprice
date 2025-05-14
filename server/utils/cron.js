const cron = require('node-cron');
const logger = require('./logger');
const cloudProviderService = require('../services/cloudProviderService');

const schedulePriceUpdates = () => {
  cron.schedule('0 0 */3 * *', async () => {
    try {
      logger.info('Starting scheduled pricing update...');

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

      logger.info('Scheduled pricing update completed successfully');
    } catch (error) {
      logger.error('Error in scheduled pricing update:', error);
    }
  }, {
    scheduled: true,
    timezone: 'UTC'
  });

  logger.info('Price update cron job scheduled (every 3 days at midnight UTC)');
};

module.exports = { schedulePriceUpdates };