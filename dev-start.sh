#!/usr/bin/env bash
# WizCuts Development Startup Script
# Starts backend and frontend services in development mode

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration (defaults; may be overridden by detected values)
BACKEND_PORT=3005
FRONTEND_PORT=3000
BACKEND_DIR="backend"
FRONTEND_DIR="frontend"

# Attempt to auto-detect ports from project configuration
load_ports() {
    # Backend: read PORT from project root .env if present
    if [ -f ".env" ]; then
        local env_port
        env_port=$(grep -E "^PORT=" .env | tail -n 1 | cut -d'=' -f2 | tr -d '"' | tr -d "'" )
        if [[ "$env_port" =~ ^[0-9]+$ ]]; then
            BACKEND_PORT=$env_port
            print_info "Detected backend port from .env: $BACKEND_PORT"
        fi
    fi

    # Frontend: parse -p <port> from frontend/package.json dev script
    if [ -f "$FRONTEND_DIR/package.json" ]; then
        local fe_port
        fe_port=$(grep -E '"dev"\s*:\s*"[^"]* -p [0-9]+' "$FRONTEND_DIR/package.json" | sed -E 's/.* -p ([0-9]+).*/\1/' | tr -d '[:space:]')
        if [[ "$fe_port" =~ ^[0-9]+$ ]]; then
            FRONTEND_PORT=$fe_port
            print_info "Detected frontend port from package.json: $FRONTEND_PORT"
        fi
    fi
}

