import requests
import sys
import os

url = "http://localhost:8000/api/parse-image"
image_path = r"/mnt/c/Users/greg/Documents/Github/Encoreify/wigmore.jpeg"

if not os.path.exists(image_path):
    print(f"Error: Could not find image at {image_path}")
    sys.exit(1)

print(f"Sending {image_path} to API...")

with open(image_path, "rb") as f:
    files = {"file": ("wigmore.jpeg", f, "image/jpeg")}
    response = requests.post(url, files=files)

if response.status_code == 200:
    print("Success!")
    print(response.json())
else:
    print(f"Error {response.status_code}: {response.text}")
