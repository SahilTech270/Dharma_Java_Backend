import os
import time

# Get the directory where this script is located
script_dir = os.path.dirname(os.path.abspath(__file__))
# Parent directory (DHARMA-BOOKING-BACKENDv2)
backend_dir = os.path.dirname(script_dir)

print(f"Switching to backend directory: {backend_dir}")
os.chdir(backend_dir)

print("Starting Docker containers...")
os.system("docker compose down")
time.sleep(2)
os.system("docker compose up -d")
time.sleep(2)

conda_env = "Dharma-booking"
print("\n\nRun fastapi server using:")
print(f"cd {backend_dir}")
print(f"conda activate {conda_env}")
print("uvicorn main:app --reload")
