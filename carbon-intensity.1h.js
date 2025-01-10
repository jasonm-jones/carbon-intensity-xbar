#!/usr/bin/env -S PATH="${PATH}:/opt/homebrew/bin:/usr/local/bin" node

// Metadata
// <xbar.title>Carbon Intensity</xbar.title>
// <xbar.version>v1.1</xbar.version>
// <xbar.author>Jason Jones</xbar.author>
// <xbar.author.github>jasonm-jones</xbar.author.github>
// <xbar.desc>Shows real-time carbon intensity and grid cleanliness to help you minimize your carbon footprint by running energy-intensive tasks at cleaner times.</xbar.desc>
// <xbar.image>https://github.com/jasonm-jones/carbon-intensity-xbar/raw/main/carbon-intensity-screenshot-v1.1.png</xbar.image>
// <xbar.dependencies>node, npm</xbar.dependencies>
// <xbar.abouturl>https://github.com/jasonm-jones/carbon-intensity-xbar</xbar.abouturl>
// <xbar.var>string(ELECTRICITY_MAPS_API_KEY=""): Your Electricity Maps API key from https://api-portal.electricitymaps.com/signup</xbar.var>
// <xbar.var>string(ELECTRICITY_MAPS_ZONE=""): Your Electricity Maps zone. Find your zone at https://app.electricitymaps.com/map</xbar.var>

const https = require('https');


// Load variables from either .vars.jsonfile
if (!process.env.XBAR) {
  try {
    const vars = require(`${__filename}.vars.json`);
    Object.assign(process.env, vars);
  } catch (error) {
    console.error('Debug: Failed to load .vars.json:', error.message);
  }
}

// API Configuration
const ELECTRICITY_MAPS_API_KEY =  process.env.ELECTRICITY_MAPS_API_KEY;
const ELECTRICITY_MAPS_ZONE = process.env.ELECTRICITY_MAPS_ZONE;

// Display Configuration
const EMOJIS = ["🌿", "🌱", "😑", "😡", "⛔", "❓"];


// Validate Configuration
function validateConfig() {
  const errors = [];
  
  // Check for required Electricity Maps configuration
  if (!ELECTRICITY_MAPS_API_KEY) {
    errors.push("🔴 Missing Electricity Maps API key. Get one at https://api-portal.electricitymaps.com/signup");
  }
  if (!ELECTRICITY_MAPS_ZONE) {
    errors.push("🔴 Missing Electricity Maps zone. Find your zone at https://app.electricitymaps.com/map (click on the map and find your zone in the URL) or https://api.electricitymap.org/v3/zones");
  }

  return errors;
}

// Helper Functions
function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.electricitymap.org',
      path: path,
      headers: { 'auth-token': ELECTRICITY_MAPS_API_KEY }
    };
    https.get(options, handleResponse(resolve, reject));
  });
}

// Function to handle API responses
function handleResponse(resolve, reject) {
  return (resp) => {
    let data = '';
    resp.on('data', (chunk) => { data += chunk; });
    resp.on('end', () => {
      try {
        resolve(JSON.parse(data));
      } catch (error) {
        reject(error);
      }
    });
  };
}

// fetch hourly carbon intensity data
async function getHourlyCarbonIntensity(zone) {
  const response = await makeRequest(`/v3/carbon-intensity/history?zone=${zone}&last_hours=24`);
  return response.history; 
}

// Function to calculate percentile
function calculatePercentile(value, data) {
  const sortedData = data.sort((a, b) => a.carbonIntensity - b.carbonIntensity);
  const index = sortedData.findIndex(item => item.carbonIntensity >= value);
  return index === -1 ? 100 : (index / sortedData.length) * 100;
}

// Main Execution
const configErrors = validateConfig();

if (configErrors.length > 0) {
  console.log('Config Errors');
  console.log('---');
  configErrors.forEach(error => {
    console.log(`${error} | color=red`);
  });
  console.log('---');
  console.log('📖 Quick Start Instructions | href=https://github.com/jasonm-jones/carbon-intensity-xbar#readme');
  process.exit(0);
}

function getEmoji(percentile) {
  if (percentile === undefined || percentile === 'N/A') return EMOJIS[6];
  if (percentile >= 80) return EMOJIS[0];  // Cleanest 20%
  if (percentile >= 60) return EMOJIS[1];  // Cleaner than average
  if (percentile >= 40) return EMOJIS[2];  // Average
  if (percentile >= 20) return EMOJIS[3];  // Dirtier than average
  return EMOJIS[4];                        // Dirtiest 20%
}

function displayPowerBreakdown(powerData) {
  // Power source emojis
  const sourceEmojis = {
    wind: "💨️",
    solar: "☀️",
    hydro: "💧",
    biomass: "🌱",
    geothermal: "🌋",
    nuclear: "⚛️",
    coal: "🪨",
    gas: "⛽",
    oil: "🛢️",
    unknown: "❓"
  };

  console.log('Power Breakdown:');
  const totalPower = Object.values(powerData.powerConsumptionBreakdown).reduce((a, b) => a + b, 0);
  Object.entries(powerData.powerConsumptionBreakdown)
    .sort(([, a], [, b]) => b - a)
    .forEach(([source, value]) => {
      const percentage = Math.round((value / totalPower) * 100);
      if (percentage > 0) {
        const emoji = sourceEmojis[source] || "❓";
        console.log(`${emoji} ${source}: ${percentage}%`);
      }
    });
}

// Make Electricity Maps API requests
Promise.all([
  makeRequest(`/v3/carbon-intensity/latest?zone=${ELECTRICITY_MAPS_ZONE}`),
  makeRequest(`/v3/power-breakdown/latest?zone=${ELECTRICITY_MAPS_ZONE}`),
  getHourlyCarbonIntensity(ELECTRICITY_MAPS_ZONE) // Fetch hourly data
])
.then(async ([carbonData, powerData, hourlyData]) => {
  const currentCarbonIntensity = carbonData.carbonIntensity;
  const percentile = calculatePercentile(currentCarbonIntensity, hourlyData);
  const emoji = getEmoji(percentile);
  
  // Menu Bar Display
  console.log(`${emoji} (${percentile.toFixed(2)}%) ${Math.round(currentCarbonIntensity)} gCO₂eq/kWh | size=12 font=UbuntuMono-Bold`);
  console.log('---');
  console.log(`Grid Carbon Intensity: ${Math.round(currentCarbonIntensity)} gCO₂eq/kWh`);
  console.log(`24hr Relative Cleanliness: ${percentile.toFixed(2)}th percentile`);
  console.log(`Power from Renewables: ${powerData.renewablePercentage}%`);
  console.log('---');
  displayPowerBreakdown(powerData);  
  console.log('---');
  console.log(`Zone: ${ELECTRICITY_MAPS_ZONE}`);
  console.log(`Last Updated: ${new Date(powerData.datetime).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })}`);
  console.log('---');
  console.log(`⚡ Open Electricity Maps, ${ELECTRICITY_MAPS_ZONE} | href=https://app.electricitymaps.com/zone/${ELECTRICITY_MAPS_ZONE}`);
  console.log('📖 View Setup Instructions | href=https://github.com/jasonm-jones/carbon-intensity-xbar#readme');
})
.catch(error => {
  console.log('🔴 Error');
  console.log('---');
  console.log(`${error.message} | color=red`);
  console.log('---');
  console.log('📖 View Setup Instructions | href=https://github.com/jasonm-jones/carbon-intensity-xbar#readme');
}); 