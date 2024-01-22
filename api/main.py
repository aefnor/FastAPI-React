from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from tasks import process_uploaded_file

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/items/{item_id}")
def read_item(item_id: int, query_param: str = None):
    return {"item_id": item_id, "query_param": query_param}

@app.post("/upload")
async def create_upload_file(file: UploadFile = File(...)):
    file_path = f"uploads/{file.filename}"
    # Take the file and write it locally.
    with open(file.filename, 'wb') as f:
        f.write(file.file.read())

    # Enqueue the Celery task
    process_uploaded_file.delay(file_path)
    # Return a JSON with the file information.
    return {
        'filename': file.filename,
        'content_type': file.content_type
    }