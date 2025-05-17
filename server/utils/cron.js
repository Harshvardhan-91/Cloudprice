const cron = require('node-cron');
const logger = require('./logger');
const cloudProviderService = require('../services/cloudProviderService');

const Instance = require('../models/Instance');

const schedulePriceUpdates = () => {
  // Run every 3 days at midnight (0 0 */3 * *)
  cron.schedule('0 0 */3 * *', async () => {
    try {
      logger.info('Starting scheduled pricing update...');

      // Update AWS instances
      if (cloudProviderService.awsClient) {
        logger.info('Updating AWS instances...');
        const awsInstances = await cloudProviderService.fetchAWSInstances();
        
        // Save to database
        if (awsInstances && awsInstances.length > 0) {
          await Instance.deleteMany({ provider: 'aws' });
          await Instance.insertMany(awsInstances);
          logger.info(`Saved ${awsInstances.length} AWS instances to the database`);
        }
      } else {
        logger.warn('Skipping AWS update: AWS client not initialized');
      }

      // Update Azure instances
      if (cloudProviderService.azureClient) {
        logger.info('Updating Azure instances...');
        const azureInstances = await cloudProviderService.fetchAzureInstances();
        
        // Save to database
        if (azureInstances && azureInstances.length > 0) {
          await Instance.deleteMany({ provider: 'azure' });
          await Instance.insertMany(azureInstances);
          logger.info(`Saved ${azureInstances.length} Azure instances to the database`);
        }
      } else {
        logger.warn('Skipping Azure update: Azure client not initialized');
      }

      // Update GCP instances
      if (cloudProviderService.gcpClient) {
        logger.info('Updating GCP instances...');
        const gcpInstances = await cloudProviderService.fetchGCPInstances();
        
        // Save to database
        if (gcpInstances && gcpInstances.length > 0) {
          await Instance.deleteMany({ provider: 'gcp' });
          await Instance.insertMany(gcpInstances);
          logger.info(`Saved ${gcpInstances.length} GCP instances to the database`);
        }
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