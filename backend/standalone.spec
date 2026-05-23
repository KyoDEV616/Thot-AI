# -*- mode: python ; coding: utf-8 -*-
from PyInstaller.utils.hooks import collect_all, collect_data_files, collect_submodules

datas = []
binaries = []
hiddenimports = []

core_packages = [
    "uvicorn", "fastapi", "starlette", "anyio",
    "httpx", "httpcore", "sqlalchemy", "aiosqlite",
    "pydantic", "pydantic_settings",
    "duckduckgo_search", "python_docx", "openpyxl",
    "PIL",
]

for pkg in core_packages:
    try:
        d, b, h = collect_all(pkg)
        datas += d
        binaries += b
        hiddenimports += h
    except Exception:
        pass

hiddenimports += [
    "anyio._backends._asyncio",
    "anyio._backends._trio",
    "uvicorn.logging",
    "uvicorn.loops",
    "uvicorn.loops.auto",
    "uvicorn.loops.asyncio",
    "uvicorn.protocols",
    "uvicorn.protocols.http",
    "uvicorn.protocols.http.auto",
    "uvicorn.protocols.websockets",
    "uvicorn.protocols.websockets.auto",
    "uvicorn.lifespan",
    "uvicorn.lifespan.on",
    "email.mime.text",
    "email.mime.multipart",
    "routers.chat",
    "routers.files",
    "routers.images",
    "routers.search",
    "routers.models",
    "routers.system",
    "services.database",
    "services.memory",
    "services.file_reader",
    "services.ollama",
]

a = Analysis(
    ["standalone.py"],
    pathex=["."],
    binaries=binaries,
    datas=datas + [
        ("main.py", "."),
        ("routers", "routers"),
        ("services", "services"),
    ],
    hiddenimports=hiddenimports,
    hookspath=[],
    runtime_hooks=[],
    excludes=[
        "torch", "torchvision", "torchaudio",
        "diffusers", "transformers", "accelerate",
        "llama_index", "llama_index_core",
        "scipy", "sklearn", "matplotlib",
        "IPython", "jupyter",
    ],
    noarchive=False,
    optimize=1,
)

pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.datas,
    [],
    name="thot-backend",
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    console=False,
    disable_windowed_traceback=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
