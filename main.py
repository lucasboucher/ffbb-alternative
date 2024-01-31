import subprocess
import requests

custom_server_process = subprocess.Popen(['gunicorn', '-w', '4', '-b', ':8001', 'server.api:api'])

while True:
    try:
        response = requests.get('http://localhost:8001/data')
        if (response.status_code == 200):
            break
        else:
            requests.get('http://localhost:8001/scrape')
    except requests.ConnectionError:
        pass

http_server_process = subprocess.Popen(['python3', '-m', 'http.server', '--directory', 'src'])

http_server_process.wait()
custom_server_process.wait()