from fastapi import FastAPI
import configparser

# Load configuration from properties file
config = configparser.ConfigParser()
config.read('config.ini')

# Get configuration settings
database_url = config['database']['url']
problems_path = config['problems']['path']