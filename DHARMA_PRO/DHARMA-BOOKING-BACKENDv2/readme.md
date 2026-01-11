## Setup Instructions

```bash
# 1. Create Virtual Environment
python -m venv .venv
.venv/Scripts/activate

# 2. Install Requirements
pip install -r requirements.txt

# 3. Create .env File
touch .env

# 4. Add the following variables to .env (refer example.env)

# Twilio Credentials
ACCOUNT_SID=        # Get from Twilio Console
AUTH_TOKEN=         # Get from Twilio Console
TWILIO_NUMBER=      # Buy a number from Twilio

# Optional (only for WhatsApp usage)
CUSTOMER_NUMBER=
WHATSAPP_FROM=
WHATSAPP_TO=


# 6. Start Ngrok Tunnel
ngrok http 8000

# Ngrok public URL
URL=    # Run: ngrok http {port_number} and paste the URL here


#connect ngrok-
ngrok config add-authtoken <YOUR_AUTH_TOKEN>

# 5. Run the FastAPI Server
uvicorn main:app --reload



#after this paste the url it gives in your .env file and you are ready to go

# NOTE:
# If your system is already running another FastAPI backend on default port 8000,
# change the port for this project (example: uvicorn main:app --reload --port 8001)
# and expose that new port with ngrok.
