@echo off
REM Activate the virtual environment
call "D:\Ict Project\.venv\Scripts\activate.bat"

python gpu_test.py
REM Run the update.py script
python update.py

REM Pause to keep the window open (optional)
pause
