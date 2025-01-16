# Carbon Intensity xbar Plugin

What if you could reduce your electricity carbon footprint by 20-50% or more without spending a dime?  This free [xbar plugin](https://xbarapp.com/) shows real-time carbon intensity and cleanliness data for your local grid in your menu bar.  The purpose is to help you make real-time decisions about when to run electricity-intensive tasks (laundry, HVAC, EV charging, etc.) to minimize your carbon footprint. In some parts of the country, the grid may be up to [80% dirtier](https://github.com/jasonm-jones/grid-carbon-intensity/blob/main/README.md) than other times in the same day.  
<img src="./images/avg-daily-carbon-intensity-variability.png" width="800"/>

## Screenshots
<img src="./images/screenshot-dirty-grid.png" width="400"/>

<!-->
| Dirty Grid Example | *Relatively* Clean Grid Example |
|------------|-----------|
| <img src="./carbon-intensity-screenshot.png" width="400"/> | <img src="./screenshot-happy-state.png" width="400"/> |
-->
<!--github image source https://raw.githubusercontent.com/jasonm-jones/carbon-intensity-xbar/main/screenshot-happy-state.png-->
## Understanding the Display

The plugin shows several key metrics:
- **Relative Cleanliness** (%): How clean the grid is compared to the last 24 hours
- **Carbon Intensity** (gCO₂eq/kWh): The amount of carbon dioxide emitted per kilowatt-hour of electricity used
- **Current Power Breakdown**: Percentage of power from renewable and fossil fuel sources

### Grid Cleanliness Indicators

The emoji shows how clean your grid electricity is right now **relative to the last 24 hours**:

| Emoji | Meaning |
|-------|---------|
| 🌿 | Relatively Clean - Top 20% cleanest kW's of the last 24 hours |
| 🌱 | Cleaner than Average - 60-80th percentile |
| 😑 | Average Conditions - 40-60th percentile |
| 😡 | Dirtier than Average - 20-40th percentile |
| ⛔ | Very Dirty - Bottom 20% |
| ❓ | Data Unavailable |

For example:
- "🌿 (77%) 245 gCO₂eq/kWh" means the grid cleanliness is in the 77th percentile (top 23% cleanest) relative to the last 24 hours
- "⛔ (15%) 450 gCO₂eq/kWh" means the grid cleanliness is in the 15th percentile (bottom 85% dirtiest) relative to the last 24 hours

This can help you decide when to run energy-intensive tasks for minimum environmental impact.

## Installation

1. Install [xbar](https://xbarapp.com/)
2. Open xbar and click "Browse Plugins"
3. Search for "Carbon Intensity"
4. Click "Install"
5. Install required dependencies:
   ```bash
   # Install system dependencies (macOS)
   brew install pkg-config cairo pango libpng jpeg giflib
   
   # Install npm packages
   npm install canvas
   ```
6. Configure your API keys and zones (see Configuration below)
7. Refresh xbar

## Configuration

1. Get your API credentials:
   - Get an [Electricity Maps API key](https://api-portal.electricitymaps.com/signup)

2. Find your zone information (see Zones section below)

3. Configure the plugin:
   - Create a new file in the xbar plugins directory called `carbon-intensity.1h.js.vars.json`
     (typically at `~/Library/Application Support/xbar/plugins/carbon-intensity.1h.js.vars.json`)
   - Copy this template and replace with your values:
     ```json
     {
       "ELECTRICITY_MAPS_API_KEY": "your-electricity-maps-api-key-here",
       "ELECTRICITY_MAPS_ZONE": "your-electricity-maps-zone-here"
     }
     ```

Note: The `.vars.json` file contains your API key and should not be shared or committed to version control.

## Zones
Common zones for US regions:

| Region | Electricity Maps |
|--------|-----------------|
| Northern California | US-CAISO_NORTH |
| Southern California | US-CAISO_SOUTH |
| New York | US-NY |
| New England | US-NE |
| Pennsylvania-New Jersey-Maryland | US-PJM |
| Midcontinent | US-MISO |
| Texas | US-TEX |
| Utah-Wyoming-Colorado | US-NW-PACE |

## Finding Your Zone

1. **Electricity Maps Zone**:
   - Visit [Electricity Maps Live Map](https://app.electricitymaps.com/map)
   - Click on your location
   - Your zone ID will appear in the URL (e.g., `US-CAISO_NORTH`)

OR visit [Electricity Maps Zones](https://static.electricitymaps.com/api/docs/index.html#zones)

## Features
- Real-time carbon intensity in gCO₂eq/kWh
- Grid cleanliness percentile
- Visual indicators for grid cleanliness
- Power source breakdown
- Hourly updates

## Data Sources
- [Electricity Maps](https://www.electricitymaps.com/): Carbon intensity and power source breakdown

## License
MIT