const express = require('express');
const cors = require('cors');
const session = require('express-session');
const { TwitterApi } = require('twitter-api-v2');
//require('dotenv').config();
require('dotenv').config({ path: '../.env' });

console.log({
    TWITTER_APP_KEY: process.env.TWITTER_APP_KEY,
    TWITTER_APP_SECRET: process.env.TWITTER_APP_SECRET,
    TWITTER_ACCESS_TOKEN: process.env.TWITTER_ACCESS_TOKEN,
    TWITTER_ACCESS_SECRET: process.env.TWITTER_ACCESS_SECRET,
});

const app = express();

//'https://raisedotwin-backend-5df2969fc61f.herokuapp.com'
// CORS configuration https://raise-xi.vercel.app/
const corsOptions = {
    origin: [
        'http://localhost:3000',  // for local development
        'https://raisedotwin-3011aff35157.herokuapp.com', // for production
        'https://raise-xi.vercel.app' // add your Vercel domain

    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET || 'your_secret_key', // Use environment variable for security
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set secure cookies to false for local development
}));

//SEARCHING FOR TWTTIER USERS 
// Step 3: Use the access token to fetch user data
app.get('/api/user/:username', async (req, res) => {
    try {
        const userClient = new TwitterApi({
            //appKey: "Gid7XqRwbOq0lsYOgojpZdRyG",
            //appSecret: "eDFa3gz5cCoUwXrV0T37q3jYW58OXQhM0aSCi8WFOCBeCyGrDp",
            //accessToken: "1810715074291740672-Yr7eSmoT5bF8k6yPj5yBtt6QcDHSO2",
            //accessSecret: "LtCLCu0CeS95FFtxI1ukc8Wnebui7RZR31V6AhiePdd3b",
            appKey: process.env.TWITTER_APP_KEY,
            appSecret: process.env.TWITTER_APP_SECRET,
            accessToken: process.env.TWITTER_ACCESS_TOKEN,
            accessSecret: process.env.TWITTER_ACCESS_SECRET,
        });
        const user = await userClient.v2.userByUsername(req.params.username);
        res.json(user);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: error.message });
    }
});

// Route with preset username
app.get('/api/test-user', async (req, res) => {
    try {
        const userClient = new TwitterApi({
            appKey: "Gid7XqRwbOq0lsYOgojpZdRyG",
            appSecret: "eDFa3gz5cCoUwXrV0T37q3jYW58OXQhM0aSCi8WFOCBeCyGrDp",
            accessToken: "1810715074291740672-Yr7eSmoT5bF8k6yPj5yBtt6QcDHSO2",
            accessSecret: "LtCLCu0CeS95FFtxI1ukc8Wnebui7RZR31V6AhiePdd3b",
        });
        const presetUsername = 'btc_lyric'; // Replace with any username you want to test
        const user = await userClient.v2.userByUsername(presetUsername);
        res.json(user);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/users/:usernames', async (req, res) => {
    try {
        const userClient = new TwitterApi({
            appKey: "Gid7XqRwbOq0lsYOgojpZdRyG",
            appSecret: "eDFa3gz5cCoUwXrV0T37q3jYW58OXQhM0aSCi8WFOCBeCyGrDp",
            accessToken: "1810715074291740672-Yr7eSmoT5bF8k6yPj5yBtt6QcDHSO2",
            accessSecret: "LtCLCu0CeS95FFtxI1ukc8Wnebui7RZR31V6AhiePdd3b",
        });
        const user = await userClient.v2.usersByUsernames(req.params.usernames.split(','));
        res.json(user);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
