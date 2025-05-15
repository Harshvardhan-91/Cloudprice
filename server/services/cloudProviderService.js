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
      logger.error('Failed to initialize GCP client:', error.message);
      logger.error('GCP initialization error details:', error);
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
      logger.error('AWS initialization error:', error.message);
    }

    // Initialize Azure client
    try {
      const azureCredentials = new DefaultAzureCredential();
      this.azureClient = new CostManagementClient(azureCredentials, process.env.AZURE_SUBSCRIPTION_ID);
      logger.info('Azure client initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Azure client:', error.message);
      logger.error('Azure initialization error details:', error);
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

  getDummyAWSInstance() {
    return {
      provider: 'aws',
      instanceType: 't3.micro',
      region: 'us-east-1',
      specs: {
        vCPUs: 2,
        memory: 1,
        storage: 0,
        gpu: false,
        gpuType: null,
        gpuCount: 0
      },
      pricing: {
        onDemand: 0.0104,
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
      const projectId = process.env.GOOGLE_PROJECT_ID;
      const response = await this.gcpClient.services.list({
        parent: `projects/${projectId}`,
      });

      logger.info('GCP services.list response:', JSON.stringify(response.data, null, 2));

      const computeService = response.data.services.find(service =>
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

      logger.info('GCP skus.list response:', JSON.stringify(skusResponse.data, null, 2));

      const instances = skusResponse.data.skus
        .filter(sku =>
          sku.description.includes('Instance') &&
          sku.category.resourceGroup === 'N1Standard'
        )
        .map(sku => {
          const pricingInfo = sku.pricingInfo[0];
          const pricePerHour = pricingInfo.pricingExpression.tieredRates[0].unitPrice.nano / 1e9 / 730; // Convert nano-units to USD/hour
          return {
            provider: 'gcp',
            instanceType: sku.description.match(/N1 Standard-(\d+)/)?.[0] || 'unknown',
            region: sku.serviceRegions[0] || 'us-central1',
            specs: {
              vCPUs: parseInt(sku.description.match(/(\d+)/)?.[0]) || 2,
              memory: 3.75 * (parseInt(sku.description.match(/(\d+)/)?.[0]) || 2), // N1Standard has 3.75 GB per vCPU
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
      return instances.length > 0 ? instances : [this.getDummyGCPInstance()];
    } catch (error) {
      logger.error('Failed to fetch GCP instances:', error.message);
      logger.error('GCP fetch error details:', JSON.stringify(error, null, 2));
      return [this.getDummyGCPInstance()];
    }
  }

  async fetchAWSInstances() {
    if (!this.awsClient) {
      logger.warn('AWS client not initialized');
      return [this.getDummyAWSInstance()];
    }

    try {
      const params = {
        ServiceCode: 'AmazonEC2',
        Filters: [
          { Type: 'TERM_MATCH', Field: 'instanceType', Value: 't3.micro' },
          { Type: 'TERM_MATCH', Field: 'location', Value: 'US East (N. Virginia)' },
          { Type: 'TERM_MATCH', Field: 'operatingSystem', Value: 'Linux' },
          { Type: 'TERM_MATCH', Field: 'tenancy', Value: 'Shared' },
          { Type: 'TERM_MATCH', Field: 'preInstalledSw', Value: 'NA' },
        ],
      };
      const data = await this.awsClient.getProducts(params).promise();
      const instances = data.PriceList.map(item => {
        const priceItem = JSON.parse(item);
        const pricePerHour = priceItem.terms.OnDemand[Object.keys(priceItem.terms.OnDemand)[0]]
          .priceDimensions[Object.keys(priceItem.terms.OnDemand[Object.keys(priceItem.terms.OnDemand)[0]].priceDimensions)[0]]
          .pricePerUnit.USD;
        return {
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
            onDemand: parseFloat(pricePerHour),
            reserved: 0,
            spot: 0
          },
          category: 'general',
          lastUpdated: new Date()
        };
      });
      logger.info(`Found ${instances.length} AWS instances`);
      return instances.length > 0 ? instances : [this.getDummyAWSInstance()];
    } catch (error) {
      logger.error('Failed to fetch AWS instances:', error.message);
      return [this.getDummyAWSInstance()];
    }
  }

  async fetchAzureInstances() {
    if (!this.azureClient) {
      logger.error('Azure client not initialized');
      return [this.getDummyAzureInstance()];
    }

    try {
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
      const instances = result.rows.map(row => ({
        provider: 'azure',
        instanceType: row[0] || 'D2s v3',
        region: process.env.AZURE_LOCATION,
        specs: {
          vCPUs: 2,
          memory: 8,
          storage: 0,
          gpu: false,
          gpuType: null,
          gpuCount: 0
        },
        pricing: {
          onDemand: row[1] || 0.096,
          reserved: 0,
          spot: 0
        },
        category: 'general',
        lastUpdated: new Date()
      }));
      logger.info(`Found ${instances.length} Azure instances`);
      return instances.length > 0 ? instances : [this.getDummyAzureInstance()];
    } catch (error) {
      logger.error('Failed to fetch Azure instances:', error.message);
      return [this.getDummyAzureInstance()];
    }
  }
}

module.exports = new CloudProviderService();