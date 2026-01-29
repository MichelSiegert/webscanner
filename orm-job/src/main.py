import os
from database import engine, Base
from company import Company 

def setup():
    print("Checking/Creating tables...")
    Base.metadata.create_all(bind=engine)
    print("Database is ready")


if __name__ == "__main__":
    setup()
