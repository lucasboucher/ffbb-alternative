from flask import Flask, render_template, redirect
import subprocess

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/dev')
def dev():
    return render_template('dev/index.html')

@app.route('/team')
def team():
    return render_template('team/index.html')   

@app.route('/scrape', methods=['GET'])
def scrape():
    try:
        subprocess.run(['python3', 'scraper/main.py'], check=True)
    except Exception as e:
        print("Erreur : ", e)
    return redirect('/')

if __name__ == '__main__':
    app.run(debug=True)
