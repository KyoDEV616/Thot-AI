"""System monitoring router — CPU, RAM, GPU, Ollama process stats."""

import platform

import psutil
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class SystemStats(BaseModel):
    cpu_percent: float
    cpu_cores: int
    ram_used_gb: float
    ram_total_gb: float
    ram_percent: float
    ollama_ram_mb: float
    ollama_running: bool
    platform: str
    gpu_info: str


def _detect_gpu() -> str:
    system = platform.system()
    machine = platform.machine()
    if system == "Darwin" and machine == "arm64":
        try:
            import torch
            if torch.backends.mps.is_available():
                return "Apple Silicon (MPS available)"
            return "Apple Silicon (MPS unavailable)"
        except ImportError:
            return "Apple Silicon"
    if system == "Linux" or system == "Windows":
        try:
            import torch
            if torch.cuda.is_available():
                name = torch.cuda.get_device_name(0)
                mem = torch.cuda.get_device_properties(0).total_memory // 1024**3
                return f"{name} ({mem} GB VRAM)"
        except Exception:
            pass
    return "CPU only"


def _ollama_stats() -> tuple[bool, float]:
    """Returns (is_running, ram_mb) for the Ollama process."""
    for proc in psutil.process_iter(["name", "memory_info"]):
        try:
            name = (proc.info["name"] or "").lower()
            if "ollama" in name:
                mem = proc.info["memory_info"]
                ram_mb = round(mem.rss / 1024**2, 1) if mem else 0.0
                return True, ram_mb
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue
    return False, 0.0


@router.get("/stats", response_model=SystemStats)
async def get_stats():
    cpu_percent = psutil.cpu_percent(interval=0.1)
    cpu_cores = psutil.cpu_count(logical=True) or 1
    vm = psutil.virtual_memory()
    ram_used_gb = round(vm.used / 1024**3, 2)
    ram_total_gb = round(vm.total / 1024**3, 2)
    ram_percent = vm.percent
    ollama_running, ollama_ram_mb = _ollama_stats()
    gpu_info = _detect_gpu()
    sys_platform = f"{platform.system()} {platform.machine()}"

    return SystemStats(
        cpu_percent=cpu_percent,
        cpu_cores=cpu_cores,
        ram_used_gb=ram_used_gb,
        ram_total_gb=ram_total_gb,
        ram_percent=ram_percent,
        ollama_ram_mb=ollama_ram_mb,
        ollama_running=ollama_running,
        platform=sys_platform,
        gpu_info=gpu_info,
    )
