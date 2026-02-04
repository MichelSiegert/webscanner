from sqlalchemy import Column, String, Float, ForeignKey, Boolean, Integer
from sqlalchemy.orm import relationship
from database import Base
import time

class Benchmark(Base):
    __tablename__ = "benchmarks"
    
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(String, ForeignKey("companies.id"), nullable=False)
    name = Column(String, nullable=False)
    timestamp = Column(Float, default=time.time)
    succeed = Column(Boolean, default=True)

    company = relationship("Company", back_populates="benchmarks")
