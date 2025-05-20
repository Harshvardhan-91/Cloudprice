const cron = require('node-cron');
const logger = require('./logger');

const schedulePriceUpdates = () => {
  /* 
    Cron job disabled since we're using the CloudPrice API.
    Original schedule: Run every 3 days at midnight (0 0 * /3 * *)
    cron.schedule('0 0 * /3 * *', async () => {
      try {
        logger.info('Starting scheduled pricing update...');
        // ... (rest of the code)
      } catch (error) {
        logger.error('Error in scheduled pricing update:', error);
      }
    }, {
      scheduled: true,
      timezone: 'UTC'
    });
    logger.info('Price update cron job scheduled (every 3 days at midnight UTC)');
  */

  logger.info('Price update cron job is disabled as we are using the CloudPrice API');
};

module.exports = { schedulePriceUpdates };