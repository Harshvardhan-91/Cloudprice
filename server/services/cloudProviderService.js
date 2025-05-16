const { google } = require('googleapis');
const AWS = require('aws-sdk');
const { DefaultAzureCredential } = require('@azure/identity');
const { CostManagementClient } = require('@azure/arm-costmanagement');
const logger = require('../utils/logger');

class CloudProviderService {
  constructor() {
    this.gcpClient = null;
    this.awsClient = null;
    this.azureClient = null;

    // Initialize GCP client
    try {
      const auth = new google.auth.GoogleAuth({
        credentials: process.env.GOOGLE_CREDENTIALS ? JSON.parse(process.env.GOOGLE_CREDENTIALS) : undefined,
        scopes: ['https://www.googleapis.com/auth/cloud-billing'],
      });
      this.gcpClient = google.cloudbilling({ version: 'v1', auth });
      logger.info('GCP client initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize GCP client:', error);
    }

    // Initialize AWS client
    try {
      const awsConfig = {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION,
      };
      if (!awsConfig.accessKeyId || !awsConfig.secretAccessKey) {
        throw new Error('AWS credentials missing or invalid');
      }
      this.awsClient = new AWS.Pricing(awsConfig);
      logger.info('AWS client initialized successfully');
    } catch (error) {
      logger.warn('AWS credentials missing or invalid; AWS client not initialized');
      logger.error('AWS initialization error:', error);
    }

    // Initialize Azure client
    try {
      const azureCredentials = new DefaultAzureCredential();
      this.azureClient = new CostManagementClient(azureCredentials, process.env.AZURE_SUBSCRIPTION_ID);
      logger.info('Azure client initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Azure client:', error);
    }
  }

  getDummyGCPInstance() {
    return {
      provider: 'gcp',
      instanceType: 'e2-micro',
      region: 'us-central1',
      specs: {
        vCPUs: 2,
        memory: 1,
        storage: 0,
        gpu: false,
        gpuType: null,
        gpuCount: 0
      },
      pricing: {
        onDemand: 0.01,
        reserved: 0,
        spot: 0
      },
      category: 'general',
      lastUpdated: new Date()
    };
  }

  getDummyAzureInstance() {
    return {
      provider: 'azure',
      instanceType: 'D2s v3',
      region: 'eastus',
      specs: {
        vCPUs: 2,
        memory: 8,
        storage: 0,
        gpu: false,
        gpuType: null,
        gpuCount: 0
      },
      pricing: {
        onDemand: 0.096,
        reserved: 0,
        spot: 0
      },
      category: 'general',
      lastUpdated: new Date()
    };
  }

  async fetchGCPInstances() {
    if (!this.gcpClient) {
      logger.error('GCP client not initialized');
      return [this.getDummyGCPInstance()];
    }

    try {
      logger.info('Fetching GCP instances using Cloud Billing Catalog API');

      const servicesResponse = await this.gcpClient.services.list();
      logger.info('GCP services.list response:', servicesResponse.data);

      const computeService = servicesResponse.data.services.find(service =>
        service.displayName.includes('Compute Engine')
      );

      if (!computeService) {
        logger.error('Compute Engine service not found in GCP services');
        return [this.getDummyGCPInstance()];
      }

      const skusResponse = await this.gcpClient.services.skus.list({
        parent: computeService.name,
        filter: 'category.resourceFamily=Compute AND category.usageType=OnDemand',
      });
      logger.info('GCP skus.list response:', skusResponse.data);

      const instances = skusResponse.data.skus
        .filter(sku =>
          sku.description.includes('Instance') &&
          sku.category.resourceGroup === 'N1Standard' &&
          sku.serviceRegions.includes('us-central1')
        )
        .map(sku => {
          const pricingInfo = sku.pricingInfo[0];
          const pricePerHour = pricingInfo.pricingExpression.tieredRates[0].unitPrice.nano / 1e9 / 730;
          return {
            provider: 'gcp',
            instanceType: sku.description.match(/N1 Standard-(\d+)/)?.[0] || 'unknown',
            region: sku.serviceRegions[0] || 'us-central1',
            specs: {
              vCPUs: parseInt(sku.description.match(/(\d+)/)?.[0]) || 2,
              memory: 3.75 * (parseInt(sku.description.match(/(\d+)/)?.[0]) || 2),
              storage: 0,
              gpu: false,
              gpuType: null,
              gpuCount: 0
            },
            pricing: {
              onDemand: pricePerHour,
              reserved: 0,
              spot: 0
            },
            category: 'general',
            lastUpdated: new Date()
          };
        });

      logger.info(`Found ${instances.length} GCP instances`);
      if (instances.length === 0) {
        logger.warn('No matching GCP instances found, returning dummy data');
        return [this.getDummyGCPInstance()];
      }
      return instances;
    } catch (error) {
      logger.error('Failed to fetch GCP instances:', error);
      return [this.getDummyGCPInstance()];
    }
  }

