const { EC2Client, DescribeInstanceTypesCommand } = require('@aws-sdk/client-ec2');
const { ComputeManagementClient } = require('@azure/arm-compute');
const { CloudBillingClient } = require('@google-cloud/billing');
const axios = require('axios');
const { GoogleAuth } = require('google-auth-library');
const Instance = require('../models/Instance');
const logger = require('../utils/logger');

class CloudProviderService {
  constructor() {
    // Initialize AWS client
    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.AWS_ACCESS_KEY_ID !== 'your_aws_access_key') {
      this.awsClient = new EC2Client({
        region: process.env.AWS_REGION || 'us-east-1',
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
      });
      logger.info('AWS client initialized');
    } else {
      logger.warn('AWS credentials missing or invalid; AWS client not initialized');
      this.awsClient = null;
    }

    // Initialize Azure client
    const azureCredentials = {
      clientId: process.env.AZURE_CLIENT_ID,
      clientSecret: process.env.AZURE_CLIENT_SECRET,
      tenantId: process.env.AZURE_TENANT_ID,
      subscriptionId: process.env.AZURE_SUBSCRIPTION_ID
    };
    if (
      azureCredentials.clientId &&
      azureCredentials.clientSecret &&
      azureCredentials.tenantId &&
      azureCredentials.subscriptionId
    ) {
      try {
        logger.info('Attempting to initialize Azure client with credentials:', {
          clientId: azureCredentials.clientId,
          tenantId: azureCredentials.tenantId,
          subscriptionId: azureCredentials.subscriptionId
        });
        this.azureClient = new ComputeManagementClient({
          credentials: {
            clientId: azureCredentials.clientId,
            clientSecret: azureCredentials.clientSecret,
            tenantId: azureCredentials.tenantId
          },
          subscriptionId: azureCredentials.subscriptionId
        });
        logger.info('Azure client initialized successfully');
      } catch (error) {
        logger.error('Failed to initialize Azure client:', error.message);
        this.azureClient = null;
      }
    } else {
      logger.warn('Azure credentials incomplete:', {
        clientId: !!azureCredentials.clientId,
        clientSecret: !!azureCredentials.clientSecret,
        tenantId: !!azureCredentials.tenantId,
        subscriptionId: !!azureCredentials.subscriptionId
      });
      this.azureClient = null;
    }

