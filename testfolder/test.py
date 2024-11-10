import requests
import json

ZOOM_API_URL = "https://api.zoom.us/v2/users/me/meetings"
JWT_TOKEN = "your_zoom_jwt_token"

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

def check_recording(meeting_id):
    recording_url = f"https://api.zoom.us/v2/meetings/{meeting_id}/recordings"
    response = requests.get(recording_url, headers={"Authorization": f"Bearer {JWT_TOKEN}"})
    
    if response.status_code == 200:
        recording_data = response.json()
        if 'recording_files' in recording_data:
            recording_file = recording_data['recording_files'][0]  # Assuming only one recording
            download_url = recording_file['download_url']
            return download_url
    return None
