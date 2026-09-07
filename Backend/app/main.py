from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from app.exceptions.app_exceptions import AppException
from app.controller.download_controller import download_sheet
from app.model.form_model import FormInput
from app.services.form_service import get_form_via_link, submit_form_service
app = FastAPI()


@app.get("/")
def root():
    return {"message": "API is working"}


@app.get("/download-speaking-sheet")
def download_sheet_endpoint(course_teacher_name: str = None):
    return download_sheet(course_teacher_name)

@app.get("/retrieve-form-schema")
def retrieve_form_schema(form_url: str):
    try:
        return get_form_via_link(form_url)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to process form")
    

@app.post("/form/submit")
def submit_form(data: FormInput, form_url: str):
    try:
        submit_form_service(form_url, data)
        return {"status": "ok"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))



@app.exception_handler(AppException)
async def app_exception_handler(
    request: Request,
    exc: AppException
):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": exc.message
        }
    )