    // Initialize GCP billing client
    if (process.env.GOOGLE_PROJECT_ID && (process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.GOOGLE_CREDENTIALS)) {
      try {
        const gcpOptions = { projectId: process.env.GOOGLE_PROJECT_ID };
        if (process.env.GOOGLE_CREDENTIALS) {
          gcpOptions.credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
        } else {
          gcpOptions.keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS;
        }
        this.gcpBillingClient = new CloudBillingClient(gcpOptions);
        logger.info('GCP client initialized');
      } catch (error) {
        logger.error('Failed to initialize GCP client:', error.message);
        this.gcpBillingClient = null;
      }
    } else {
      logger.warn('GCP credentials missing:', {
        projectId: !!process.env.GOOGLE_PROJECT_ID,
        credentials: !!(process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.GOOGLE_CREDENTIALS)
      });
      this.gcpBillingClient = null;
    }
  }

  async fetchAWSInstances() {
    if (!this.awsClient) {
      logger.error('AWS client not initialized; cannot fetch instances');
      throw new Error('AWS client not initialized');
    }
    try {
      const command = new DescribeInstanceTypesCommand({});
      const response = await this.awsClient.send(command);

      const instances = response.InstanceTypes.map(instance => ({
        provider: 'aws',
        instanceType: instance.InstanceType,
        region: process.env.AWS_REGION || 'us-east-1',
        specs: {
          vCPUs: instance.VCpuInfo.DefaultVCpus,
          memory: instance.MemoryInfo.SizeInMiB / 1024, // Convert to GB
          storage: instance.InstanceStorageInfo?.TotalSizeInGB || 0,
          gpu: instance.GpuInfo?.Gpus?.length > 0,
          gpuType: instance.GpuInfo?.Gpus?.[0]?.Name || null,
          gpuCount: instance.GpuInfo?.Gpus?.length || 0
        },
        pricing: {
          onDemand: 0, // Placeholder: Implement AWS Price List API
          reserved: 0,
          spot: 0
        },
        category: this.determineInstanceCategory(instance),
        lastUpdated: new Date()
      }));

      await Instance.deleteMany({ provider: 'aws' });
      await Instance.insertMany(instances, { ordered: false });
      logger.info(`Inserted ${instances.length} AWS instances`);
      return instances;
    } catch (error) {
      logger.error('Error fetching AWS instances:', error.message);
      throw error;
    }
  }

  async fetchAzureInstances() {
    if (!this.azureClient) {
      logger.error('Azure client not initialized; cannot fetch instances');
      throw new Error('Azure client not initialized');
    }
    try {
      const vmSizes = await this.azureClient.virtualMachineSizes.list(
        process.env.AZURE_LOCATION || 'eastus'
      );

      const instances = vmSizes.map(vm => ({
        provider: 'azure',
        instanceType: vm.name,
        region: process.env.AZURE_LOCATION || 'eastus',
        specs: {
          vCPUs: vm.numberOfCores,
          memory: vm.memoryInMB / 1024, // Convert to GB
          storage: vm.osDiskSizeInMB / 1024, // Convert to GB
          gpu: vm.gpuCount > 0,
          gpuType: vm.gpuName || null,
          gpuCount: vm.gpuCount || 0
        },
        pricing: {
          onDemand: 0, // Placeholder: Implement Azure Retail Prices API
          reserved: 0,
          spot: 0
        },
        category: this.determineInstanceCategory(vm),
        lastUpdated: new Date()
      }));

      await Instance.deleteMany({ provider: 'azure' });
      await Instance.insertMany(instances, { ordered: false });
      logger.info(`Inserted ${instances.length} Azure instances`);
      return instances;
    } catch (error) {
      logger.error('Error fetching Azure instances:', error.message);
      throw error;
    }
  }

  async fetchGCPInstances() {
    if (!this.gcpBillingClient) {
      logger.error('GCP client not initialized; cannot fetch instances');
      throw new Error('GCP client not initialized');
    }
    try {
      const auth = new GoogleAuth({
        scopes: ['https://www.googleapis.com/auth/cloud-billing']
      });
      const client = await auth.getClient();
      const accessToken = await client.getAccessToken();

      logger.info('Fetching GCP SKUs from Cloud Billing API');
      const response = await axios.get(
        `https://cloudbilling.googleapis.com/v1/services/6F81-5844-456A/skus`,
        {
          headers: {
            Authorization: `Bearer ${accessToken.token}`
          }
        }
      );

      const skus = response.data.skus.filter(
        sku => sku.category.resourceFamily === 'Compute' &&
               sku.category.usageType === 'OnDemand' &&
               sku.serviceRegions.includes(process.env.GCP_ZONE?.split('-')[0] || 'us-central1')
      );

      logger.info(`Found ${skus.length} GCP SKUs`);

      if (skus.length === 0) {
        logger.warn('No GCP SKUs found; inserting dummy instance');
        const dummyInstance = [{
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
        }];
        await Instance.deleteMany({ provider: 'gcp' });
        await Instance.insertMany(dummyInstance, { ordered: false });
        logger.info('Inserted 1 dummy GCP instance');
        return dummyInstance;
      }

      const instances = skus.map(sku => ({
        provider: 'gcp',
        instanceType: sku.description.split(' ')[0], // Extract machine type
        region: sku.serviceRegions[0] || 'us-central1',
        specs: {
          vCPUs: this.parseVCPUsFromDescription(sku.description),
          memory: this.parseMemoryFromDescription(sku.description),
          storage: 0,
          gpu: sku.description.toLowerCase().includes('gpu'),
          gpuType: sku.description.toLowerCase().includes('gpu') ? 'Unknown' : null,
          gpuCount: sku.description.toLowerCase().includes('gpu') ? 1 : 0
        },
        pricing: {
          onDemand: this.convertNanoToHourly(sku.pricingInfo[0].pricingExpression.tieredRates[0].unitPrice.nanos),
          reserved: 0,
          spot: 0
        },
        category: this.determineInstanceCategory({
          vCPUs: this.parseVCPUsFromDescription(sku.description),
          memory: this.parseMemoryFromDescription(sku.description),
          gpuCount: sku.description.toLowerCase().includes('gpu') ? 1 : 0
        }),
        lastUpdated: new Date()
      }));

      await Instance.deleteMany({ provider: 'gcp' });
      await Instance.insertMany(instances, { ordered: false });
      logger.info(`Inserted ${instances.length} GCP instances`);
      return instances;
    } catch (error) {
      logger.error('Error fetching GCP instances:', error.message);
      logger.warn('Inserting dummy GCP instance due to error');
      const dummyInstance = [{
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
      }];
      await Instance.deleteMany({ provider: 'gcp' });
      await Instance.insertMany(dummyInstance, { ordered: false });
      logger.info('Inserted 1 dummy GCP instance');
      return dummyInstance;
    }
  }

  parseVCPUsFromDescription(description) {
    const match = description.match(/(\d+)\s*vCPU/);
    return match ? parseInt(match[1]) : 2; // Default to 2 if not found
  }

  parseMemoryFromDescription(description) {
    const match = description.match(/(\d+\.?\d*)\s*GB/);
    return match ? parseFloat(match[1]) : 4; // Default to 4GB if not found
  }

  convertNanoToHourly(nanos) {
    return nanos / 1e9 / 730; // Convert nanos to hourly rate (730 hours/month)
  }

  determineInstanceCategory(instance) {
    if (instance.gpu || instance.gpuCount > 0) return 'gpu';
    if (instance.memory > 64) return 'memory';
    if (instance.vCPUs > 16) return 'compute';
    if (instance.storage > 1000) return 'storage';
    return 'general';
  }
}

module.exports = new CloudProviderService();