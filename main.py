import subprocess
import requests

custom_server_process = subprocess.Popen(['python3', 'server/api.py'])

while True:
    try:
        response = requests.get('http://127.0.0.1:5000/data')
        if (response.status_code == 200):
            break
        else:
            requests.get('http://127.0.0.1:5000/scrape')
    except requests.ConnectionError:
        pass

http_server_process = subprocess.Popen(['python3', '-m', 'http.server', '--directory', 'src'])

http_server_process.wait()
custom_server_process.wait()