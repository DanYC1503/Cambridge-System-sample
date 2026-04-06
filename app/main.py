from fastapi import FastAPI
from app.controller.download_controller import download_sheet
app = FastAPI()


@app.get("/")
def root():
    return {"message": "API is working"}


@app.get("/download-speaking-sheet")
def download_sheet_endpoint(course_teacher_name: str = None):
    return download_sheet(course_teacher_name)

