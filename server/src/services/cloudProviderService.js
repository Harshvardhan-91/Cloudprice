const { EC2Client, DescribeInstanceTypesCommand } = require('@aws-sdk/client-ec2');
const { ComputeManagementClient } = require('@azure/arm-compute');
const { Compute } = require('@google-cloud/compute');
const axios = require('axios');
const Instance = require('../models/Instance');
const logger = require('../utils/logger');

class CloudProviderService {
  constructor() {
    // Initialize AWS client
    this.awsClient = new EC2Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    });

    // Initialize Azure client
    this.azureClient = new ComputeManagementClient({
      credentials: {
        clientId: process.env.AZURE_CLIENT_ID,
        clientSecret: process.env.AZURE_CLIENT_SECRET,
        tenantId: process.env.AZURE_TENANT_ID
      },
      subscriptionId: process.env.AZURE_SUBSCRIPTION_ID
    });

    // Initialize GCP client
    this.gcpClient = new Compute({
      projectId: process.env.GOOGLE_PROJECT_ID,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
    });

    // AWS Pricing API endpoint
    this.awsPricingEndpoint = 'https://pricing.us-east-1.amazonaws.com';
  }

  async fetchAWSInstances() {
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
          gpuType: instance.GpuInfo?.Gpus?.[0]?.Name,
          gpuCount: instance.GpuInfo?.Gpus?.length
        },
        pricing: {
          onDemand: await this.fetchAWSPricing(instance.InstanceType),
          reserved: await this.fetchAWSReservedPricing(instance.InstanceType),
          spot: await this.fetchAWSSpotPricing(instance.InstanceType)
        },
        category: this.determineInstanceCategory(instance),
        lastUpdated: new Date()
      }));

      await Instance.insertMany(instances, { ordered: false });
      return instances;
    } catch (error) {
      console.error('Error fetching AWS instances:', error);
      throw error;
    }
  }

  async fetchAzureInstances() {
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
          gpuType: vm.gpuName,
          gpuCount: vm.gpuCount
        },
        pricing: {
          onDemand: this.fetchAzurePricing(vm.name),
          reserved: this.fetchAzureReservedPricing(vm.name),
          spot: this.fetchAzureSpotPricing(vm.name)
        },
        category: this.determineInstanceCategory(vm),
        lastUpdated: new Date()
      }));

      await Instance.insertMany(instances, { ordered: false });
      return instances;
    } catch (error) {
      console.error('Error fetching Azure instances:', error);
      throw error;
    }
  }

  async fetchGCPInstances() {
    try {
      const [machineTypes] = await this.gcpClient.getMachineTypes({
        zone: process.env.GCP_ZONE || 'us-central1-a'
      });

      const instances = machineTypes.map(machine => ({
        provider: 'gcp',
        instanceType: machine.name,
        region: process.env.GCP_ZONE || 'us-central1-a',
        specs: {
          vCPUs: machine.guestCpus,
          memory: machine.memoryMb / 1024, // Convert to GB
          storage: 0, // GCP doesn't include storage in machine type
          gpu: machine.gpuCount > 0,
          gpuType: machine.gpuType,
          gpuCount: machine.gpuCount
        },
        pricing: {
          onDemand: this.fetchGCPPricing(machine.name),
          reserved: this.fetchGCPReservedPricing(machine.name),
          spot: this.fetchGCPSpotPricing(machine.name)
        },
        category: this.determineInstanceCategory(machine),
        lastUpdated: new Date()
      }));

      await Instance.insertMany(instances, { ordered: false });
      return instances;
    } catch (error) {
      console.error('Error fetching GCP instances:', error);
      throw error;
    }
  }

  determineInstanceCategory(instance) {
    // Logic to determine instance category based on specs
    if (instance.gpu || instance.gpuCount > 0) return 'gpu';
    if (instance.memory > 64) return 'memory';
    if (instance.vCPUs > 16) return 'compute';
    if (instance.storage > 1000) return 'storage';
    return 'general';
  }

  async fetchAWSPricing(instanceType) {
    try {
      // AWS Price List API
      const response = await axios.get(`${this.awsPricingEndpoint}/offers/v1.0/aws/AmazonEC2/current/index.json`);
      const pricingData = response.data;

      // Find the instance type pricing
      const instancePricing = pricingData.terms.OnDemand[instanceType];
      if (!instancePricing) {
        logger.warn(`No pricing found for AWS instance type: ${instanceType}`);
        return 0;
      }

      // Extract the hourly rate
      const hourlyRate = instancePricing.priceDimensions[Object.keys(instancePricing.priceDimensions)[0]].pricePerUnit.USD;
      return parseFloat(hourlyRate);
    } catch (error) {
      logger.error(`Error fetching AWS pricing for ${instanceType}:`, error);
      return 0;
    }
  }

  async fetchAWSReservedPricing(instanceType) {
    try {
      const response = await axios.get(`${this.awsPricingEndpoint}/offers/v1.0/aws/AmazonEC2/current/index.json`);
      const pricingData = response.data;

      // Find reserved instance pricing
      const reservedPricing = pricingData.terms.Reserved[instanceType];
      if (!reservedPricing) {
        return 0;
      }

      // Get 1-year no upfront pricing
      const oneYearNoUpfront = reservedPricing.find(term => 
        term.termAttributes.LeaseContractLength === '1yr' && 
        term.termAttributes.PurchaseOption === 'No Upfront'
      );

      if (!oneYearNoUpfront) {
        return 0;
      }

      const hourlyRate = oneYearNoUpfront.priceDimensions[Object.keys(oneYearNoUpfront.priceDimensions)[0]].pricePerUnit.USD;
      return parseFloat(hourlyRate);
    } catch (error) {
      logger.error(`Error fetching AWS reserved pricing for ${instanceType}:`, error);
      return 0;
    }
  }

  async fetchAWSSpotPricing(instanceType) {
    try {
      const response = await axios.get(`${this.awsPricingEndpoint}/spot/current/index.json`);
      const spotPricing = response.data[instanceType];
      
      if (!spotPricing) {
        return 0;
      }

      // Get the average spot price
      const prices = Object.values(spotPricing).map(price => parseFloat(price));
      const averagePrice = prices.reduce((a, b) => a + b, 0) / prices.length;
      
      return averagePrice;
    } catch (error) {
      logger.error(`Error fetching AWS spot pricing for ${instanceType}:`, error);
      return 0;
    }
  }

  async fetchAzurePricing(instanceType) {
    try {
      const response = await this.azureClient.virtualMachineSizes.list(
        process.env.AZURE_LOCATION || 'eastus'
      );

      const vmSize = response.find(vm => vm.name === instanceType);
      if (!vmSize) {
        return 0;
      }

      // Get pricing from Azure Retail Prices API
      const pricingResponse = await axios.get(
        `https://prices.azure.com/api/retail/prices?$filter=serviceName eq 'Virtual Machines' and armSkuName eq '${instanceType}'`
      );

      const pricing = pricingResponse.data.Items[0];
      return pricing ? parseFloat(pricing.retailPrice) : 0;
    } catch (error) {
      logger.error(`Error fetching Azure pricing for ${instanceType}:`, error);
      return 0;
    }
  }

  async fetchAzureReservedPricing(instanceType) {
    try {
      // Get reserved instance pricing from Azure Retail Prices API
      const response = await axios.get(
        `https://prices.azure.com/api/retail/prices?$filter=serviceName eq 'Virtual Machines' and armSkuName eq '${instanceType}' and reservationTerm eq '1 Year'`
      );

      const pricing = response.data.Items[0];
      return pricing ? parseFloat(pricing.retailPrice) : 0;
    } catch (error) {
      logger.error(`Error fetching Azure reserved pricing for ${instanceType}:`, error);
      return 0;
    }
  }

  async fetchAzureSpotPricing(instanceType) {
    try {
      // Get spot instance pricing from Azure Retail Prices API
      const response = await axios.get(
        `https://prices.azure.com/api/retail/prices?$filter=serviceName eq 'Virtual Machines' and armSkuName eq '${instanceType}' and priceType eq 'Consumption' and isSpot eq true`
      );

      const pricing = response.data.Items[0];
      return pricing ? parseFloat(pricing.retailPrice) : 0;
    } catch (error) {
      logger.error(`Error fetching Azure spot pricing for ${instanceType}:`, error);
      return 0;
    }
  }

  async fetchGCPPricing(instanceType) {
    try {
      const [machineTypes] = await this.gcpClient.getMachineTypes({
        zone: process.env.GCP_ZONE || 'us-central1-a'
      });

      const machineType = machineTypes.find(mt => mt.name === instanceType);
      if (!machineType) {
        return 0;
      }

      // Get pricing from GCP Compute Engine API
      const [pricing] = await this.gcpClient.getMachineTypes({
        zone: process.env.GCP_ZONE || 'us-central1-a',
        machineType: instanceType
      });

      return pricing ? parseFloat(pricing.hourlyRate) : 0;
    } catch (error) {
      logger.error(`Error fetching GCP pricing for ${instanceType}:`, error);
      return 0;
    }
  }

  async fetchGCPReservedPricing(instanceType) {
    try {
      // Get committed use pricing from GCP Compute Engine API
      const [pricing] = await this.gcpClient.getMachineTypes({
        zone: process.env.GCP_ZONE || 'us-central1-a',
        machineType: instanceType,
        commitment: '1 year'
      });

      return pricing ? parseFloat(pricing.hourlyRate) : 0;
    } catch (error) {
      logger.error(`Error fetching GCP reserved pricing for ${instanceType}:`, error);
      return 0;
    }
  }

  async fetchGCPSpotPricing(instanceType) {
    try {
      // Get spot instance pricing from GCP Compute Engine API
      const [pricing] = await this.gcpClient.getMachineTypes({
        zone: process.env.GCP_ZONE || 'us-central1-a',
        machineType: instanceType,
        preemptible: true
      });

      return pricing ? parseFloat(pricing.hourlyRate) : 0;
    } catch (error) {
      logger.error(`Error fetching GCP spot pricing for ${instanceType}:`, error);
      return 0;
    }
  }
}

module.exports = new CloudProviderService(); 