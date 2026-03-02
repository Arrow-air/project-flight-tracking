#!/usr/bin/env python3
"""
api.py — Local flight analysis API server.
Wraps flight_summary.py as an HTTP endpoint the frontend can call.

Usage:
    pip install fastapi uvicorn httpx
    python scripts/api.py

Listens on http://localhost:8787
"""

import os
import sys
import tempfile
import json

# Add scripts/ to path so we can import flight_summary
sys.path.insert(0, os.path.dirname(__file__))
import flight_summary as fs

import httpx
import urllib.request
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Arrow Flight Analysis API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["POST", "OPTIONS"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    log_id: str
    signed_url: str          # Supabase signed URL to download the .bin
    supabase_url: str        # e.g. http://localhost:54321
    supabase_service_key: str  # service_role key (needed to PATCH without RLS)

@app.post("/analyze")
async def analyze(req: AnalyzeRequest):
    # 1. Download the .bin to a temp file
    with tempfile.NamedTemporaryFile(suffix=".bin", delete=False) as tmp:
        tmp_path = tmp.name

    try:
        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.get(req.signed_url)
            if resp.status_code != 200:
                raise HTTPException(status_code=502, detail=f"Failed to download log: HTTP {resp.status_code}")
            with open(tmp_path, 'wb') as f:
                f.write(resp.content)

        # 2. Run analysis
        summary = fs.analyze(tmp_path)

        # 3. Write back to Supabase
        payload = json.dumps({"summary": summary}).encode()
        url = f"{req.supabase_url}/rest/v1/flight_leg_logs?id=eq.{req.log_id}"
        patch_req = urllib.request.Request(url, data=payload, method='PATCH')
        patch_req.add_header('Content-Type', 'application/json')
        patch_req.add_header('apikey', req.supabase_service_key)
        patch_req.add_header('Authorization', f'Bearer {req.supabase_service_key}')
        patch_req.add_header('Prefer', 'return=minimal')
        with urllib.request.urlopen(patch_req) as r:
            if r.status not in (200, 204):
                raise HTTPException(status_code=502, detail=f"Supabase PATCH failed: HTTP {r.status}")

        return {"ok": True, "health_score": summary["health_score"], "summary": summary}

    finally:
        try:
            os.remove(tmp_path)
        except Exception:
            pass

@app.get("/health")
def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8787, reload=True)
