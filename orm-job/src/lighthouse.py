from sqlalchemy import Column, String, Float, ForeignKey, Integer
from sqlalchemy.orm import relationship
from database import Base
import time

class Lighthouse(Base):
    __tablename__ = "lighthouse"
    
    id = Column(String, primary_key=True)
    company_id = Column(String, ForeignKey("companies.id"), nullable=False)
    timestamp = Column(Float, default=time.time)
    performance=  Column(Integer, default=0)
    accessibility=  Column(Integer, default=0)
    best_practices=  Column(Integer, default=0)
    seo=  Column(Integer, default=0)
