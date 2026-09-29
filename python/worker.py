"""
Background Async Task Worker
File: python/worker.py

Description:
Celery background worker process listening to Redis queues for 
async financial audit and dispatch sync processing.
"""

import os
import time
from celery import Celery

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

# Initialize Celery app with Redis broker
celery_app = Celery(
    "erp_worker",
    broker=REDIS_URL,
    backend=REDIS_URL
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Dhaka",
    enable_utc=True,
)

@celery_app.task(name="tasks.process_heavy_reconciliation")
def process_heavy_reconciliation(dealer_id: str, batch_records: list):
    """
    Asynchronously processes large financial ledger reconciliations.
    """
    print(f"[Worker] Starting background reconciliation for Dealer: {dealer_id}")
    
    # Simulate batch processing
    time.sleep(2) 
    processed_count = len(batch_records)
    
    print(f"[Worker] Completed reconciliation for {processed_count} records.")
    return {
        "status": "COMPLETED",
        "dealer_id": dealer_id,
        "processed_count": processed_count
    }
