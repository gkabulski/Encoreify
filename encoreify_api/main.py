from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import io
import re
import base64
import os
import json
from dotenv import load_dotenv
from openai import AsyncOpenAI
from fastapi import HTTPException

load_dotenv()
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

app = FastAPI(title="Encoreify API", description="Backend for OCR and Track Parsing")

# Allow CORS for local development with Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "https://encoreify.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to Encoreify API"}

@app.post("/api/parse-image")
async def parse_image(file: UploadFile = File(...)):
    """
    Receives an image file, sends it to OpenAI Vision, and extracts track data.
    Supports caching to last_response.json if MOCK_OCR=true to save API requests.
    """
    is_mock = os.getenv("MOCK_OCR", "false").lower() == "true"
    
    if is_mock:
        if os.path.exists("last_response.json"):
            print("Using cached response from last_response.json")
            with open("last_response.json", "r") as f:
                return json.load(f)
        else:
            print("Using hardcoded mock response")
            return {
                "parsed_tracks": [
                    "Scarlatti: Sonata in G minor K347",
                    "Scarlatti: Sonata in G major K348",
                    "Cabanilles: Pasacalles de primer tono"
                ],
                "raw_text": "Mocked OCR text"
            }

    if not os.getenv("OPENAI_API_KEY"):
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY is not configured")
        
    content = await file.read()
    base64_image = base64.b64encode(content).decode('utf-8')
    mime_type = file.content_type or "image/jpeg"
    
    try:
        response = await client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful assistant that accurately reads concert programmes and identifies the musical pieces (tracks) being played. Output ONLY a clean, newline-separated list of the tracks formatted as 'Composer: Piece name (e.g. Scarlatti: Sonata in G minor K347)', with absolutely no other conversational text or markdown formatting."
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:{mime_type};base64,{base64_image}"
                            }
                        }
                    ]
                }
            ],
            max_tokens=500,
        )
        
        ocr_text = response.choices[0].message.content or ""
        
        # Parse the OCR text into tracks
        tracks = [t.strip() for t in ocr_text.split('\n') if t.strip()]
        
        result = {"parsed_tracks": tracks, "raw_text": ocr_text}
        
        # Save response for future mocking
        with open("last_response.json", "w") as f:
            json.dump(result, f)
            
        return result
    except Exception as e:
        print(f"Error calling OpenAI API: {e}")
        raise HTTPException(status_code=500, detail=f"Error analyzing image: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
