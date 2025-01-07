# Carbon Intensity xbar Plugin

Shows real-time carbon intensity and grid cleanliness data in your menu bar.

## Understanding the Display

The plugin shows two key metrics:
- **Carbon Intensity** (gCO₂eq/kWh): The amount of carbon dioxide emitted per unit of electricity
- **Grid Cleanliness Percentile** (%): How clean the grid is compared to typical conditions

### Grid Cleanliness Indicators

The emoji shows how clean your electricity is right now compared to typical conditions:

| Emoji | Percentile | Meaning |
|-------|------------|---------|
| 🌱 | 0-20% | Extremely Clean - Among the cleanest 20% of times |
| 🌿 | 21-40% | Cleaner than Average |
| 🍂 | 41-60% | Average Conditions |
| 💨 | 61-80% | Dirtier than Average |
| 🏭 | 81-90% | Very Dirty |
| ⚠️ | 91-100% | Extremely Dirty - Among the dirtiest 10% of times |

For example:
- "🌱 245 gCO₂eq/kWh (23%)" means the grid is cleaner than 77% of typical conditions
- "🏭 450 gCO₂eq/kWh (85%)" means the grid is dirtier than 85% of typical conditions

This can help you decide when to run energy-intensive tasks for minimum environmental impact.

## Quick Start

1. Install [xbar](https://xbarapp.com/)
2. Clone this repository:
   ```bash
   git clone https://github.com/jasonm-jones/carbon-intensity-xbar.git
   cd carbon-intensity-xbar
   ```

3. Run the setup script:
   ```bash
   node setup.js
   ```

4. Follow the prompts to enter your:
   - [Electricity Maps API key](https://www.electricitymaps.com/)
   - [WattTime credentials](https://www.watttime.org/)
   - Zone information

5. Refresh xbar

## Features
- Shows current carbon intensity in gCO₂eq/kWh
- Displays grid cleanliness percentile
- Visual indicators showing relative grid cleanliness
- Detailed power source breakdown
- Updates hourly

## Zones
Common zones for US regions:

| Region | Electricity Maps | WattTime |
|--------|-----------------|-----------|
| Northern California | US-CAISO_NORTH | CAISO_NORTH |
| Southern California | US-CAISO_SOUTH | CAISO_SOUTH |
| New York | US-NY | NYISO |
| New England | US-NE | ISONE |
| Texas | US-TEX | ERCOT |

[Full list of zones](https://static.electricitymaps.com/api/docs/index.html#zones)

## Data Sources
- [Electricity Maps](https://www.electricitymaps.com/): Provides carbon intensity and power source breakdown
- [WattTime](https://www.watttime.org/): Provides real-time grid cleanliness data

## License
MIT