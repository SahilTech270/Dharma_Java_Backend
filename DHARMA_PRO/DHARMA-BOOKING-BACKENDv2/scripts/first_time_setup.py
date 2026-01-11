import os 
import time 

conda_env = r"Dharma-booking"
print("Making conda environment...")
os.system(f"conda create --name {conda_env} python=3.10 -y")
time.sleep(7)

print("\n\nInstalling requirements...")
os.system(f"conda run -n {conda_env} pip install -r requirements.txt")

print("\n\n Starting containers...")
os.system("docker compose up -d")
time.sleep(7)

print("\n\nMaking tables in db...")
import create_tablesdb
time.sleep(7)

print("\n\nRun fastapi server using:")
print(f"conda activate {conda_env}")
print("uvicorn main:app --reload")

