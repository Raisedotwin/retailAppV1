// app/api/twitter/users/[usernames]/route.js
import { TwitterApi } from 'twitter-api-v2';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
    const { usernames } = params;

    try {
        const userClient = new TwitterApi({
            appKey: process.env.TWITTER_APP_KEY,
            appSecret: process.env.TWITTER_APP_SECRET,
            accessToken: process.env.TWITTER_ACCESS_TOKEN,
            accessSecret: process.env.TWITTER_ACCESS_SECRET,
        });

        const users = await userClient.v2.usersByUsernames(usernames.split(','));
        
        return NextResponse.json(users);
    } catch (error) {
        console.error('Error fetching profiles:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}