# Function to print colored output
print_status() {
    echo -e "${CYAN}[$(date +'%H:%M:%S')] $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Function to check if port is available
check_port() {
    local port=$1
    local service=$2
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        print_warning "Port $port is already in use (required for $service)"
        print_info "To free the port, run: kill \$(lsof -t -i:$port)"
        return 1
    fi
    return 0
}

# Function to check dependencies
check_dependencies() {
    print_status "Checking dependencies..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    print_success "Dependencies check passed"
}

# Function to check environment files
check_environment() {
    print_status "Checking environment configuration..."
    
    # Check frontend .env.local
    if [ ! -f "$FRONTEND_DIR/.env.local" ]; then
        print_warning "Frontend .env.local not found"
        if [ -f "$FRONTEND_DIR/.env.example" ]; then
            print_info "Copy $FRONTEND_DIR/.env.example to $FRONTEND_DIR/.env.local and add your Clerk keys"
        fi
        exit 1
    fi
    
    # Check project root .env (backend reads from project root)
    if [ ! -f ".env" ]; then
        print_warning "Project root .env not found"
        if [ -f "$BACKEND_DIR/.env.example" ]; then
            print_info "Copy $BACKEND_DIR/.env.example to ./.env and configure your database"
        fi
    else
        # Validate required keys exist
        local required_keys=(DATABASE_URL SUPABASE_URL SUPABASE_ANON_KEY CLERK_SECRET_KEY PORT)
        local missing=()
        for key in "${required_keys[@]}"; do
            if ! grep -E "^${key}=" .env >/dev/null; then
                missing+=("$key")
            fi
        done
        if [ ${#missing[@]} -gt 0 ]; then
            print_error "Missing required keys in .env: ${missing[*]}"
            exit 1
        fi
    fi
    
    print_success "Environment configuration check passed"
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Install backend dependencies
    print_info "Installing backend dependencies..."
    cd "$BACKEND_DIR"
    if npm install; then
        print_success "Backend dependencies installed"
    else
        print_error "Failed to install backend dependencies"
        exit 1
    fi
    cd ..
    
    # Install frontend dependencies
    print_info "Installing frontend dependencies..."
    cd "$FRONTEND_DIR"
    if npm install; then
        print_success "Frontend dependencies installed"
    else
        print_error "Failed to install frontend dependencies"
        exit 1
    fi
    cd ..
}

# Function to run type checking
run_type_check() {
    print_status "Running type checks..."
    
    # Backend type check
    print_info "Checking backend types..."
    cd "$BACKEND_DIR"
    if npm run build > /dev/null 2>&1; then
        print_success "Backend type check passed"
    else
        print_warning "Backend type check failed - proceeding anyway"
    fi
    cd ..
    
    # Frontend type check
    print_info "Checking frontend types..."
    cd "$FRONTEND_DIR"
    if npm run typecheck > /dev/null 2>&1; then
        print_success "Frontend type check passed"
    else
        print_warning "Frontend type check failed - proceeding anyway"
    fi
    cd ..
}

# Function to start backend
start_backend() {
    print_status "Starting backend server..."
    
    cd "$BACKEND_DIR"
    
    # Start backend in background
    npm run start:dev > ../backend.log 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > ../backend.pid
    
    cd ..
    
    # Wait for backend to be ready
    print_info "Waiting for backend to start..."
    for i in {1..30}; do
        # Health endpoint uses global prefix 'api' and version 'v1'
        if curl -s http://localhost:$BACKEND_PORT/api/v1/health > /dev/null 2>&1; then
            print_success "Backend is running on http://localhost:$BACKEND_PORT"
            return 0
        fi
        sleep 1
        echo -n "."
    done
    
    # If health check fails, try simple port check
    if lsof -Pi :$BACKEND_PORT -sTCP:LISTEN -t >/dev/null ; then
        print_success "Backend is running on http://localhost:$BACKEND_PORT"
        return 0
    fi
    
    print_error "Backend failed to start properly"
    print_info "Last 50 lines of backend.log:"
    tail -n 50 backend.log 2>/dev/null || true
    return 1
}

# Function to start frontend
start_frontend() {
    print_status "Starting frontend server..."
    
    cd "$FRONTEND_DIR"
    
    # Start frontend in background
    npm run dev > ../frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > ../frontend.pid
    
    cd ..
    
    # Wait for frontend to be ready
    print_info "Waiting for frontend to start..."
    for i in {1..30}; do
        if curl -s http://localhost:$FRONTEND_PORT > /dev/null 2>&1; then
            print_success "Frontend is running on http://localhost:$FRONTEND_PORT"
            return 0
        fi
        sleep 1
        echo -n "."
    done
    
    print_error "Frontend failed to start properly"
    return 1
}

# Function to cleanup on exit
cleanup() {
    print_status "Shutting down services..."
    
    if [ -f backend.pid ]; then
        BACKEND_PID=$(cat backend.pid)
        kill $BACKEND_PID 2>/dev/null || true
        rm backend.pid
        print_info "Backend stopped"
    fi
    
    if [ -f frontend.pid ]; then
        FRONTEND_PID=$(cat frontend.pid)
        kill $FRONTEND_PID 2>/dev/null || true
        rm frontend.pid
        print_info "Frontend stopped"
    fi
    
    # Kill any remaining processes on our ports
    lsof -ti:$BACKEND_PORT | xargs kill -9 2>/dev/null || true
    lsof -ti:$FRONTEND_PORT | xargs kill -9 2>/dev/null || true
    
    print_success "Cleanup completed"
}

# Function to show logs
show_logs() {
    print_status "Service logs:"
    echo ""
    echo -e "${PURPLE}=== Backend Logs ===${NC}"
    tail -n 10 backend.log 2>/dev/null || echo "No backend logs available"
    echo ""
    echo -e "${PURPLE}=== Frontend Logs ===${NC}"
    tail -n 10 frontend.log 2>/dev/null || echo "No frontend logs available"
}

# Function to show status
show_status() {
    print_status "Service Status:"
    
    # Backend status
    if lsof -Pi :$BACKEND_PORT -sTCP:LISTEN -t >/dev/null ; then
        print_success "Backend: Running on http://localhost:$BACKEND_PORT"
    else
        print_error "Backend: Not running"
    fi
    
    # Frontend status
    if lsof -Pi :$FRONTEND_PORT -sTCP:LISTEN -t >/dev/null ; then
        print_success "Frontend: Running on http://localhost:$FRONTEND_PORT"
    else
        print_error "Frontend: Not running"
    fi
}

# Main execution
main() {
    clear
    echo -e "${CYAN}"
    echo "🔮 WizCuts Development Server"
    echo "=============================="
    echo -e "${NC}"
    
    # Parse command line arguments
    SKIP_DEPS=false
    SKIP_TYPECHECK=false
    SKIP_BACKEND=false
    SKIP_FRONTEND=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --skip-deps)
                SKIP_DEPS=true
                shift
                ;;
            --skip-typecheck)
                SKIP_TYPECHECK=true
                shift
                ;;
            --logs)
                show_logs
                exit 0
                ;;
            --status)
                show_status
                exit 0
                ;;
            --stop)
                cleanup
                exit 0
                ;;
            --skip-backend)
                SKIP_BACKEND=true
                shift
                ;;
            --skip-frontend)
                SKIP_FRONTEND=true
                shift
                ;;
            -h|--help)
                echo "Usage: $0 [OPTIONS]"
                echo ""
                echo "Options:"
                echo "  --skip-deps        Skip dependency installation"
                echo "  --skip-typecheck   Skip TypeScript type checking"
                echo "  --skip-backend     Do not start backend"
                echo "  --skip-frontend    Do not start frontend"
                echo "  --logs             Show recent logs and exit"
                echo "  --status           Show service status and exit"
                echo "  --stop             Stop all services and exit"
                echo "  -h, --help         Show this help message"
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done
    
    # Set up cleanup trap
    trap cleanup EXIT INT TERM
    
    # Pre-flight checks
    check_dependencies
    check_environment
    load_ports
    
    # Check ports
    if [ "$SKIP_BACKEND" = false ]; then
        check_port $BACKEND_PORT "backend" || exit 1
    fi
    if [ "$SKIP_FRONTEND" = false ]; then
        check_port $FRONTEND_PORT "frontend" || exit 1
    fi
    
    # Install dependencies if not skipped
    if [ "$SKIP_DEPS" = false ]; then
        install_dependencies
    else
        print_info "Skipping dependency installation"
    fi
    
    # Run type checking if not skipped
    if [ "$SKIP_TYPECHECK" = false ]; then
        run_type_check
    else
        print_info "Skipping type checking"
    fi
    
    # Start services
    local ok=true
    if [ "$SKIP_BACKEND" = false ]; then
        start_backend || ok=false
    else
        print_info "Skipping backend start (--skip-backend)"
    fi

    if [ "$SKIP_FRONTEND" = false ]; then
        if [ "$ok" = true ]; then
            start_frontend || ok=false
        fi
    else
        print_info "Skipping frontend start (--skip-frontend)"
    fi

    if [ "$ok" = true ]; then
            echo ""
            print_success "🎉 WizCuts development environment is ready!"
            echo ""
            print_info "Frontend: http://localhost:$FRONTEND_PORT"
            print_info "Backend:  http://localhost:$BACKEND_PORT"
            echo ""
            print_info "Press Ctrl+C to stop all services"
            print_info "Or run: $0 --logs    (to view logs)"
            print_info "Or run: $0 --status  (to check status)"
            print_info "Or run: $0 --stop    (to stop services)"
            echo ""
            
            # Keep script running
            while true; do
                sleep 1
            done
    else
        print_error "Failed to start one or more services"
        exit 1
    fi
}

# Run main function
main "$@"
