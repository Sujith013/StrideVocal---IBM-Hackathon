@echo off
echo Starting StrideVocal Application...
echo.

echo Installing frontend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Error installing frontend dependencies
    pause
    exit /b 1
)

echo.
echo Installing backend dependencies...
cd server
call npm install
if %errorlevel% neq 0 (
    echo Error installing backend dependencies
    pause
    exit /b 1
)

echo.
echo Starting backend server...
start "StrideVocal Backend" cmd /k "npm start"

echo.
echo Waiting for backend to start...
timeout /t 3 /nobreak > nul

echo.
echo Starting frontend application...
cd ..
start "StrideVocal Frontend" cmd /k "npm start"

echo.
echo StrideVocal is starting up!
echo Frontend will be available at: http://localhost:3000
echo Backend will be available at: http://localhost:3001
echo.
echo Press any key to close this window...
pause > nul 