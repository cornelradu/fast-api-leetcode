from fastapi import APIRouter, Depends, status, HTTPException, BackgroundTasks
from typing import List
import re 
import uuid
from celery.result import AsyncResult


from pydantic import BaseModel
from backend.schemas.problem import CreateProblem
from backend.core.problems import get_problems
from backend.db.models.user import User
from backend.apis.v1.route_login import get_current_user

router = APIRouter()

from tasks import compute, app

def run_celery_task(code, tests, correct, entry, task_id):
    # Trigger the Celery task asynchronously
    compute.apply_async(args=[code, tests, correct, entry], task_id=task_id)

@router.post("/problem")
async def create_problem(problem: CreateProblem, background_tasks: BackgroundTasks, problems = Depends(get_problems), current_user: User = Depends(get_current_user)):
    correct = problems[problem.number-1].correct
    entry = problems[problem.number-1].entry
    
    task_id = str(uuid.uuid4())
    background_tasks.add_task(run_celery_task, problem.code, problem.tests, correct, entry, task_id)

    return {"task_id": task_id}

class Task(BaseModel):
    task_id: str

@router.post("/get_result")
async def get_result(task: Task, current_user: User = Depends(get_current_user)):
    pattern = r"leetcode_result=(.*)"
    result = AsyncResult(task.task_id, app=app)
    status = result.status

    if status == 'FAILURE':
        return {"task_status": status, 'error': str(result.result)}

    if status == 'PENDING':
        return {"task_status": status}

    result = result.result
    result = {'outputs': result['outputs'], 'expected_outputs': result['expected_outputs'], 'real_outputs': {}, "task_status": status}
    for i in result['outputs']:
        print(result['outputs'][i])
        res = re.search(pattern, result['outputs'][i])
        extracted_content = res.group(1)
        result['real_outputs'][i] = extracted_content
        result['outputs'][i] = result['outputs'][i].replace("leetcode_result=", "")

    result['accepted'] = {}
    for i in result['real_outputs']:
        l1 = type(eval(result['real_outputs'][i]))
        l2 = type(eval(result['expected_outputs'][i]))

        if l1 != l2:
            result['error'] = "The return type is not valid."
            return result
        if l1 == type([1]):

            actual_list_1 = set(eval(result['real_outputs'][i]))
            actual_list_2 = set(eval(result['expected_outputs'][i]))

            if actual_list_1 == actual_list_2:
                result['accepted'][i] = True
            else:
                result['accepted'][i] = False
        else:
            result['accepted'][i] = eval(result['real_outputs'][i]) == eval(result['expected_outputs'][i])

    return result

@router.get('/problem')
def get_problems(problems = Depends(get_problems), current_user: User = Depends(get_current_user)):
    return problems
    