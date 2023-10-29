from fastapi import FastAPI
from backend.apis.base import api_router
from fastapi.middleware.cors import CORSMiddleware
import os
from typing import List
from backend.db.base import Base
from backend.db.session import engine

def include_router(app):
    app.include_router(api_router)

def start_application():
    app = FastAPI()
    include_router(app)
    return app


Base.metadata.create_all(engine)


app = start_application()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, PUT, etc.)
    allow_headers=["*"],  # Allows all headers
)

