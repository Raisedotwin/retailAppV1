const express = require('express');
const cors = require('cors');
const session = require('express-session');
const { TwitterApi } = require('twitter-api-v2');
require('dotenv').config();

const app = express();

// CORS configuration https://raise-xi.vercel.app/
const corsOptions = {
    origin: [
        'http://localhost:3000',  // for local development
        'https://raisedotwin-3011aff35157.herokuapp.com', // your frontend
        'https://raisedotwin-backend-5df2969fc61f.herokuapp.com'

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

const client = new TwitterApi({
    appKey: "Gid7XqRwbOq0lsYOgojpZdRyG",
    appSecret: "eDFa3gz5cCoUwXrV0T37q3jYW58OXQhM0aSCi8WFOCBeCyGrDp",
    accessToken: "1810715074291740672-Yr7eSmoT5bF8k6yPj5yBtt6QcDHSO2",
    accessSecret: "LtCLCu0CeS95FFtxI1ukc8Wnebui7RZR31V6AhiePdd3b",
});

//const callbackUrl = "http://localhost:3001/api/callback";
const callbackUrl = "https://raisedotwin-3011aff35157.herokuapp.com/api/callback";


// Proxy endpoint to handle Twitter API requests
app.get('/api/proxy/twitter', async (req, res) => {
    const { accessToken, accessSecret } = req.session;

    if (!accessToken || !accessSecret) {
        return res.status(400).send('Not authenticated');
    }

    try {
        const userClient = new TwitterApi({
            appKey: "Gid7XqRwbOq0lsYOgojpZdRyG",
            appSecret: "eDFa3gz5cCoUwXrV0T37q3jYW58OXQhM0aSCi8WFOCBeCyGrDp",
            accessToken,
            accessSecret,
        });

        const user = await userClient.v2.me();
        res.json({ user, accessToken, accessSecret }); // Return user data and tokens
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/auth/twitter', async (req, res) => {
    try {
        const { url, oauth_token, oauth_token_secret } = await client.generateAuthLink(callbackUrl);
        req.session.oauth_token = oauth_token; // Store tokens in session
        req.session.oauth_token_secret = oauth_token_secret;
        res.redirect(url);
    } catch (error) {
        console.error('Error generating auth link:', error);
        res.status(500).json({ error: error.message });
    }
});

// Step 2: Handle callback from Twitter
app.get('/api/callback', async (req, res) => {
    const { oauth_token, oauth_verifier } = req.query;
    const { oauth_token: token, oauth_token_secret } = req.session;

    if (!oauth_token || !oauth_verifier || !token || !oauth_token_secret) {
        return res.status(400).send('Missing required parameters');
    }

    try {
        const { client: loggedClient, accessToken, accessSecret } = await client.login(oauth_token, oauth_token_secret, oauth_verifier);
        req.session.accessToken = accessToken;
        req.session.accessSecret = accessSecret;
        res.redirect('http://localhost:3000'); // Redirect to your front-end application
    } catch (error) {
        console.error('Error logging in with Twitter:', error);
        res.status(500).json({ error: error.message });
    }
});

//SEARCHING FOR TWTTIER USERS 
// Step 3: Use the access token to fetch user data
app.get('/api/user/:username', async (req, res) => {
    try {
        const userClient = new TwitterApi({
            appKey: "Gid7XqRwbOq0lsYOgojpZdRyG",
            appSecret: "eDFa3gz5cCoUwXrV0T37q3jYW58OXQhM0aSCi8WFOCBeCyGrDp",
            accessToken: "1810715074291740672-Yr7eSmoT5bF8k6yPj5yBtt6QcDHSO2",
            accessSecret: "LtCLCu0CeS95FFtxI1ukc8Wnebui7RZR31V6AhiePdd3b",
        });
        const user = await userClient.v2.userByUsername(req.params.username);
        res.json(user);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: error.message });
    }
});

//app.get('/api/user/:username', async (req, res) => {
    //try {
        //const userClient = new TwitterApi({
            //appKey: process.env.TWITTER_API_KEY,
            //appSecret: process.env.TWITTER_API_SECRET,
            //accessToken: process.env.TWITTER_ACCESS_TOKEN,
            //accessSecret: process.env.TWITTER_ACCESS_SECRET,
        //});
        //const user = await userClient.v2.userByUsername(req.params.username);
        //res.json(user);
    //} catch (error) {
        //console.error('Error fetching profile:', error);
        //res.status(500).json({ error: error.message });
    //}
//});

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
