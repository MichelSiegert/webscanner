from pydantic import BaseModel, Field

class EmailRequest(BaseModel):
    companyEmail: str= Field(validation_alias="email")
    website: str
