<div align="center">

<img src="https://img.shields.io/badge/version-0.1.0--alpha-gold?style=for-the-badge&labelColor=1a1a2e&color=c9a84c" />
<img src="https://img.shields.io/badge/license-MIT-brightgreen?style=for-the-badge&labelColor=1a1a2e&color=2d6a4f" />
<img src="https://img.shields.io/badge/platform-macOS%20%7C%20Windows%20%7C%20Linux-blue?style=for-the-badge&labelColor=1a1a2e&color=4361ee" />
<img src="https://img.shields.io/badge/AI-100%25%20Local-purple?style=for-the-badge&labelColor=1a1a2e&color=7b2d8b" />

<br /><br />

```
 ████████╗██╗  ██╗ ██████╗ ████████╗     █████╗ ██╗
    ██╔══╝██║  ██║██╔═══██╗╚══██╔══╝    ██╔══██╗██║
    ██║   ███████║██║   ██║   ██║       ███████║██║
    ██║   ██╔══██║██║   ██║   ██║       ██╔══██║██║
    ██║   ██║  ██║╚██████╔╝   ██║       ██║  ██║██║
    ╚═╝   ╚═╝  ╚═╝ ╚═════╝    ╚═╝       ╚═╝  ╚═╝╚═╝
```

### *Ancient wisdom. Modern intelligence. Entirely on your machine.*

**Thot AI** is a fully local, open-source personal AI assistant.  
It runs open-source language models directly on your computer — no subscriptions, no cloud, no privacy trade-offs.

<br />

