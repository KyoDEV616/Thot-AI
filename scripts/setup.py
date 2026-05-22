#!/usr/bin/env python3
"""
Thot AI setup script.
Creates a Python .venv in backend/ and installs all required dependencies.
Run from the project root: python scripts/setup.py
"""

import subprocess
import sys
import os
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent.resolve()
BACKEND_DIR = PROJECT_ROOT / "backend"
VENV_DIR = BACKEND_DIR / ".venv"


def run(cmd: list[str], cwd: Path | None = None) -> None:
    print(f"  → {' '.join(str(c) for c in cmd)}")
    result = subprocess.run(cmd, cwd=cwd or PROJECT_ROOT, check=True)
    if result.returncode != 0:
        sys.exit(result.returncode)


def main() -> None:
    print("\n🔺 Thot AI — Setup\n")

    # Require Python 3.11+
    if sys.version_info < (3, 11):
        print(f"ERROR: Python 3.11+ required. Found {sys.version}")
        sys.exit(1)

    # Create .venv inside backend/
    print("1. Creating virtual environment in backend/.venv ...")
    run([sys.executable, "-m", "venv", str(VENV_DIR)])

    # Determine pip path
    if sys.platform == "win32":
        pip = VENV_DIR / "Scripts" / "pip.exe"
        python = VENV_DIR / "Scripts" / "python.exe"
    else:
        pip = VENV_DIR / "bin" / "pip"
        python = VENV_DIR / "bin" / "python"

    print("2. Upgrading pip ...")
    run([str(python), "-m", "pip", "install", "--upgrade", "pip"])

    print("3. Installing backend dependencies ...")
    requirements = BACKEND_DIR / "requirements.txt"
    run([str(pip), "install", "-r", str(requirements)])

    print("\n✅ Setup complete!")
    print(f"   Backend venv: {VENV_DIR}")
    print("\nTo start the backend manually:")
    if sys.platform == "win32":
        print(f"   {VENV_DIR / 'Scripts' / 'uvicorn'} main:app --reload")
    else:
        print(f"   {VENV_DIR / 'bin' / 'uvicorn'} main:app --reload --port 8000")
    print("\nOr just run: npm run tauri dev\n")


if __name__ == "__main__":
    main()
