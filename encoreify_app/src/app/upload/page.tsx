"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { PhotoIcon, DocumentArrowUpIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

export default function UploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append("file", file);

            // Call the FastAPI backend on Render
            const res = await fetch("https://encoreify.onrender.com/api/parse-image", {
                method: "POST",
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                // Simply storing in sessionStorage for now to pass to results page
                sessionStorage.setItem("parsedTracks", JSON.stringify(data.parsed_tracks));
                router.push("/results");
            } else {
                console.error("Failed to parse image");
                alert("Failed to analyze image. Ensure the backend is running.");
                setIsUploading(false);
            }
        } catch (error) {
            console.error("Error uploading file:", error);
            alert("Error uploading file. Ensure the backend is running.");
            setIsUploading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center w-full max-w-xl mx-auto space-y-8 py-12">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold">Upload Programme</h2>
                <p className="text-zinc-400">Take a photo of the concert programme or upload an image from your gallery.</p>
            </div>

            <div
                className={`w-full aspect-[3/4] sm:aspect-video border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 transition-all ${preview ? "border-emerald-500/50 bg-emerald-500/5" : "border-zinc-800 hover:border-zinc-600 bg-zinc-900/50 hover:bg-zinc-900"
                    }`}
                onClick={() => !preview && fileInputRef.current?.click()}
            >
                {preview ? (
                    <div className="relative w-full h-full flex flex-col items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={preview} alt="Preview" className="max-h-full max-w-full rounded-lg object-contain" />
                        <button
                            onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); }}
                            className="absolute top-2 right-2 bg-zinc-900/80 text-zinc-300 p-2 rounded-full hover:bg-red-500/20 hover:text-red-400 transition-colors"
                        >
                            ✕
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center space-y-4 text-zinc-500 cursor-pointer">
                        <PhotoIcon className="w-16 h-16" />
                        <span className="font-medium">Tap to take photo or choose image</span>
                    </div>
                )}

                {/* Uses HTML5 capture attribute to open camera on mobile natively */}
                <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                />
            </div>

            <div className="w-full">
                <button
                    onClick={handleUpload}
                    disabled={!file || isUploading}
                    className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition-all ${file && !isUploading
                        ? "bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-[0_0_20px_-5px_rgba(16,185,129,0.5)]"
                        : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                        }`}
                >
                    {isUploading ? (
                        <>
                            <ArrowPathIcon className="w-6 h-6 animate-spin" />
                            <span>Analyzing Image...</span>
                        </>
                    ) : (
                        <>
                            <DocumentArrowUpIcon className="w-6 h-6" />
                            <span>Extract Tracks</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
