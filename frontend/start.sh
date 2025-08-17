#!/bin/bash

echo "Starting StrideVocal Application..."
echo

echo "Installing frontend dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "Error installing frontend dependencies"
    exit 1
fi

echo
echo "Installing backend dependencies..."
cd server
npm install
if [ $? -ne 0 ]; then
    echo "Error installing backend dependencies"
    exit 1
fi

echo
echo "Starting backend server..."
gnome-terminal --title="StrideVocal Backend" -- bash -c "npm start; exec bash" &
# Alternative for different terminals:
# xterm -title "StrideVocal Backend" -e "npm start; bash" &
# konsole --title "StrideVocal Backend" -e bash -c "npm start; exec bash" &

echo
echo "Waiting for backend to start..."
sleep 3

echo
echo "Starting frontend application..."
cd ..
gnome-terminal --title="StrideVocal Frontend" -- bash -c "npm start; exec bash" &
# Alternative for different terminals:
# xterm -title "StrideVocal Frontend" -e "npm start; bash" &
# konsole --title "StrideVocal Frontend" -e bash -c "npm start; exec bash" &

echo
echo "StrideVocal is starting up!"
echo "Frontend will be available at: http://localhost:3000"
echo "Backend will be available at: http://localhost:3001"
echo
echo "Press Ctrl+C to stop all servers"
echo

# Wait for user to stop
trap 'echo "Stopping servers..."; pkill -f "npm start"; exit' INT
wait 