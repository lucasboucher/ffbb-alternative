from flask import Flask, render_template, make_response
from scraper.main import run_scraper
import json

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/team')
def team():
    return render_template('team.html')

@app.route('/previous-ranking')
def previous_ranking():
    return render_template('previous-ranking.html')

@app.route('/data')
def data():
    with open('scraper/data.json', 'r') as file:
        data = json.load(file)
    response = make_response(data, 200)
    return response

@app.route('/scrape')
def scrape():
    run_scraper()
    response = make_response("OK", 200)
    return response