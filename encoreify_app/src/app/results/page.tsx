"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { MusicalNoteIcon, PlusIcon } from "@heroicons/react/24/solid";

export default function ResultsPage() {
    const [tracks, setTracks] = useState<string[]>([]);
    const [playlistName, setPlaylistName] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const { data: session } = useSession();
    const router = useRouter();

    useEffect(() => {
        // Retrieve the temporarily stored tracks
        const stored = sessionStorage.getItem("parsedTracks");
        if (stored) {
            setTracks(JSON.parse(stored));
        } else {
            router.push("/upload");
        }
    }, [router]);

    const handleTrackChange = (index: number, val: string) => {
        const newTracks = [...tracks];
        newTracks[index] = val;
        setTracks(newTracks);
    };

    const removeTrack = (index: number) => {
        setTracks(tracks.filter((_, i) => i !== index));
    };

    const addTrack = () => {
        setTracks([...tracks, ""]);
    };

    const handleConnectSpotify = async () => {
        if (!session) {
            signIn("spotify");
            return;
        }

        setIsCreating(true);
        try {
            const res = await fetch("/api/playlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tracks: tracks.filter(t => t.trim() !== ""),
                    playlistName: playlistName.trim()
                }),
            });

            const data = await res.json();
            if (res.ok) {
                alert(`Success! Playlist created with ${data.found_tracks} out of ${data.total_requested} requested tracks.\n\nOpening Spotify...`);
                // Open the playlist in a new tab
                window.open(data.playlistUrl, "_blank");
            } else {
                alert("Error: " + data.error);
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred creating the playlist.");
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="flex flex-col w-full max-w-2xl mx-auto space-y-8 py-8">
            <div className="space-y-2">
                <h2 className="text-3xl font-bold">Extracted Tracks</h2>
                <p className="text-zinc-400">Review and edit the detected musical pieces before creating the playlist.</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-6 space-y-4 shadow-xl">
                {tracks.length === 0 ? (
                    <p className="text-zinc-500 text-center py-8">No tracks found. Try adding some manually.</p>
                ) : (
                    tracks.map((track, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500">
                                {i + 1}
                            </div>
                            <input
                                type="text"
                                value={track}
                                onChange={(e) => handleTrackChange(i, e.target.value)}
                                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-100 placeholder-zinc-700 outline-none focus:border-emerald-500 transition-colors"
                                placeholder="e.g. Scarlatti Sonata K347"
                            />
                            <button
                                onClick={() => removeTrack(i)}
                                className="p-3 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors"
                                title="Remove Track"
                            >
                                ✕
                            </button>
                        </div>
                    ))
                )}

                <button
                    onClick={addTrack}
                    className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-zinc-700 rounded-xl text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 hover:bg-zinc-800/50 transition-all mt-4"
                >
                    <PlusIcon className="w-5 h-5" />
                    <span>Add Track Manually</span>
                </button>
            </div>

            <div className="pt-8 border-t border-zinc-800/50 space-y-4">
                <div className="space-y-2">
                    <label htmlFor="playlistName" className="text-sm font-medium text-zinc-400">Playlist Name (Optional)</label>
                    <input
                        id="playlistName"
                        type="text"
                        value={playlistName}
                        onChange={(e) => setPlaylistName(e.target.value)}
                        placeholder={`Encoreify: ${new Date().toLocaleDateString()}`}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-100 placeholder-zinc-700 outline-none focus:border-emerald-500 transition-colors"
                    />
                </div>
                <button
                    onClick={handleConnectSpotify}
                    disabled={isCreating}
                    className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold transition-all ${isCreating
                        ? "bg-[#1DB954]/50 cursor-not-allowed text-black/50"
                        : "bg-[#1DB954] hover:bg-[#1ed760] text-black shadow-[0_0_30px_-10px_rgba(29,185,84,0.5)] hover:shadow-[0_0_40px_-10px_rgba(29,185,84,0.7)] hover:-translate-y-1"
                        }`}
                >
                    <MusicalNoteIcon className={`w-6 h-6 ${isCreating ? "animate-pulse" : ""}`} />
                    <span>{isCreating ? "Creating Playlist..." : (session ? "Create Playlist" : "Connect Spotify")}</span>
                </button>
            </div>
        </div>
    );
}
