from flask import Flask, redirect, make_response, jsonify
from flask_cors import CORS
import subprocess
import json

app = Flask(__name__)
CORS(app)

json_file_path = 'scraper/data.json'

@app.route('/data', methods=['GET'])
def data():
    with open(json_file_path, 'r') as file:
        data = json.load(file)
    return jsonify(data)


@app.route('/scrape', methods=['GET'])
def scrape():
    subprocess.run(['python3', 'scraper/main.py'], check=True)
    response = make_response('OK', 200)
    return response

if __name__ == '__main__':
    app.run(debug=True)