from sqlalchemy import Column, String, Float, JSON, Enum
from sqlalchemy.orm import relationship
from benchmark import Benchmark
from database import Base
import enum

class RequestState(enum.Enum):
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
    
    crawler_state = Column(Enum(RequestState), default=RequestState.NOT_STARTED)
    email_state = Column(Enum(RequestState), default=RequestState.NOT_STARTED)
    analyze_state = Column(Enum(RequestState), default=RequestState.NOT_STARTED)
    benchmarks = relationship("Benchmark", back_populates="company", cascade="all, delete-orphan")
