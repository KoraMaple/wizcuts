#!/usr/bin/env bash
# Quick WizCuts Development Startup Script
# Simple version for fast startup

echo "🚀 Starting WizCuts Development Environment..."

# Start backend
echo "📡 Starting backend..."
cd backend && npm run start:dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend  
echo "🎨 Starting frontend..."
cd ../frontend && npm run dev &
FRONTEND_PID=$!

cd ..

echo ""
echo "✅ Services starting up!"
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop both services"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    # Kill any remaining processes
    pkill -f "npm run start:dev" 2>/dev/null || true
    pkill -f "npm run dev" 2>/dev/null || true
    echo "✅ Cleanup completed"
}

trap cleanup EXIT INT TERM

# Keep script running
wait
