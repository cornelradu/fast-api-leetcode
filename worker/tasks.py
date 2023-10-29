from celery import Celery
from typing import List
from contextlib import redirect_stdout
from io import StringIO

app = Celery('tasks', broker='pyamqp://guest@localhost//', backend='redis://localhost:6379/0')  # broker URL, usually RabbitMQ or Redis

def on_task_failure(exc, task_id, args, kwargs, einfo):
    print(f"Task {task_id} has failed: {exc}")

app.conf.task_on_failure = on_task_failure

@app.task(soft_time_limit=120, time_limit=240)
def compute(text, tests, correct_problem, entry):
     outputs = {}
     for i in range(len(tests)):
          code_to_run = f"""
from typing import List

{text}
\n
solution = Solution()

res = solution.{entry}(
"""

          for j in range(len(tests[i])):
               code_to_run += tests[i][j]

               if j != len(tests[i]) - 1:
                    code_to_run += ", "
          code_to_run += ")"

          code_to_run += """
print("leetcode_result=" + str(res))         
          """

          stdout_buffer = StringIO()
          with redirect_stdout(stdout_buffer):
               exec(code_to_run)
               try:
                    output = stdout_buffer.getvalue()
               except Exception as e:
                    output = str(e)
               except IndentationError as e:
                    print(f"Caught IndentationError: {e}")
               outputs[i] = output
     
     expected_outputs = {}
     for i in range(len(tests)):
          code_to_run = f"""
from typing import List

{correct_problem}
\n
solution = Solution()
print(solution.{entry}(
"""  

          for j in range(len(tests[i])):
               code_to_run += tests[i][j]

               if j != len(tests[i]) - 1:
                    code_to_run += ", "
          code_to_run += "))"

          stdout_buffer = StringIO()
          with redirect_stdout(stdout_buffer):
               exec(code_to_run)
               try:
                    output = stdout_buffer.getvalue()
               except Exception as e:
                    output = str(e)
               except IndentationError as e:
                    print(f"Caught IndentationError: {e}")
               expected_outputs[i] = output
     
     return {"outputs": outputs, "expected_outputs": expected_outputs}


