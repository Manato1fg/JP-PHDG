from flask import Flask, render_template, request, redirect, url_for, jsonify
import socket
import qrcode
from PIL import Image
import random
import base64
import os
import argparse

app = Flask(__name__)

characters = []
output_folder = 'saved_data'
random_character = True

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get-character', methods=['GET'])
def get_character():
    global random_character, index_count
    if random_character:
        return jsonify({'character': random.choice(characters)})
    else:
        index_count = request.args.get('index_count', 0, type=int)
        char = characters[index_count % len(characters)]
        return jsonify({'character': char})

@app.route('/save-image', methods=['POST'])
def save_image():
    base64_data = request.form['image']
    character = request.form['character']

    if not base64_data or not character:
        return jsonify({'status': 'error', 'message': 'No data provided'})

    os.makedirs(f'{output_folder}{character}', exist_ok=True)
    counts = len(os.listdir(f'{output_folder}/{character}/'))

    with open(f'{output_folder}/{character}/{counts + 1}.png', "wb") as fh:
        fh.write(base64.b64decode(base64_data))

    return jsonify({'status': 'ok'})


def load_all_characters(input_folder):
    global characters
    
    if not os.path.exists(input_folder):
        print('Input folder does not exist')
        exit(1)
    if input_folder.endswith('/'):
        input_folder = input_folder[:-1]
    
    data_text = os.listdir(input_folder)
    for file in data_text:
        # read only text files
        if not file.endswith('.txt'):
            continue

        with open(f'{input_folder}/{file}', 'r', encoding="utf-8") as f:
            characters.extend(list(f.read()))
    

def display_qr():
    qr = qrcode.QRCode(
        version=1,
        box_size=10,
        border=5
    )
    data = 'http://' + socket.gethostbyname(socket.gethostname()) + ':5000'
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill='black', back_color='white')
    img.save('./qr.png')
    Image.open('./qr.png').show()
    os.remove('./qr.png')


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--hide-qr', action='store_true', help='Hide QR code')
    parser.add_argument('--input', help='Input folder where text files are stored (default: static/data)', default='static/data')
    parser.add_argument('--output', help='Output folder (default: saved_data)', default='saved_data')
    parser.add_argument('--port',  help='Port (default: 5000)', default=5000)
    parser.add_argument('--seq', '--sequential', action='store_true', help='Select characters in sequential order')
    # q: how can i say the data will be shown in not random order
    # a: 
    args = parser.parse_args()
    if not args.hide_qr:
        display_qr()

    output_folder = args.output
    if output_folder.endswith('/'):
        output_folder = output_folder[:-1]
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)
    
    load_all_characters(args.input)
    port = args.port

    random_character = not args.seq

    app.run(host="0.0.0.0", port=5000, debug=False)