from kombu import Exchange, Queue

CELERY_BROKER_URL = "amqp://test:test@localhost:5672/"
CELERY_RESULT_BACKEND = "redis://localhost:6379/0"
CELERY_TASK_SERIALIZER = "json"
CELERY_RESULT_SERIALIZER = "json"
CELERY_ACCEPT_CONTENT = ["json"]
CELERY_DISABLE_RATE_LIMITS = True

CELERY_DEFAULT_QUEUE = "default"
CELERY_QUEUES = (
    Queue("default", Exchange("default"), routing_key="default"),
)

CELERY_IMPORTS = ("tasks",)

CELERY_ROUTES = (
    {
        "tasks.process_uploaded_file": {
            "queue": "default",
            "routing_key": "default",
        }
    },
)