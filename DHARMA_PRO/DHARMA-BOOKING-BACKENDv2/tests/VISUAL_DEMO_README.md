# Visual API Testing Demo

## Overview

This directory contains a **visual automation script** that demonstrates API testing through Swagger UI in a **visible browser window**. Instead of just running tests in the terminal, you can **watch the automation happen** in real-time!

## Quick Start

### 1. Install Dependencies

```bash
pip install -r tests/requirements-test.txt
playwright install chromium
```

### 2. Start Your API Server

Make sure your API server is running:

```bash
uvicorn main:app --reload
```

### 3. Run Visual Demo

```bash
python tests/visual_api_demo.py
```

This will:
- ✅ Open a Chrome browser window (visible)
- ✅ Navigate to your Swagger UI
- ✅ Automatically test multiple APIs
- ✅ Show you the requests and responses in real-time
- ✅ Demonstrate user registration, temple retrieval, and slots

## What Gets Tested

The visual demo tests these APIs:

1. **🧑 User Registration** - POST /users/register
2. **🏛️ Get All Temples** - GET /temples/
3. **🎫 Get All Booking Slots** - GET /slots/

## Features

- **Slow Motion**: The automation runs with a 1-second delay between actions so you can see what's happening
- **Visible Browser**: Watch the automation happen in a real Chrome window
- **Real-time Console Output**: See progress messages in the terminal as the demo runs
- **Random Test Data**: Uses random numbers to avoid duplicate user conflicts

## Custom API Testing

You can modify `visual_api_demo.py` to add more API tests. The script uses Playwright, which makes it easy to:

- Click buttons
- Fill in forms
- Execute API requests
- Check responses
- Take screenshots

## Troubleshooting

### Browser doesn't open
```bash
# Install playwright browsers
playwright install
```

### API server not running
```bash
# Start your server first
uvicorn main:app --reload
```

### Import errors
```bash
# Install dependencies
pip install -r tests/requirements-test.txt
```

## Example Output

```
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║        Visual API Testing Through Swagger UI                ║
║                                                              ║
║  This script will open a browser window and demonstrate     ║
║  testing your APIs through Swagger UI in real-time!         ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝

🚀 Launching browser...
📖 Opening Swagger UI...

============================================================
🎯 Starting Visual API Testing Demo
============================================================

📝 Test 1: User Registration API
----------------------------------------
   ✅ Registering user: visualtest3456
   ✅ User registration successful!

🏛️  Test 2: Get All Temples API
----------------------------------------
   ✅ Fetching all temples...
   ✅ Temples retrieved successfully!

🎫 Test 3: Get All Booking Slots API
----------------------------------------
   ✅ Fetching all booking slots...
   ✅ Booking slots retrieved successfully!

============================================================
✅ Visual API Testing Demo Complete!
============================================================

Browser will close in 5 seconds...
🎬 Demo finished!
```

## Comparison: Visual vs Terminal Testing

### Terminal Testing (pytest)
```bash
pytest -v
# Fast, automated, runs in background
# Great for CI/CD and regression testing
```

### Visual Testing (this script)
```bash
python tests/visual_api_demo.py
# Slow, visible, educational
# Great for demonstrations and debugging
```

Both approaches are valuable for different purposes!
