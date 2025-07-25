@echo off
echo 🔧 Setting up environment...

:: Create virtual environment if not exists
if not exist ".venv" (
    python -m venv .venv
)

:: Activate virtual environment
call .venv\Scripts\activate

:: Upgrade pip
python -m pip install --upgrade pip

:: Install requirements
pip install torch==2.7.1 transformers easyocr flask flask-cors

:: Download model automatically
python download_llm.py

echo ✅ Installation complete!
pause