const cron = require('node-cron');
const cloudProviderService = require('../services/cloudProviderService');
const logger = require('./logger');

// Update pricing data every 6 hours
const schedulePricingUpdates = () => {
  cron.schedule('0 */6 * * *', async () => {
    try {
      logger.info('Starting scheduled pricing update...');
      
      // Update AWS instances
      await cloudProviderService.fetchAWSInstances();
      logger.info('AWS instances updated successfully');
      
      // Update Azure instances
      await cloudProviderService.fetchAzureInstances();
      logger.info('Azure instances updated successfully');
      
      // Update GCP instances
      await cloudProviderService.fetchGCPInstances();
      logger.info('GCP instances updated successfully');
      
      logger.info('Pricing update completed successfully');
    } catch (error) {
      logger.error('Error during scheduled pricing update:', error);
    }
  });
};

module.exports = { schedulePricingUpdates }; 