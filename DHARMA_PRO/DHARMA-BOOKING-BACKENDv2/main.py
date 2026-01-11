from fastapi import FastAPI 
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from fastapi import Request

import os

# Database imports
from database.database import Base, engine

# Routers
from api.user_authentication.user_registration import router as user_registration_router
from api.user_authentication.user_login import router as user_login_router
from api.user_authentication.user_profile import router as user_profile_router

from api.bookings.booking_router import router as booking_router
from api.bookings.participant_router import router as participant_router
from api.bookings.slot_router import router as slot_router
from api.bookings.kiosk_router import router as kiosk_router
from api.payments.payment_router import router as payment_router

from api.temples.temple_router import router as temple_router

from api.admin_authentication.admin_registration import router as admin_registration_router
from api.admin_authentication.admin_login import router as admin_login_router

from api.parking.parking_router import router as parking_router
from api.parking.parking_slot_router import router as parking_slot_router

# ⬇️ NEW — Ticket router
from api.bookings.tickets import router as ticket_router
from api.sarima.sarima_router import router as sarima_router



# ============================================================
#                 FOLDER CREATION (IMPORTANT)
# ============================================================

# Ensure static folder exists
if not os.path.exists("static"):
    os.makedirs("static")

# Ensure static/tickets folder exists (QR ticket images)
if not os.path.exists("static/tickets"):
    os.makedirs("static/tickets")

# Ensure template exists warning
if not os.path.exists("static/template_ticket.jpg"):
    print("⚠️ WARNING: template_ticket.jpg not found in /static folder.")



# ============================================================
#                   FASTAPI APP INIT
# ============================================================

app = FastAPI(
    title="DHARMA Booking Backend",
    version="2.0.0",
    description="Temple Booking and Darshan Slot Management System"
)



# ============================================================
#                STATIC FILES MOUNTING
# ============================================================

# Mount static after app initialization
app.mount("/static", StaticFiles(directory="static"), name="static")



# ============================================================
#                        CORS SETUP
# ============================================================

# Default local development origins
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "*"
]

# Add dynamic origins from environment variable
# Example: ALLOWED_ORIGINS="https://myapp.vercel.app,https://another-frontend.com"
env_origins = os.getenv("ALLOWED_ORIGINS", "")
if env_origins:
    if env_origins.strip() == "*":
         origins.append("*")
    else:
        for origin in env_origins.split(","):
            if origin.strip():
                origins.append(origin.strip())


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# ============================================================
#                CREATE ALL DATABASE TABLES
# ============================================================

# This loads all SQLAlchemy models—including the Ticket model
Base.metadata.create_all(bind=engine)



# ============================================================
#                     GLOBAL ERROR HANDLER
# ============================================================

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"message": f"Internal Server Error: {str(exc)}"},
    )



# ============================================================
#                      HEALTH CHECK
# ============================================================

@app.get("/")
def health():
    return {"status": "running", "message": "DHARMA Booking Backend API is live!"}



# ============================================================
#                    REGISTER ROUTERS
# ============================================================

app.include_router(user_registration_router)
app.include_router(user_login_router)
app.include_router(user_profile_router)

app.include_router(booking_router)
app.include_router(participant_router)
app.include_router(slot_router)
app.include_router(kiosk_router)
app.include_router(payment_router)

app.include_router(temple_router)
app.include_router(admin_registration_router)
app.include_router(admin_login_router)
app.include_router(parking_router)
app.include_router(parking_slot_router)

# ⬇️ NEW — TICKET ROUTER
app.include_router(ticket_router)
app.include_router(sarima_router)