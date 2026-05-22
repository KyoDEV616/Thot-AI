"""Standalone entry point for PyInstaller — starts uvicorn programmatically."""

import os
import sys

# When running as a PyInstaller bundle, MEIPASS has all the app files
if getattr(sys, "frozen", False):
    sys.path.insert(0, sys._MEIPASS)

import uvicorn

if __name__ == "__main__":
    port = int(os.environ.get("THOT_PORT", "8000"))
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=port,
        workers=1,
        log_level="warning",
    )
