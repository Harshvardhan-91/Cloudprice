const { google } = require('googleapis');
const {PricingClient,GetProductsCommand}= require('@aws-sdk/client-pricing');
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
      this.awsClient = new PricingClient(awsConfig);
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
  
  getDummyAWSInstance() {
    return {
      provider: 'aws',
      instanceType: 't2.micro',
      region: 'us-east-1',
      specs: {
        vCPUs: 1,
        memory: 1,
        storage: 0,
        gpu: false,
        gpuType: null,
        gpuCount: 0
      },
      pricing: {
        onDemand: 0.0116,
        reserved: 0.0076,
        spot: 0.0035
      },
      category: 'general',
      lastUpdated: new Date()
    };
  }  
  
  async fetchGCPInstances() {
    // We'll fetch data directly from the public pricing API regardless of client initialization
    logger.info('Using direct public API for GCP pricing');

    try {
      logger.info('Fetching GCP instances using Cloud Billing Catalog API');

      // Use a direct API call to the GCP Cloud Billing API for pricing information
      // or alternatively use a more reliable approach with the public pricing API

      // For this implementation, we'll use the public pricing JSON data
      // which is more reliable than direct API calls that require extensive permissions      // The original GCP pricing URL may sometimes return HTML instead of JSON
      // We'll use a more reliable backup source for GCP pricing data
      const gcpPricingUrl = 'https://cloudpricingcalculator.appspot.com/static/data/pricelist.json';
      
      try {
        const response = await fetch(gcpPricingUrl);
        
        if (!response.ok) {
          logger.warn(`GCP pricing API returned ${response.status}: ${response.statusText}`);
          throw new Error('GCP pricing API error');
        }
        
        const responseText = await response.text();
        let pricingData;
          try {
          // Try to parse the response as JSON
          pricingData = JSON.parse(responseText);
        } catch (parseError) {
          logger.warn('Failed to parse GCP pricing data as JSON, returning dummy data');
          return [this.getDummyGCPInstance()];
        }
        
        logger.info('GCP pricing data fetched successfully');
      
      if (!pricingData || !pricingData.gcp_price_list || !pricingData.gcp_price_list['CP-COMPUTEENGINE-VMIMAGE-N1-STANDARD']) {
        logger.warn('Invalid GCP pricing data structure');
        return [this.getDummyGCPInstance()];
      }
        // Map instance types and pricing
      const standardVMs = pricingData.gcp_price_list['CP-COMPUTEENGINE-VMIMAGE-N1-STANDARD'];
      const e2VMs = pricingData.gcp_price_list['CP-COMPUTEENGINE-VMIMAGE-E2-STANDARD'] || {};
      const n2VMs = pricingData.gcp_price_list['CP-COMPUTEENGINE-VMIMAGE-N2-STANDARD'] || {};
      } catch (error) {
        logger.error('Error processing GCP pricing data:', error);
        return [this.getDummyGCPInstance()];
      }
      
      // Merge different instance types
      const instances = [];
      
      // Process regions we want to include
      const regions = ['us-central1', 'us-east1', 'europe-west1', 'asia-east1'];
      
      // Process N1 Standard instances
      Object.entries(standardVMs).forEach(([key, price]) => {
        if (key.includes('PREEMPTIBLE') || !key.includes('us')) return;
        
        // Extract core count from key (e.g., "1-YEAR-us-central1" -> 1)
        const corePart = key.split('-')[0];
        const cores = parseInt(corePart);
        if (isNaN(cores)) return;
        
        regions.forEach(region => {
          const regionPrice = price;
          if (!regionPrice) return;
          
          instances.push({
            provider: 'gcp',
            instanceType: `n1-standard-${cores}`,
            region,
            specs: {
              vCPUs: cores,
              memory: cores * 3.75, // N1 Standard has 3.75GB per core
              storage: 0,
              gpu: false,
              gpuType: null,
              gpuCount: 0
            },
            pricing: {
              onDemand: parseFloat(regionPrice),
              reserved: 0,
              spot: 0
            },
            category: 'general',
            lastUpdated: new Date()
          });
        });
      });
      
      // Add E2 instances (more cost-effective general-purpose)
      Object.entries(e2VMs).forEach(([key, price]) => {
        if (key.includes('PREEMPTIBLE') || !key.includes('us')) return;
        
        const corePart = key.split('-')[0];
        const cores = parseInt(corePart);
        if (isNaN(cores)) return;
        
        regions.forEach(region => {
          const regionPrice = price;
          if (!regionPrice) return;
          
          instances.push({
            provider: 'gcp',
            instanceType: `e2-standard-${cores}`,
            region,
            specs: {
              vCPUs: cores,
              memory: cores * 4, // E2 Standard has 4GB per core
              storage: 0,
              gpu: false,
              gpuType: null,
              gpuCount: 0
            },
            pricing: {
              onDemand: parseFloat(regionPrice),
              reserved: 0,
              spot: 0
            },
            category: 'general',
            lastUpdated: new Date()
          });
        });
      });
      
      // Add additional GCP instance types from SKUs if available
      let additionalInstances = [];
      
      if (pricingData.skus) {
        additionalInstances = pricingData.skus
          .filter(sku => sku.description && sku.description.includes('N1 Standard'))
          .map(sku => {
            const pricingInfo = sku.pricingInfo && sku.pricingInfo[0];
            if (!pricingInfo || !pricingInfo.pricingExpression || !pricingInfo.pricingExpression.tieredRates) {
              return null;
            }
            
            const pricePerHour = pricingInfo.pricingExpression.tieredRates[0].unitPrice.nano / 1e9 / 730;
            return {
              provider: 'gcp',
              instanceType: sku.description.match(/N1 Standard-(\d+)/)?.[0] || 'unknown',
              region: sku.serviceRegions && sku.serviceRegions[0] || 'us-central1',
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
          })
          .filter(instance => instance !== null);
      }
        
      // Add the additional instances to our main instances array  
      if (additionalInstances && additionalInstances.length > 0) {
        instances.push(...additionalInstances);
      }

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
      logger.warn('AWS client not initialized, using dummy data');
      return [this.getDummyAWSInstance()];
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
      
      const command = new GetProductsCommand(params);
      const data = await this.awsClient.send(command);
      const region = params.Filters.find(f => f.Field === 'location')?.Value || 'US East';
      logger.info(`AWS Pricing API response for ${region}:`, { resultCount: data.PriceList?.length });

      if (!data.PriceList || !Array.isArray(data.PriceList)) {
        logger.warn(`No PriceList found in AWS response for ${region}`);
        return [this.getDummyAWSInstance()];
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
        logger.warn('No valid AWS instances found after processing, returning dummy data');
        return [this.getDummyAWSInstance()];
      }
      return instances;
    } catch (error) {
      logger.error('Failed to fetch AWS instances:', error);
      return [this.getDummyAWSInstance()];
    }
  }
  
  async fetchAzureInstances() {
    // Using public API regardless of client initialization
    logger.info('Using Azure public pricing API regardless of client status');

    try {
      logger.info('Fetching Azure instances using Azure Retail Prices API');

      // Using the Azure Retail Prices REST API instead of Cost Management
      // This is more reliable for getting current VM prices
      const apiUrl = 'https://prices.azure.com/api/retail/prices';
      const queryParams = new URLSearchParams({
        '$filter': "serviceFamily eq 'Compute' and serviceName eq 'Virtual Machines' and priceType eq 'Consumption'",
        '$top': '100'
      });

      // Use native fetch for simplicity, but could also use axios
      const response = await fetch(`${apiUrl}?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Azure Retail Prices API returned ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      logger.info('Azure Retail Prices API response:', { 
        itemCount: result.Items?.length || 0,
        nextPageLink: result.NextPageLink ? 'Available' : 'None'
      });

      if (!result.Items || !result.Items.length) {
        logger.warn('No Azure VM pricing data returned from API');
        return [this.getDummyAzureInstance()];
      }

      const instances = result.Items
        .filter(item => 
          item.type === 'Consumption' && 
          !item.productName.includes('Windows') && 
          !item.productName.includes('Spot')
        )
        .map(item => {
          // Extract size from skuName (e.g., "Standard_D2s_v3")
          const instanceType = item.armSkuName || item.skuName;
          
          // Extract specs from product name using regex
          const vcpuMatch = item.productName.match(/(\d+) vCPU/);
          const memoryMatch = item.productName.match(/(\d+(\.\d+)?) GB/);
          const vCPUs = vcpuMatch ? parseInt(vcpuMatch[1]) : 2;
          const memory = memoryMatch ? parseFloat(memoryMatch[1]) : 8;
          
          return {
            provider: 'azure',
            instanceType: instanceType,
            region: item.location || 'eastus',
            specs: {
              vCPUs: vCPUs,
              memory: memory,
              storage: 0,
              gpu: item.productName.toLowerCase().includes('gpu'),
              gpuType: item.productName.toLowerCase().includes('gpu') ? 'NVIDIA' : null,
              gpuCount: item.productName.toLowerCase().includes('gpu') ? 1 : 0
            },
            pricing: {
              onDemand: item.retailPrice || 0.096,
              reserved: 0, // Could add reserved instance price if available
              spot: 0      // Could add spot price if available
            },
            category: item.productName.toLowerCase().includes('gpu') ? 'gpu' : 
                     item.productName.toLowerCase().includes('compute') ? 'compute' : 
                     item.productName.toLowerCase().includes('memory') ? 'memory' : 'general',
            lastUpdated: new Date()
          };
        });

      logger.info(`Found ${instances.length} Azure instances`);
      return instances.length > 0 ? instances : [this.getDummyAzureInstance()];
    } catch (error) {
      logger.error('Failed to fetch Azure instances:', error);
      return [this.getDummyAzureInstance()];
    }
  }
}

module.exports = new CloudProviderService();
