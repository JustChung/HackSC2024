from flask import Flask, request, jsonify
import os
import requests

app = Flask(__name__)

WEBAPP_UPLOAD_URL = "https://yourwebapp.com/upload"
ZOOM_DOWNLOAD_URL = "https://zoom.us/download_url"

@app.route('/upload-recording', methods=['POST'])
def upload_recording():
    download_url = request.json.get('download_url')

    # Download the recording file from Zoom
    response = requests.get(download_url, headers={"Authorization": f"Bearer {JWT_TOKEN}"})
    if response.status_code == 200:
        # Save file locally
        file_path = "lecture_recording.mp4"
        with open(file_path, 'wb') as f:
            f.write(response.content)

        # Upload to web application
        with open(file_path, 'rb') as f:
            files = {'file': f}
            webapp_response = requests.post(WEBAPP_UPLOAD_URL, files=files)
            if webapp_response.status_code == 200:
                return jsonify({"message": "File uploaded successfully."}), 200
            else:
                return jsonify({"message": "Error uploading file to webapp."}), 500
    else:
        return jsonify({"message": "Error downloading recording from Zoom."}), 500

if __name__ == '__main__':
    app.run(debug=True)



# @app.route('/upload')
# def test():
    
#     # go to database, yuplaod videfo, return aseucces 
#     return jsonify({"message":"hello"})