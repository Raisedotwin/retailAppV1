// Code to authenticate with Twitter API and fetch user data
//require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5001;
const API_KEY = '220eea5947c2c8a51648836523e5115d21659734b85a5bcad8b001e5bf6713c6'; // Your API key

app.use(cors());

// MongoDB connection
//mongoose.connect('mongodb://localhost:27017/vaults', {
  //useNewUrlParser: true,
  //useUnifiedTopology: true,
//});

// Define a schema and model for the vaults
//const vaultSchema = new mongoose.Schema({
  //runeName: String,
  //vaultId: Number,
  //etcherAddress: String,
//});

//const Vault = mongoose.model('Vault', vaultSchema);

// Routes
//app.post('/api/vaults', async (req, res) => {
  //const { runeName, vaultId, etcherAddress } = req.body;

  //const newVault = new Vault({
    //runeName,
    //vaultId,
    //etcherAddress,
  //});

  // try {
    //const savedVault = await newVault.save();
    //res.status(201).json(savedVault);
  //} catch (error) {
    //res.status(500).json({ message: error.message });
  //}
//});

// Example endpoint to fetch runes holders
app.get('/api/getRunesHolders', async (req, res) => {
  const runeid = req.query.runeid;
  if (!runeid) {
    return res.status(400).json({ message: 'runeid parameter is required' });
  }

  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(`https://open-api.unisat.io/v1/indexer/runes/${runeid}/holders?start=0&limit=16`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`, // Include the API key in the headers
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ message: 'Failed to fetch data from Unisat API' });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Test endpoint to fetch runes holders with a preset rune ID
app.get('/api/getRunesHoldersTest', async (req, res) => {
  try {
    const runeid = 'DOG-TO-THE-MOON'; // replace with your preset rune ID
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(`https://open-api.unisat.io/v1/indexer/runes/${runeid}/holders?start=0&limit=16`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`, // Include the API key in the headers
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ message: 'Failed to fetch data from Unisat API' });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Endpoint to fetch runes balance list by address
//If DOG To THE MOON IS NOT LISTED WRITE UNST%AKED ON STAKING PAGE FALSE INPUT 
app.get('/api/getRunesBalance', async (req, res) => {
  const address = req.query.address;
  if (!address) {
    return res.status(400).json({ message: 'address parameter is required' });
  }

  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(`https://open-api.unisat.io/v1/indexer/address/${address}/runes/balance-list`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`, // Include the API key in the headers
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ message: 'Failed to fetch data from Unisat API' });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Test endpoint to fetch runes balance list with a preset address
app.get('/api/getRunesBalanceTest', async (req, res) => {
  try {
    const address = 'bc1pzt6grd05x82lued9qkv3rht4cdhy9m7lhl23ad997s8tkh5c4mfs9wgxd0'; // replace with your preset test address
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(`https://open-api.unisat.io/v1/indexer/address/${address}/runes/balance-list`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`, // Include the API key in the headers
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ message: 'Failed to fetch data from Unisat API' });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  // Periodically fetch runes holders
  //setInterval(fetchRunesHolders, 2 * 60 * 1000); // every 2 minutes
});

async function fetchRunesHolders() {
  try {
    const runeid = '10'; // replace with your rune ID
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(`http://localhost:${PORT}/api/getRunesHolders?runeid=${runeid}`);
    const data = await response.json();
    console.log('Runes holders:', data);
  } catch (error) {
    console.error('Failed to fetch runes holders:', error);
  }
}



