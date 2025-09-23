@echo off
REM AI-Powered Todo App - Backend Setup Script for Windows

echo 🚀 Setting up AI-Powered Todo App Backend...

REM Check if pnpm is installed
where pnpm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ pnpm is not installed. Please install pnpm first:
    echo npm install -g pnpm
    pause
    exit /b 1
)

REM Install dependencies
echo 📦 Installing dependencies...
pnpm install

REM Create .env file if it doesn't exist
if not exist .env (
    echo 📝 Creating .env file...
    copy env.example .env
    echo ✅ .env file created. Please update it with your API keys.
) else (
    echo ✅ .env file already exists.
)

REM Create database directory
if not exist data mkdir data

echo ✅ Backend setup complete!
echo.
echo 🔧 Next steps:
echo 1. Update .env file with your API keys
echo 2. Run 'pnpm dev' to start the development server
echo 3. The API will be available at http://localhost:3001
echo.
echo 📚 Documentation:
echo - API docs: API.md
echo - README: README.md
echo - Health check: http://localhost:3001/health
pause
