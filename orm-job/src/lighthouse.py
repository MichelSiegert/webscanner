from sqlalchemy import Column, String, Float, ForeignKey, Integer
from sqlalchemy.orm import relationship
from database import Base
import time

class Requirements(Base):
    __tablename__ = "lighthouse"
    
    company_id = Column(String, ForeignKey("companies.id"), nullable=False)
    timestamp = Column(Float, default=time.time)
    performance=  Column(Integer, default=0)
    accessibility=  Column(Integer, default=0)
    bestPractices=  Column(Integer, default=0)
    seo=  Column(Integer, default=0)

    company = relationship("Company", back_populates="requirements")
