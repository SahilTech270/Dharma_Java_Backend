from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv
import os

print("Loading dotenv file")
load_dotenv()

url = os.getenv("DATABASE_URL")
print(url)

engine = create_engine(url, echo=False)
print("engine made")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
print("Session made")

Base = declarative_base()
print("Base made")
