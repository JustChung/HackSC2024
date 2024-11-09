from flask import Flask, jsonify

app=Flask(__name__)

@app.route('/')
def test():
    return jsonify({"message":"hello"})


@app.route('/upload')
def test():
    
    # go to database, yuplaod videfo, return aseucces 
    return jsonify({"message":"hello"})


@app.route('/getRecommendedVideos')
def test():
    return jsonify({"message":"hello"})


@app.route('/edit/username')
def test():
    return jsonify({"message":"hello"})