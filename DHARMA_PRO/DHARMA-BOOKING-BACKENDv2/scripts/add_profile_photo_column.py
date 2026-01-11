import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from sqlalchemy import text
from database.database import engine

def add_column():
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE users ADD COLUMN \"profilePhoto\" TEXT"))
        conn.commit()
        print("Column profilePhoto added successfully.")

if __name__ == "__main__":
    add_column()
