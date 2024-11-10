from flask import Flask, jsonify
import requests
import json

ZOOM_API_URL = "https://api.zoom.us/v2/users/me/meetings"
JWT_TOKEN = "LIPmDghuTiSjPTiEPIm98A"

app=Flask(__name__)

headers = {
    "Authorization": f"Bearer {JWT_TOKEN}",
    "Content-Type": "application/json"
}

data = {
    "topic": "Zoom Lecture",
    "type": 2,  # Scheduled meeting
    "start_time": "2024-11-09T14:00:00Z",  # ISO8601 format
    "duration": 60,  # Duration in minutes
    "timezone": "America/New_York",
    "settings": {
        "host_video": True,
        "participant_video": True,
        "audio": "voip",
        "auto_recording": "cloud"  # Automatically record to Zoom cloud
    }
}

response = requests.post(ZOOM_API_URL, headers=headers, json=data)

if response.status_code == 201:
    meeting_info = response.json()
    meeting_id = meeting_info['id']
    join_url = meeting_info['join_url']
    print(f"Meeting created successfully! Join URL: {join_url}")
else:
    print(f"Error creating meeting: {response.text}")

@app.route('/')
def test():
    return jsonify({"message":"hello"})


# @app.route('/upload')
# def test():
    
#     # go to database, yuplaod videfo, return aseucces 
#     return jsonify({"message":"hello"})


# @app.route('/getRecommendedVideos')
# def test():
#     return jsonify({"message":"hello"})


# @app.route('/edit/username')
# def test():
#     return jsonify({"message":"hello"})



# def upload_zoom_recording(file_path, upload_url):
#     """
#     Uploads a Zoom recording to a web application.

#     Args:
#     file_path (str): The path to the Zoom recording file.
#     upload_url (str): The URL of the web application's upload endpoint.

#     Returns:
#     response: Server response to the POST request.
#     """
#     # Open the file in binary mode
#     with open(file_path, 'rb') as f:
#         # Define the name of the file field (depends on your webapp's API)
#         files = {'file': (file_path, f)}
#         # POST request to upload the file
#         response = requests.post(upload_url, files=files)
    
#     return response

# # Example usage
# file_path = 'path/to/your/zoom_recording.mp4'
# upload_url = 'https://yourwebapp.com/upload'
# response = upload_zoom_recording(file_path, upload_url)

# print('Status Code:', response.status_code)
# print('Response:', response.text)
