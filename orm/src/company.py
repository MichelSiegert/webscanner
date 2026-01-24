from sqlalchemy import Column, String, Float, JSON, Enum
from database import Base
import enum

class CrawlerState(enum.Enum):
    NOT_STARTED = "NOT_STARTED"
    PENDING = "PENDING"
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"

class EmailState(enum.Enum):
    NOT_STARTED = "NOT_STARTED"
    PENDING = "PENDING"
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"

class Company(Base):
    __tablename__ = "companies"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    craft = Column(String)
    city = Column(String)
    emails = Column(JSON)      
    websites = Column(JSON)    
    
    latitude = Column(Float)
    longitude = Column(Float)

    selected_email = Column(String)
    selected_website = Column(String)
    
    crawler_state = Column(Enum(CrawlerState), default=CrawlerState.NOT_STARTED)
    email_state = Column(Enum(EmailState), default=EmailState.NOT_STARTED)