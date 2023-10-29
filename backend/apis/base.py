from fastapi import APIRouter
from backend.apis.v1 import router_problem, route_user, route_login


api_router = APIRouter()

api_router.include_router(router_problem.router, prefix='/problems', tags=['problems'])
api_router.include_router(route_user.router, prefix='/users', tags=['users'])
api_router.include_router(route_login.router, prefix='/login', tags=['login'])