[🚀 Install](#-installation) · [📖 Architecture](./ARCHITECTURE.md) · [🗺️ Roadmap](#-roadmap) · [🤝 Contributing](#-contributing)

---

</div>

## ✨ Features

| Capability | Description |
|-----------|-------------|
| 💬 **Streaming chat** | Real-time conversations with token-by-token streaming. Supports Llama 3, Mistral, Phi-3, and any Ollama-compatible model |
| 🧠 **Persistent memory** | Full conversation history stored locally. The assistant retains context across sessions |
| 📄 **File reader** | Drag and drop PDFs, Word documents, Excel files, CSVs, and plain text. Thot reads and answers questions about your content |
| 🔍 **Web search** | Access up-to-date information with the `/web` command. No API keys, no tracking |
| 🎨 **Image generation** | Generate images with Stable Diffusion directly from the chat using `/imagen` |
| 🌗 **Visual themes** | Three built-in themes: Pyramid (purple/gold), Ocean, and Forest. Full dark/light mode support |
| 🔒 **100% Private** | No data ever leaves your machine. No telemetry. No accounts. No subscriptions |

---

## 📸 Screenshots

> *Screenshots will be added with the beta release.*

---

## 🖥️ System requirements

### Minimum
| Component | Requirement |
|-----------|-------------|
| **RAM** | 8 GB |
| **Storage** | 10 GB free |
| **CPU** | Intel Core i5 (8th gen) / AMD Ryzen 5 / Apple Silicon M1 |
| **OS** | macOS 12+, Windows 10+, Ubuntu 20.04+ |

### Recommended
| Component | Requirement |
|-----------|-------------|
| **RAM** | 16 GB or more |
| **Storage** | 30 GB free |
| **GPU** | Apple Silicon M2+ / NVIDIA with 8 GB VRAM |

> 💡 **Apple Silicon note:** Thot AI automatically leverages the unified GPU on M1/M2/M3/M4 chips to accelerate both chat inference and image generation via MPS.

---

## 🚀 Installation

### Option 1 — Installer (recommended for end users)

Download the installer for your platform from the [**Releases**](../../releases) page:

| Platform | File | Notes |
|----------|------|-------|
| macOS | `Thot-AI_x.x.x_aarch64.dmg` | Apple Silicon (M1/M2/M3/M4) |
| macOS | `Thot-AI_x.x.x_x64.dmg` | Intel |
| Windows | `Thot-AI_x.x.x_x64-setup.exe` | Windows 10/11 |
| Linux | `Thot-AI_x.x.x_amd64.AppImage` | Universal |
| Linux | `Thot-AI_x.x.x_amd64.deb` | Ubuntu / Debian |

**[Ollama](https://ollama.com) must be installed before running Thot AI.** The setup wizard will guide you on first launch.

### Option 2 — Build from source

**Prerequisites:**
- [Node.js](https://nodejs.org) 20+
- [Rust](https://rustup.rs) (stable)
- [Python](https://python.org) 3.11 (3.14 not yet supported by PyTorch)
- [Ollama](https://ollama.com)

```bash
# 1. Clone the repository
git clone https://github.com/your-username/thot-ai.git
cd thot-ai

# 2. Set up the Python backend environment
cd backend
python3.11 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cd ..

# 3. Install frontend dependencies
npm install

# 4. Run in development mode
npm run tauri dev
```

> **macOS + Homebrew:** If Python 3.11 is not your system default, install it with `brew install python@3.11` and use `/opt/homebrew/opt/python@3.11/bin/python3.11 -m venv backend/.venv`.

---

## 🗂️ Project structure

```
thot-ai/
├── src/                    # Frontend — React + TypeScript
│   ├── components/
│   │   ├── Chat/           # Conversation UI (streaming, markdown, model selector)
│   │   ├── Sidebar/        # Conversation history and navigation
│   │   └── Settings/       # App configuration panel
│   ├── pages/              # Top-level page views
│   └── store/              # Global state (Zustand, persisted)
│
├── src-tauri/              # Native layer — Rust / Tauri 2
│   ├── src/main.rs         # Entry point, Python process management
│   └── tauri.conf.json     # App configuration (decorations, bundle, CSP)
│
├── backend/                # REST API — FastAPI (Python 3.11)
│   ├── main.py             # FastAPI app + CORS middleware
│   ├── routers/
│   │   ├── chat.py         # SSE streaming chat endpoint
│   │   ├── files.py        # Document upload and text extraction
│   │   ├── images.py       # SDXL-Turbo image generation (MPS)
│   │   └── search.py       # DuckDuckGo web search
│   └── services/
│       ├── ollama.py       # Ollama REST client (streaming + model list)
│       ├── memory.py       # Conversation context retrieval
│       ├── file_reader.py  # LlamaIndex document ingestion
│       └── database.py     # SQLAlchemy async + SQLite ORM
│
└── scripts/
    └── setup.py            # Creates backend/.venv and installs dependencies
```

---

## 🤖 Supported models

Thot AI works with any model available through Ollama. Recommended options:

| Model | Size | RAM needed | Best for |
|-------|------|------------|----------|
| `llama3.2:3b` | ~2 GB | 8 GB | Fast everyday use |
| `llama3.1:8b` | ~5 GB | 12 GB | More detailed responses |
| `mistral:7b` | ~4 GB | 10 GB | Code and analysis |
| `phi3:mini` | ~2 GB | 8 GB | Low-RAM machines |
| `llava:7b` | ~5 GB | 12 GB | Vision + image analysis |

---

## 🗺️ Roadmap

- [x] Base project architecture
- [ ] **v0.1** — Streaming chat + conversation history
- [ ] **v0.2** — File reader (PDF, DOCX, Excel)
- [ ] **v0.3** — Integrated web search
- [ ] **v0.4** — Image generation (Stable Diffusion)
- [ ] **v0.5** — Visual themes and customization
- [ ] **v1.0** — First stable release with public installer
- [ ] **v1.x** — Voice support (STT/TTS)
- [ ] **v1.x** — Plugin system / extensions

---

## 🛠️ Tech stack

<div align="center">

![Tauri](https://img.shields.io/badge/Tauri_2-FFC131?style=flat-square&logo=tauri&logoColor=black)
![React](https://img.shields.io/badge/React_18-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white)
![Rust](https://img.shields.io/badge/Rust-CE422B?style=flat-square&logo=rust&logoColor=white)
![Python](https://img.shields.io/badge/Python_3.11-3776AB?style=flat-square&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=flat-square&logo=sqlite&logoColor=white)
![Ollama](https://img.shields.io/badge/Ollama-000000?style=flat-square&logoColor=white)

</div>

---

## 🤝 Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a PR.

1. Fork the repository
2. Create a branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'feat: add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT** License. See [`LICENSE`](./LICENSE) for details.

---

<div align="center">

*Thot AI — Built with open source*

*"Knowledge is the food of the soul." — Plato*

</div>
