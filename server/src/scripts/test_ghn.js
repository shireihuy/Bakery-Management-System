require('dotenv').config();
const ghnClient = require('../utils/ghnClient');

async function testGHN() {
    console.log('--- Testing GHN Connection ---');
    console.log('Token (length):', process.env.GHN_TOKEN ? process.env.GHN_TOKEN.length : 0);
    console.log('Shop ID:', process.env.GHN_SHOP_ID);
    console.log('Base URL:', process.env.GHN_BASE_URL);

    if (!process.env.GHN_TOKEN || process.env.GHN_TOKEN === 'your_token_here') {
        console.error('ERROR: You need to put your real Token (from 5sao.ghn.dev) in the .env file!');
        process.exit(1);
    }

    try {
        console.log('\nFetching Provinces...');
        const provinces = await ghnClient.getProvinces();
        console.log(`Success! Found ${provinces.length} provinces.`);

        // Find HCMC or Hanoi
        const hcmc = provinces.find(p => p.ProvinceName.includes('Hồ Chí Minh'));
        if (hcmc) {
            console.log(`Province Found: ${hcmc.ProvinceName} (ID: ${hcmc.ProvinceID})`);
            
            console.log(`\nFetching Districts for ${hcmc.ProvinceName}...`);
            const districts = await ghnClient.getDistricts(hcmc.ProvinceID);
            console.log(`Success! Found ${districts.length} districts.`);

            // Show first 5 districts
            console.log('First 5 districts:', districts.slice(0, 5).map(d => d.DistrictName).join(', '));
        }

    } catch (error) {
        console.error('GHN Test Failed:', error.message);
    }
}

testGHN();
