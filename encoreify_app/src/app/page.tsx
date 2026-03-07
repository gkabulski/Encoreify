import Link from "next/link";
import { CameraIcon, MusicalNoteIcon } from "@heroicons/react/24/outline";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center text-center space-y-12 py-12 w-full">
      <div className="space-y-6 max-w-xl">
        <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
          From Paper to <span className="text-emerald-400">Playlist</span>
        </h2>
        <p className="text-lg text-zinc-400">
          Snap a photo of your concert programme, and we'll automatically extract the musical pieces and create a Spotify playlist for you.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-8">
        <Link
          href="/upload"
          className="group relative flex items-center justify-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold px-8 py-4 rounded-full transition-all duration-300 shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)] hover:shadow-[0_0_60px_-15px_rgba(16,185,129,0.7)] hover:-translate-y-1 w-full sm:w-auto"
        >
          <CameraIcon className="w-6 h-6" />
          <span>Scan Programme</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-16 w-full text-left pt-12 border-t border-zinc-800/50">
        <div className="space-y-3">
          <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800 text-emerald-400 font-bold">1</div>
          <h3 className="font-semibold text-lg">Take a Photo</h3>
          <p className="text-zinc-500 text-sm">Capture the concert programme or setlist.</p>
        </div>
        <div className="space-y-3">
          <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800 text-emerald-400 font-bold">2</div>
          <h3 className="font-semibold text-lg">AI Extraction</h3>
          <p className="text-zinc-500 text-sm">Our AI detects the composers and pieces.</p>
        </div>
        <div className="space-y-3">
          <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800 text-emerald-400 font-bold">3</div>
          <h3 className="font-semibold text-lg">Listen</h3>
          <p className="text-zinc-500 text-sm">Save the playlist directly to your Spotify.</p>
        </div>
      </div>
    </div>
  );
}
