#!/usr/bin/env /usr/local/bin/node

//needed to load env variables
require('dotenv').config();

// Metadata
// <xbar.title>Carbon Intensity</xbar.title>
// <xbar.version>v1.0</xbar.version>
// <xbar.author>Jason Jones</xbar.author>
// <xbar.desc>Shows current carbon intensity of the grid from Electricity Maps</xbar.desc>
// <xbar.dependencies>node, Electricity Maps API, WattTime API</xbar.dependencies>

const https = require('https');

// API Configuration
const requiredEnvVars = {
  'ELECTRICITY_MAPS_API_KEY': process.env.ELECTRICITY_MAPS_API_KEY,
  'ELECTRICITY_MAPS_ZONE': process.env.ELECTRICITY_MAPS_ZONE,
  'WATTTIME_USERNAME': process.env.WATTTIME_USERNAME,
  'WATTTIME_PASSWORD': process.env.WATTTIME_PASSWORD,
  'WATTTIME_ZONE': process.env.WATTTIME_ZONE
};


const missingVars = Object.entries(requiredEnvVars)
  .filter(([, value]) => !value)
  .map(([name]) => name);

if (missingVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

const {
  ELECTRICITY_MAPS_API_KEY,
  ELECTRICITY_MAPS_ZONE,
  WATTTIME_USERNAME,
  WATTTIME_PASSWORD,
  WATTTIME_ZONE
} = requiredEnvVars;

// Display Configuration
const COLORS = ["#0ed812", "#ffde33", "#ff9933", "#cc0033", "#660099", "#7e0023", "#404040"];
const EMOJIS = ["🌱", "🌿", "🍂", "💨", "🏭", "⚠️", "❓"];

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

function getWattTimeToken() {
  return new Promise((resolve, reject) => {
    const auth = Buffer.from(`${WATTTIME_USERNAME}:${WATTTIME_PASSWORD}`).toString('base64');
    const options = {
      hostname: 'api2.watttime.org',
      path: '/v2/login',
      headers: { 'Authorization': `Basic ${auth}` }
    };
    https.get(options, handleResponse(resolve, reject, response => response.token));
  });
}

function getMOER(token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api2.watttime.org',
      path: `/v3/signal-index?region=${WATTTIME_ZONE}&signal_type=co2_moer`,
      headers: { 'Authorization': `Bearer ${token}` }
    };
    https.get(options, handleResponse(resolve, reject));
  });
}

function handleResponse(resolve, reject, transform = response => response) {
  return (resp) => {
    let data = '';
    resp.on('data', (chunk) => { data += chunk; });
    resp.on('end', () => {
      try {
        resolve(transform(JSON.parse(data)));
      } catch (error) {
        reject(error);
      }
    });
  };
}

function calculateFossilFuelPercentage(powerData) {
  if (!powerData?.powerConsumptionBreakdown) {
    console.error('Power data is missing or invalid:', powerData);
    return 'N/A';
  }

  const fossilFuels = ['coal', 'gas', 'oil', 'unknown'];
  const totalPower = Object.values(powerData.powerConsumptionBreakdown).reduce((a, b) => a + b, 0);
  const fossilPower = fossilFuels.reduce((sum, fuel) => 
    sum + (powerData.powerConsumptionBreakdown[fuel] || 0), 0);
  return Math.round((fossilPower / totalPower) * 100);
}

function getEmoji(percentile) {
  if (percentile === undefined || percentile === 'N/A') return EMOJIS[6];
  if (percentile <= 20) return EMOJIS[0];  // Cleanest 20%
  if (percentile <= 40) return EMOJIS[1];  // Cleaner than average
  if (percentile <= 60) return EMOJIS[2];  // Average
  if (percentile <= 80) return EMOJIS[3];  // Dirtier than average
  if (percentile <= 90) return EMOJIS[4];  // Very dirty
  return EMOJIS[5];                        // Extremely dirty
}

function getColor(percentile) {
  if (percentile === undefined || percentile === 'N/A') return COLORS[6];
  if (percentile <= 20) return COLORS[0];
  if (percentile <= 40) return COLORS[1];
  if (percentile <= 60) return COLORS[2];
  if (percentile <= 80) return COLORS[3];
  if (percentile <= 90) return COLORS[4];
  return COLORS[5];
}

function displayPowerBreakdown(powerData) {
  const totalPower = Object.values(powerData.powerConsumptionBreakdown).reduce((a, b) => a + b, 0);
  Object.entries(powerData.powerConsumptionBreakdown)
    .sort(([, a], [, b]) => b - a)
    .forEach(([source, value]) => {
      const percentage = Math.round((value / totalPower) * 100);
      if (percentage > 0) {
        console.log(`${source}: ${percentage}%`);
      }
    });
}

// Main Execution
Promise.all([
  makeRequest(`/v3/carbon-intensity/latest?zone=${ELECTRICITY_MAPS_ZONE}`),
  makeRequest(`/v3/power-breakdown/latest?zone=${ELECTRICITY_MAPS_ZONE}`),
  getWattTimeToken().then(token => getMOER(token))
])
.then(([carbonData, powerData, moerData]) => {
  const fossilPercentage = calculateFossilFuelPercentage(powerData);
  const moerValue = moerData?.data?.[0]?.value ?? 'N/A';
  const moerPercent = moerValue;

  const emoji = getEmoji(moerPercent);
  const color = getColor(moerPercent);
  
  // Menu Bar Display - now includes percentile
  console.log(`${emoji} ${Math.round(carbonData.carbonIntensity)} gCO₂eq/kWh (${moerPercent}%) | color=${color} size=12 font=UbuntuMono-Bold`);
  console.log('---');
  console.log(`Zone: ${ELECTRICITY_MAPS_ZONE}`);
  console.log(`Updated: ${new Date(powerData.datetime).toLocaleTimeString()}`);
  console.log('---');
  console.log(`Carbon Intensity: ${Math.round(carbonData.carbonIntensity)} gCO₂eq/kWh`);
  console.log(`MOER: ${moerValue}th percentile`);
  console.log('---');
  console.log(`Fossil Fuel Usage: ${fossilPercentage}%`);
  console.log('---');
  console.log('Power Breakdown:');
  displayPowerBreakdown(powerData);
  console.log('---');
  console.log('Open Electricity Maps | href=https://app.electricitymaps.com/');
})
.catch(error => {
  console.log('⚡ Error');
  console.log('---');
  console.log(error.message);
}); 