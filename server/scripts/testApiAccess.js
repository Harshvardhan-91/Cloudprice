const fetch = require('node-fetch');

// Test fetching GCP data
async function testGCPFetch() {
  console.log('Testing GCP public pricing API...');
  try {
    const gcpPricingUrl = 'https://cloudpricingcalculator.appspot.com/static/data/pricelist.json';
    const response = await fetch(gcpPricingUrl);
    
    if (!response.ok) {
      throw new Error(`GCP pricing API returned ${response.status}: ${response.statusText}`);
    }
    
    const pricingData = await response.json();
    console.log('GCP pricing data fetched successfully!');
    
    if (!pricingData || !pricingData.gcp_price_list || !pricingData.gcp_price_list['CP-COMPUTEENGINE-VMIMAGE-N1-STANDARD']) {
      console.warn('Warning: Invalid GCP pricing data structure');
    } else {
      const standardVMs = pricingData.gcp_price_list['CP-COMPUTEENGINE-VMIMAGE-N1-STANDARD'];
      console.log(`GCP Standard VM Options: ${Object.keys(standardVMs).length}`);
    }
  } catch (error) {
    console.error('Failed to fetch GCP data:', error);
  }
}

// Test fetching Azure data
async function testAzureFetch() {
  console.log('\nTesting Azure Retail Prices API...');
  try {
    const apiUrl = 'https://prices.azure.com/api/retail/prices';
    const queryParams = new URLSearchParams({
      '$filter': "serviceFamily eq 'Compute' and serviceName eq 'Virtual Machines' and priceType eq 'Consumption'",
      '$top': '10'
    });

    const response = await fetch(`${apiUrl}?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Azure API returned ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('Azure API response received!');
    console.log(`Items count: ${result.Items?.length || 0}`);
    
    if (result.Items && result.Items.length > 0) {
      console.log('First item example:', JSON.stringify(result.Items[0], null, 2));
    } else {
      console.warn('No Azure VM pricing data returned from API');
    }
  } catch (error) {
    console.error('Failed to fetch Azure data:', error);
  }
}

// Run the tests
async function runTests() {
  await testGCPFetch();
  await testAzureFetch();
  console.log('\nTests completed!');
}

runTests();
