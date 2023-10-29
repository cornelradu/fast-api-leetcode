import os
from typing import List
import configparser
from ..settings import problems_path

def list_directories(path):
    files_and_directories = os.listdir(path)
    
    directories = [d for d in files_and_directories if os.path.isdir(os.path.join(path, d))]
    return directories

class Problem:
    name: str = ""
    base_code: str = ""
    inputs: List[str] = []
    text: str = ""
    tests: List[List[str]]
    correct: str = ""
    number: int = 0
    inputs_names: List[str] = []
    entry: str = ""

def get_problems() -> List[Problem]:
    directory_path = problems_path

    directories_list = list_directories(directory_path)
    directories_list.sort()
    
    problems : List[Problem] = []
    for directory in directories_list:
        problem: Problem = Problem()
        try:
            with open(directory_path + "/" + directory + "/text.html", 'r') as file:
                # Read all content of the file
                file_content = file.read()
                problem.text_html = file_content
        except FileNotFoundError:
            pass
        except Exception as e:
            print(f"An error occurred: {e}")

        try:
            with open(directory_path + "/" + directory + "/base_code", 'r') as file:
                # Read all content of the file
                file_content = file.read()
                problem.base_code = file_content
        except FileNotFoundError:
            pass
        except Exception as e:
            print(f"An error occurred: {e}")
        problems.append(problem)


        try:
            with open(directory_path + "/" + directory + "/correct", 'r') as file:
                # Read all content of the file
                file_content = file.read()
                problem.correct = file_content
        except FileNotFoundError:
            pass
        except Exception as e:
            print(f"An error occurred: {e}")

        # Create a ConfigParser object
        config = configparser.ConfigParser()
        config.read(directory_path + "/" + directory + "/properties.ini")

        problem.name = config.get("APP", "name")
        no_inputs = int(config.get("APP", "inputs"))
        inputs = []
        for i in range(no_inputs):
            inputs.append(config.get("INPUTS", "input" + str(i+1)))
        problem.inputs = inputs

        inputs = []
        for i in range(no_inputs):
            inputs.append(config.get("INPUTS_NAMES", "input" + str(i+1) + "_text"))
        problem.inputs_names = inputs

        problem.entry = config.get("ENTRY", "name")

        file_path = directory_path + "/" + directory + "/tests"  # Specify the path to your file
        n = 0
        c = no_inputs
        lst = []
        problem.tests = []
        try:
            with open(file_path, 'r') as file:
                # Read the file line by line using a for loop
                for line in file:
                    if n == 0:
                        n = int(line)
                    else:
                        c -= 1
                        lst.append(line)
                        if c == 0:
                            problem.tests.append(lst)
                            lst = []
                            c = no_inputs
                        
                    
        except FileNotFoundError:
            print(f"The file '{file_path}' was not found.")
        except Exception as e:
            print(f"An error occurred: {e}")
        
        problem.number = int(directory)

    return problems