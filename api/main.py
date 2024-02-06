from asyncio import create_task
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

@app.post("/dag")
def dag():
    adjacency_list = {
    1: [2, 3],
    2: [4],
    3: [5],
    4: [6],
    5: [6],
    6: [7, 8, 9],
    7: [10],
    8: [11],
    9: [12],
    10: [13],
    11: [13],
    12: [14],
    13: [14],
    }

    # Example node types dictionary
    node_types = {
        1: 'type1',
        2: 'type2',
        # Add more entries as needed
    }

    create_task(adjacency_list, node_types)