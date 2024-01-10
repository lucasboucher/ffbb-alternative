from flask import Flask, make_response
from flask_cors import CORS
import subprocess
import json

app = Flask(__name__)
CORS(app)

@app.route('/data', methods=['GET'])
def data():
    try:
        with open('server/data.json', 'r') as file:
            data = json.load(file)
        return data
    except FileNotFoundError:
        return "Le fichier 'data.json' n'a pas été trouvé."
        
@app.route('/scrape', methods=['GET'])
def scrape():
    subprocess.run(['python3', 'server/scraper.py'], check=True)
    response = make_response('OK', 200)
    return response

if __name__ == '__main__':
    app.run(debug=True)