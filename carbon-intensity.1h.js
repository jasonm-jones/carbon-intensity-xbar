#!/usr/bin/env /usr/local/bin/node

// Metadata
// <xbar.title>Carbon Intensity</xbar.title>
// <xbar.version>v1.0</xbar.version>
// <xbar.author>Jason Jones</xbar.author>
// <xbar.desc>Shows current carbon intensity of the gridfrom Electricity Maps</xbar.desc>
// <xbar.dependencies>node, Electricity Maps API</xbar.dependencies>

const https = require('https');

// You'll need to sign up for an API key at https://www.electricitymaps.com/
const ELECTRICITY_MAPS_API_KEY = 'your-api-key-here';
// Set your zone examples:
// US-CAISO_SOUTH - Southern California
// US-TEX - Texas
// US-NW-PACE - Parts of Utah, Wyoming, and Colorado
// For full list of zones, see:
// https://static.electricitymaps.com/api/docs/index.html#zones
const ELECTRICITY_MAPS_ZONE = 'US-NW-PACE';

// WattTime credentials - get these from https://www.watttime.org/api-documentation/#register-new-user
const WATTTIME_USERNAME = 'PLACEHOLDER_USERNAME';
const WATTTIME_PASSWORD = 'PLACEHOLDER_PASSWORD';
// WattTime BA (Balancing Authority) code
// Examples: CAISO_NORTH, NYISO, ISONE, PJM, MISO, ERCOT, PACE
// Full list: https://www.watttime.org/api-documentation/#ba-from-location
const WATTTIME_BA = 'PACE';

const COLORS = ["#0ed812", "#ffde33", "#ff9933", "#cc0033", "#660099", "#7e0023", "#404040"];
const EMOJIS = ["🌱", "🌿", "🍂", "💨", "🏭", "⚠️", "❓"];

// Function to make API request
function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.electricitymap.org',
      path: path,
      headers: {
        'auth-token': ELECTRICITY_MAPS_API_KEY
      }
    };

    https.get(options, (resp) => {
      let data = '';
      resp.on('data', (chunk) => { data += chunk; });
      resp.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}


// Function to get WattTime login token
async function getWattTimeToken() {
  return new Promise((resolve, reject) => {
    const auth = Buffer.from(`${WATTTIME_USERNAME}:${WATTTIME_PASSWORD}`).toString('base64');
    const options = {
      hostname: 'api2.watttime.org',
      path: '/v2/login',
      headers: {
        'Authorization': `Basic ${auth}`
      }
    };

    https.get(options, (resp) => {
      let data = '';
      resp.on('data', (chunk) => { data += chunk; });
      resp.on('end', () => {
        try {
          const token = JSON.parse(data).token;
          resolve(token);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

// Function to get MOER index from WattTime
async function getMOER(token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api2.watttime.org',
      path: `/v3/signal-index?region=${WATTTIME_BA}&signal_type=co2_moer`,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    https.get(options, (resp) => {
      let data = '';
      resp.on('data', (chunk) => { data += chunk; });
      resp.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

// Function to get emoji based on MOER percentile
function getEmoji(percentile) {
  if (percentile === undefined || percentile === 'N/A') return EMOJIS[6];
  if (percentile <= 20) return EMOJIS[0];  // Cleanest 20%
  if (percentile <= 40) return EMOJIS[1];  // Cleaner than average
  if (percentile <= 60) return EMOJIS[2];  // Average
  if (percentile <= 80) return EMOJIS[3];  // Dirtier than average
  if (percentile <= 90) return EMOJIS[4];  // Very dirty
  return EMOJIS[5];                        // Extremely dirty
}

// Function to get color based on MOER percentile
function getColor(percentile) {
  if (percentile === undefined || percentile === 'N/A') return COLORS[6];
  if (percentile <= 20) return COLORS[0];
  if (percentile <= 40) return COLORS[1];
  if (percentile <= 60) return COLORS[2];
  if (percentile <= 80) return COLORS[3];
  if (percentile <= 90) return COLORS[4];
  return COLORS[5];
}

// Make all API calls
Promise.all([
  makeRequest(`/v3/carbon-intensity/latest?zone=${ELECTRICITY_MAPS_ZONE}`),
  makeRequest(`/v3/power-breakdown/latest?zone=${ELECTRICITY_MAPS_ZONE}`),
  getWattTimeToken().then(token => getMOER(token))
])
.then(([carbonData, powerData, moerData]) => {
  // Debug log
  console.error('MOER Data:', JSON.stringify(moerData, null, 2));

  // Calculate fossil fuel percentage
  const fossilFuels = ['coal', 'gas', 'oil', 'unknown'];
  const totalPower = Object.values(powerData.powerConsumptionBreakdown).reduce((a, b) => a + b, 0);
  const fossilPower = fossilFuels.reduce((sum, fuel) => 
    sum + (powerData.powerConsumptionBreakdown[fuel] || 0), 0);
  const fossilPercentage = Math.round((fossilPower / totalPower) * 100);
  
  // Safely get MOER values with fallbacks
  const moerValue = moerData?.data?.[0]?.value ?? 'N/A';
  const moerPercent = moerValue; // The value is already a percentile

  const emoji = getEmoji(moerPercent);
  const color = getColor(moerPercent);
  
  // Display in menu bar with emoji and color
  console.log(`${emoji} ${Math.round(carbonData.carbonIntensity)} gCO₂eq/kWh | color=${color} size=12 font=UbuntuMono-Bold`);
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
  Object.entries(powerData.powerConsumptionBreakdown)
    .sort(([, a], [, b]) => b - a)
    .forEach(([source, value]) => {
      const percentage = Math.round((value / totalPower) * 100);
      if (percentage > 0) {
        console.log(`${source}: ${percentage}%`);
      }
    });
  console.log('---');
  console.log('Open Electricity Maps | href=https://app.electricitymaps.com/');
})
.catch(error => {
  console.log('⚡ Error');
  console.log('---');
  console.log(error.message);
}); 