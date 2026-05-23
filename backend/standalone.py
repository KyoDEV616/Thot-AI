"""Standalone entry point for PyInstaller — starts uvicorn programmatically."""

import os
import sys

# When frozen, MEIPASS has all the bundled app files
if getattr(sys, "frozen", False):
    sys.path.insert(0, sys._MEIPASS)

import uvicorn
from main import app  # explicit import so PyInstaller traces and bundles main.py

if __name__ == "__main__":
    port = int(os.environ.get("THOT_PORT", "8000"))
    uvicorn.run(app, host="127.0.0.1", port=port, workers=1, log_level="warning")
