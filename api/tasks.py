from celery import Celery

app = Celery("tasks")
app.config_from_object("celery_config")

@app.task(queue="default")
def process_uploaded_file(file_path):
    # Add your file processing logic here
    # For example, you can resize images, extract information, etc.
    print(f"Processing file: {file_path}")