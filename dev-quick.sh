#!/usr/bin/env bash
set -Eeuo pipefail
# Quick WizCuts Development Startup Script
# Simple version for fast startup

echo "🚀 Starting WizCuts Development Environment..."

# Always run from the repository root (directory of this script)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Start backend
echo "📡 Starting backend..."
( cd backend && npm run start:dev ) &
BACKEND_PID=$!

# Wait for backend to be ready on port 3005 before starting frontend
echo "⏳ Waiting for backend on http://localhost:3005 ..."
BACKEND_UP=0
for i in {1..60}; do
    if nc -z localhost 3005 2>/dev/null; then
        BACKEND_UP=1
        echo "✅ Backend is up."
        break
    fi
    sleep 1
done

if [[ "$BACKEND_UP" -ne 1 ]]; then
    echo "❌ Backend did not start within the expected time. Exiting..."
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi

# Start frontend  
echo "🎨 Starting frontend..."
( cd frontend && npm run dev ) &
FRONTEND_PID=$!

# Working directory remains the repo root

echo ""
echo "✅ Services starting up!"
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:3005"
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
