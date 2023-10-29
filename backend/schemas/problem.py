from pydantic import BaseModel
from typing import List

class CreateProblem(BaseModel):
    code: str
    tests: List[List[str]]
    number: int