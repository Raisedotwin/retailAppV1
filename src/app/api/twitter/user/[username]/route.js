// app/api/twitter/user/[username]/route.js
import { TwitterApi } from 'twitter-api-v2';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
    const { username } = params;

    try {
        const userClient = new TwitterApi({
            appKey: process.env.TWITTER_APP_KEY,
            appSecret: process.env.TWITTER_APP_SECRET,
            accessToken: process.env.TWITTER_ACCESS_TOKEN,
            accessSecret: process.env.TWITTER_ACCESS_SECRET,
        });

        // Specify the fields you want to include in the response
        const user = await userClient.v2.userByUsername(username, {
            'user.fields': [
                'profile_image_url',
                'description',
                'created_at',
                'url',
                'protected',
                'verified'
            ]
        });
        
        return NextResponse.json(user);
    } catch (error) {
        console.error('Error fetching profile:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}