from pydantic import BaseModel
from typing import Dict

class FormInput(BaseModel):
    fecha: str
    fields: Dict[str, str]
    students: Dict[str, str]