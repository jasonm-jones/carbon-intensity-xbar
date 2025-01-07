#!/usr/bin/env node

const fs = require('fs');
const readline = require('readline');
const { exec } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function setup() {
  console.log('\n🌱 Carbon Intensity xbar Plugin Setup\n');

  // Check if xbar is installed
  exec('which xbar', async (error) => {
    if (error) {
      console.log('❌ xbar is not installed. Please install it first:');
      console.log('   brew install xbar\n');
      process.exit(1);
    }

    console.log('✅ xbar is installed\n');

    // Create .env file
    console.log('Let\'s set up your API credentials:\n');

    const emapsKey = await question('Enter your Electricity Maps API key: ');
    const emapsZone = await question('Enter your Electricity Maps zone (e.g., US-CAISO_NORTH): ');
    const wtUsername = await question('Enter your WattTime username: ');
    const wtPassword = await question('Enter your WattTime password: ');
    const wtZone = await question('Enter your WattTime zone (e.g., CAISO_NORTH): ');

    const envContent = `ELECTRICITY_MAPS_API_KEY=${emapsKey}
ELECTRICITY_MAPS_ZONE=${emapsZone}
WATTTIME_USERNAME=${wtUsername}
WATTTIME_PASSWORD=${wtPassword}
WATTTIME_ZONE=${wtZone}`;

    fs.writeFileSync('.env', envContent);
    console.log('\n✅ Created .env file');

    // Install dependencies
    console.log('\nInstalling dependencies...');
    exec('npm install', (error, stdout) => {
      if (error) {
        console.log('❌ Error installing dependencies:', error);
        process.exit(1);
      }

      console.log('✅ Dependencies installed\n');

      // Create symlink to xbar plugins directory
      const homeDir = process.env.HOME;
      const pluginPath = `${homeDir}/Library/Application Support/xbar/plugins/carbon-intensity.1h.js`;
      
      try {
        if (fs.existsSync(pluginPath)) {
          fs.unlinkSync(pluginPath);
        }
        fs.symlinkSync(
          `${process.cwd()}/carbon-intensity.1h.js`,
          pluginPath
        );
        fs.chmodSync(pluginPath, '755');
        console.log('✅ Plugin installed to xbar\n');
      } catch (error) {
        console.log('❌ Error creating symlink:', error);
        console.log('   Please manually copy carbon-intensity.1h.js to your xbar plugins directory\n');
      }

      console.log('🎉 Setup complete! Please refresh xbar to see the plugin.\n');
      rl.close();
    });
  });
}

setup(); 