# Carbon Intensity xbar Plugin

Shows real-time carbon intensity and grid cleanliness data in your menu bar.  The purpose is to help you make real-time decisions about when to run energy-intensive tasks (EV charging, laundry, etc.) to minimize your carbon footprint.  In some parts of the country, the grid may be up to 60% dirtier than other times in the same day.

## Screenshots
![Carbon Intensity Plugin](https://raw.githubusercontent.com/jasonm-jones/carbon-intensity-xbar/79b01fbcdb4c535b78718b1699c477484ddf8bdb/CarbonIntensityScreenshot.png)

## Understanding the Display

The plugin shows several key metrics:
- **Carbon Intensity** (gCO₂eq/kWh): The amount of carbon dioxide emitted per kilowatt-hour of electricity used
- **24hr Relative Cleanliness** (%): How clean the grid is compared to the next 24 hours
- **Power Source Breakdown**: Percentage of power from renewable and fossil fuel sources

### Grid Cleanliness Indicators

The emoji shows how clean your electricity is right now relative to the next 24 hours:

| Emoji | Meaning |
|-------|---------|
| 🌿 | Extremely Clean - Among the cleanest 20% of times |
| 🌱 | Cleaner than Average |
| 😑 | Average Conditions |
| 😫 | Dirtier than Average |
| 😡 | Very Dirty |
| ⛔ | Extremely Dirty |
| ❓ | Data Unavailable |

For example:
- "🌿 (77%) 245 gCO₂eq/kWh" means the grid cleanliness is in the top 77th percentile relative to the next 24 hours
- "⛔ (15%) 450 gCO₂eq/kWh" means the grid cleanliness is in the bottom 15th percentile relative to the next 24 hours

This can help you decide when to run energy-intensive tasks for minimum environmental impact.

## Installation

1. Install [xbar](https://xbarapp.com/)
2. Open xbar and click "Browse Plugins"
3. Search for "Carbon Intensity"
4. Click "Install"
5. Configure your API keys and zones (see Configuration below)
6. Refresh xbar

## Configuration

1. Get your API credentials:
   - Get an [Electricity Maps API key](https://api-portal.electricitymaps.com/signup)
   - Sign up for [WattTime API access](https://www.watttime.org/api-documentation/#register-new-user)

2. Find your zone information (see Zones section below)

3. Configure the plugin:
   - Create a new file in the xbar plugins directory called `carbon-intensity.1h.js.vars.json`
   - Copy this template and replace with your values:
     ```json
     {
       "ELECTRICITY_MAPS_API_KEY": "your-electricity-maps-api-key-here",
       "ELECTRICITY_MAPS_ZONE": "your-electricity-maps-zone-here",
       "WATTTIME_USERNAME": "your-watt-time-username-here",
       "WATTTIME_PASSWORD": "your-watt-time-password-here",
       "WATTTIME_ZONE": "your-watt-time-zone-here"
     }
     ```

Note: The `.vars.json` file contains your API keys and should not be shared or committed to version control.

## Zones
Common zones for US regions:

| Region | Electricity Maps | WattTime |
|--------|-----------------|-----------|
| Northern California | US-CAISO_NORTH | CAISO_NORTH |
| Southern California | US-CAISO_SOUTH | CAISO_SOUTH |
| New York | US-NY | NYISO |
| New England | US-NE | ISONE |
| Pennsylvania-New Jersey-Maryland | US-PJM | PJM |
| Midcontinent | US-MISO | MISO |
| Texas | US-TEX | ERCOT |
| Utah-Wyoming-Colorado | US-NW-PACE | PACE |

Find the zone for your location:
- [Electricity Maps Zones](https://static.electricitymaps.com/api/docs/index.html#zones)
- [WattTime Balancing Authorities](https://www.watttime.org/api-documentation/#ba-from-location)

## Finding Your Zone

1. **Electricity Maps Zone**:
   - Visit [Electricity Maps Live Map](https://app.electricitymaps.com/map)
   - Click on your location
   - Your zone ID will appear in the URL (e.g., `US-CAISO_NORTH`)

2. **WattTime Zone**:
   - Visit [WattTime Explorer](https://www.watttime.org/explorer/)
   - Enter your location
   - Your balancing authority code will be shown (e.g., `CAISO_NORTH`)

Common US zones for reference:

## Features
- Real-time carbon intensity in gCO₂eq/kWh
- Grid cleanliness percentile
- Visual indicators for grid cleanliness
- Power source breakdown
- Hourly updates

## Data Sources
- [Electricity Maps](https://www.electricitymaps.com/): Carbon intensity and power source breakdown
- [WattTime](https://www.watttime.org/): Real-time grid cleanliness data

## License
MIT