  async fetchAWSInstances() {
    if (!this.awsClient) {
      logger.error('AWS client not initialized');
      throw new Error('AWS client not initialized');
    }

    try {
      logger.info('Fetching AWS instances using Pricing API');

      const params = {
        ServiceCode: 'AmazonEC2',
        Filters: [
          { Type: 'TERM_MATCH', Field: 'location', Value: 'US East (N. Virginia)' },
          { Type: 'TERM_MATCH', Field: 'operatingSystem', Value: 'Linux' },
          { Type: 'TERM_MATCH', Field: 'tenancy', Value: 'Shared' },
          { Type: 'TERM_MATCH', Field: 'preInstalledSw', Value: 'NA' },
        ],
        MaxResults: 100,
      };

      const data = await this.awsClient.getProducts(params).promise();
      logger.info('AWS Pricing API response:', data);

      if (!data.PriceList || !Array.isArray(data.PriceList)) {
        logger.error('No PriceList found in AWS response or PriceList is not an array');
        throw new Error('No PriceList found in AWS response or PriceList is not an array');
      }

      const instances = [];
      for (const item of data.PriceList) {
        try {
          // Ensure item is a string before parsing
          if (typeof item !== 'string') {
            logger.warn('Skipping invalid PriceList item, not a string:', item);
            continue;
          }

          const priceItem = JSON.parse(item);
          if (!priceItem.terms || !priceItem.terms.OnDemand) {
            logger.warn('Skipping PriceList item with missing OnDemand pricing:', priceItem);
            continue;
          }

          const onDemandTerms = priceItem.terms.OnDemand;
          const priceDimension = onDemandTerms[Object.keys(onDemandTerms)[0]]
            .priceDimensions[Object.keys(onDemandTerms[Object.keys(onDemandTerms)[0]].priceDimensions)[0]];
          const pricePerHour = parseFloat(priceDimension.pricePerUnit.USD);

          if (isNaN(pricePerHour) || pricePerHour <= 0) {
            logger.warn('Skipping PriceList item with invalid price:', priceItem);
            continue;
          }

          instances.push({
            provider: 'aws',
            instanceType: priceItem.product.attributes.instanceType,
            region: priceItem.product.attributes.location,
            specs: {
              vCPUs: parseInt(priceItem.product.attributes.vcpu) || 2,
              memory: parseFloat(priceItem.product.attributes.memory) || 1,
              storage: 0,
              gpu: priceItem.product.attributes.gpu ? true : false,
              gpuType: priceItem.product.attributes.gpu || null,
              gpuCount: priceItem.product.attributes.gpu ? parseInt(priceItem.product.attributes.gpu) : 0
            },
            pricing: {
              onDemand: pricePerHour,
              reserved: 0,
              spot: 0
            },
            category: priceItem.product.attributes.instanceType.toLowerCase().includes('g') ? 'gpu' : 'general',
            lastUpdated: new Date()
          });
        } catch (parseError) {
          logger.error('Failed to parse PriceList item:', { item, error: parseError });
          continue;
        }
      }

      logger.info(`Found ${instances.length} AWS instances`);
      if (instances.length === 0) {
        logger.error('No valid AWS instances found after processing');
        throw new Error('No valid AWS instances found after processing');
      }
      return instances;
    } catch (error) {
      logger.error('Failed to fetch AWS instances:', error);
      throw error;
    }
  }

  async fetchAzureInstances() {
    if (!this.azureClient) {
      logger.error('Azure client not initialized');
      return [this.getDummyAzureInstance()];
    }

    try {
      logger.info('Fetching Azure instances using Cost Management API');

      const query = {
        type: 'Usage',
        timeframe: 'TheLastMonth',
        dataset: {
          granularity: 'Daily',
          aggregation: {
            totalCost: { name: 'Cost', function: 'Sum' }
          },
          filter: {
            dimensions: {
              name: 'ServiceName',
              operator: 'In',
              values: ['Virtual Machines']
            }
          }
        }
      };

      const result = await this.azureClient.query.usage(
        `subscriptions/${process.env.AZURE_SUBSCRIPTION_ID}`,
        query
      );
      logger.info('Azure Cost Management API response:', result);

      const instances = result.rows.map(row => ({
        provider: 'azure',
        instanceType: row[0] || 'D2s v3',
        region: process.env.AZURE_LOCATION || 'eastus',
        specs: {
          vCPUs: 2,
          memory: 8,
          storage: 0,
          gpu: false,
          gpuType: null,
          gpuCount: 0
        },
        pricing: {
          onDemand: parseFloat(row[1]) || 0.096,
          reserved: 0,
          spot: 0
        },
        category: 'general',
        lastUpdated: new Date()
      }));

      logger.info(`Found ${instances.length} Azure instances`);
      return instances.length > 0 ? instances : [this.getDummyAzureInstance()];
    } catch (error) {
      logger.error('Failed to fetch Azure instances:', error);
      return [this.getDummyAzureInstance()];
    }
  }
}

module.exports = new CloudProviderService();