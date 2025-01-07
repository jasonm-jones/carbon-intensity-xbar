# Carbon Intensity xbar Plugin

This xbar plugin displays real-time carbon intensity data from Electricity Maps and WattTime APIs for your local electricity grid.

## Features
- Shows current carbon intensity in gCO₂eq/kWh
- Displays MOER (Marginal Operating Emissions Rate) percentile
- Visual indicators (emojis) showing relative grid cleanliness
- Detailed power source breakdown
- Fossil fuel percentage calculation

## Prerequisites
- Node.js
- xbar
- Electricity Maps API key
- WattTime account credentials

## Installation
1. Install [xbar](https://xbarapp.com/)
2. Clone this repository
3. Create a symlink to the plugin in your xbar plugins folder:
   ```bash
   ln -s /path/to/repo/carbon-intensity.1h.js ~/Library/Application\ Support/xbar/plugins/
   ```
4. Make the script executable:
   ```bash
   chmod +x carbon-intensity.1h.js
   ```
5. Configure your API keys in the script

## Configuration
You'll need to set up:
1. Electricity Maps API key (get it from https://www.electricitymaps.com/)
2. WattTime credentials (get them from https://www.watttime.org/)
3. Set your appropriate zone codes for both services

## License
MIT