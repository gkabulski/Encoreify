import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.accessToken) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const { tracks } = await req.json();

        if (!tracks || !Array.isArray(tracks) || tracks.length === 0) {
            return NextResponse.json({ error: "No tracks provided" }, { status: 400 });
        }

        const token = session.accessToken;

        // 1. Get the Current User's ID
        const userRes = await fetch("https://api.spotify.com/v1/me", {
            headers: { Authorization: `Bearer ${token}` },
        });
        const userData = await userRes.json();
        const userId = userData.id;

        // 2. Search for each track to get Spotify URIs
        const trackUris: string[] = [];
        for (const trackName of tracks) {
            const searchRes = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(trackName)}&type=track&limit=1`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const searchData = await searchRes.json();
            if (searchData.tracks && searchData.tracks.items.length > 0) {
                trackUris.push(searchData.tracks.items[0].uri);
            }
        }

        if (trackUris.length === 0) {
            return NextResponse.json({ error: "Could not find any of the tracks on Spotify." }, { status: 404 });
        }

        // 3. Create a new Playlist
        const playlistRes = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: `Encoreify: ${new Date().toLocaleDateString()}`,
                description: "Created automatically from a concert programme photo via Encoreify.",
                public: true
            })
        });
        const playlistData = await playlistRes.json();
        const playlistId = playlistData.id;
        const playlistUrl = playlistData.external_urls.spotify;

        // 4. Add the tracks to the new Playlist
        await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                uris: trackUris
            })
        });

        return NextResponse.json({
            success: true,
            playlistUrl,
            found_tracks: trackUris.length,
            total_requested: tracks.length
        });

    } catch (error) {
        console.error("Error creating playlist:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
