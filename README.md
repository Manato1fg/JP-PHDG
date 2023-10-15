# JP-PHDG
JP-PHDG: (ja-JP) Playground for Handwriting Data Generation
## Overview

This Flask-based web application aims to facilitate the generation of handwriting data by providing a frontend that allows users to draw characters. The application serves different characters that the user needs to draw, and the drawn images are then saved as PNG files in a designated folder. The characters can be served randomly or in a sequential manner, depending on the settings.

## Prerequisites

- Python 3.x

## Installation

First, clone the repository to your local machine:

```bash
git clone git@github.com:Manato1fg/JP-PHDG.git
```

Navigate to the project directory:
```bash
cd JP-PHDG
```

Install the required packages:
```bash
pip install -r requirements.txt
```

## Running the Application
```bash
python app.py [options]
```
### Command Line Options

- `--hide-qr`: Hide the QR code generated to access the application.
- `--input`: Specifies the input folder where the text files for characters are stored (default is `static/data`).
- `--output`: Specifies the output folder where the handwritten data will be saved (default is `saved_data`).
- `--port`: Specifies the port where the application will run (default is 5000).
- `--seq`: Characters will be served in sequential order instead of random.

For example, if you want to run the application on port 8080 and use sequential character serving, use the following command:

```bash
python app.py --port 8080 --seq
```

## Usage

1. Run the application as instructed above.
2. A QR code will appear. Scan it to open the web application in a mobile browser or enter the URL manually.
3. Draw the character shown on the screen.
4. Submit your drawing. The image will be saved in the output folder specified.

## Data
Default data supports latin characters, Kana(仮名) characters, and Kanji(漢字) taught in elementary schools.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

Code for manipulating HTML Canvas is based on [shuding/apple-pencil-safari-api-test](https://github.com/shuding/apple-pencil-safari-api-test).
