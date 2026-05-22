# Arquitectura y Documentación Técnica — Thot AI

> **Versión del documento:** 1.0  
> **Fecha:** Mayo 2025

---

## 1. Visión general de la arquitectura

Thot AI sigue una arquitectura de **tres capas** que se ejecutan localmente en la máquina del usuario:

```
┌─────────────────────────────────────────────────────────┐
│                   CAPA DE PRESENTACIÓN                   │
│              Tauri 2 + React 18 + TypeScript             │
│         (Ventana nativa · UI · Estado global)            │
└─────────────────────┬───────────────────────────────────┘
                      │  IPC Tauri / HTTP localhost
┌─────────────────────▼───────────────────────────────────┐
│                   CAPA DE APLICACIÓN                     │
│                  FastAPI (Python 3.11)                   │
│     (Enrutamiento · Lógica · Procesamiento de datos)     │
└──────┬──────────────┬──────────────┬───────────────┬────┘
       │              │              │               │
  Ollama API    LlamaIndex      diffusers      DuckDuckGo
  (chat/LLM)   (archivos)      (imágenes)     (búsqueda)
       │
┌──────▼──────────────────────────────────────────────────┐
│                   CAPA DE DATOS                          │
│              SQLite · Sistema de archivos                │
│        (~/.thot-ai/conversations.db · /images/)         │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Componentes principales

### 2.1 Frontend — Tauri + React

**Responsabilidades:**
- Renderizar la interfaz de usuario
- Gestionar el estado global de la aplicación (Zustand)
- Establecer conexiones SSE para streaming de respuestas
- Comunicarse con el backend vía HTTP a `localhost:{THOT_PORT}`

**Tecnologías:**

| Librería | Versión | Uso |
|----------|---------|-----|
| Tauri | 2.x | Shell nativa, gestión de ventana, IPC |
| React | 18.x | Framework UI |
| TypeScript | 5.x | Tipado estático |
| Tailwind CSS | 3.x | Sistema de estilos |
| Zustand | 4.x | Estado global |
| react-markdown | 9.x | Renderizado de Markdown |
| Framer Motion | 11.x | Animaciones |
| Lucide React | 0.x | Iconos |

**Estructura de componentes:**

```
src/
├── components/
│   ├── Chat/
│   │   ├── ChatWindow.tsx      # Contenedor principal del chat
│   │   ├── MessageBubble.tsx   # Burbuja individual de mensaje
│   │   ├── MessageInput.tsx    # Input con drag & drop y comandos
│   │   ├── StreamingIndicator.tsx
│   │   └── FileAttachment.tsx
│   ├── Sidebar/
│   │   ├── Sidebar.tsx         # Contenedor colapsable
│   │   ├── ConversationList.tsx
│   │   ├── SearchBar.tsx
│   │   └── NewChatButton.tsx
│   ├── Settings/
│   │   ├── SettingsPanel.tsx
│   │   ├── ModelSelector.tsx
│   │   ├── ThemeSelector.tsx
│   │   └── SystemPrompt.tsx
│   └── Onboarding/
│       ├── OnboardingWizard.tsx
│       ├── StepOllama.tsx
│       ├── StepModel.tsx
│       └── StepPersonalize.tsx
├── pages/
│   ├── ChatPage.tsx
│   └── SettingsPage.tsx
├── store/
│   ├── chatStore.ts            # Estado de conversaciones
│   ├── settingsStore.ts        # Preferencias del usuario
│   └── modelStore.ts           # Estado de modelos disponibles
└── hooks/
    ├── useStream.ts            # Hook para SSE
    └── useOllamaStatus.ts      # Ping periódico a Ollama
```

---

### 2.2 Backend — Rust / Tauri Core

**Responsabilidades:**
- Crear la ventana nativa de la aplicación
- Lanzar y gestionar el proceso Python (FastAPI) como proceso hijo
- Detectar un puerto libre y pasarlo al frontend vía variable de entorno
- Terminar el proceso Python al cerrar la ventana

**Fragmento clave — `src-tauri/src/main.rs`:**

```rust
// Al inicio de la app, Tauri:
// 1. Encuentra un puerto libre
// 2. Lanza el proceso Python del .venv
// 3. Espera a que FastAPI responda en /health
// 4. Pasa el puerto al webview como variable de entorno

fn find_free_port() -> u16 { ... }

fn launch_backend(port: u16) -> std::process::Child {
    let python = if cfg!(target_os = "windows") {
        ".venv\\Scripts\\python.exe"
    } else {
        ".venv/bin/python"
    };
    
    std::process::Command::new(python)
        .arg("backend/main.py")
        .env("THOT_PORT", port.to_string())
        .spawn()
        .expect("No se pudo iniciar el backend")
}
```

**Configuración — `tauri.conf.json`:**

```json
{
  "productName": "Thot AI",
  "identifier": "ai.thot.app",
  "version": "0.1.0",
  "windows": [{
    "title": "Thot AI",
    "width": 1200,
    "height": 800,
    "minWidth": 800,
    "minHeight": 600,
    "decorations": false,
    "transparent": false
  }],
  "bundle": {
    "targets": ["dmg", "nsis", "app-image", "deb"]
  }
}
```

---

### 2.3 Backend — FastAPI (Python)

**Responsabilidades:**
- Exponer una API REST en `localhost:{THOT_PORT}`
- Enrutar peticiones al motor de IA (Ollama), lector de archivos, búsqueda web y generación de imágenes
- Gestionar el historial de conversaciones en SQLite
- Servir el stream SSE para las respuestas del modelo

**Estructura:**

```
backend/
├── main.py                 # Entrada, CORS, configuración global
├── requirements.txt
├── routers/
│   ├── chat.py            # POST /chat · GET /chat/stream
│   ├── conversations.py   # CRUD de conversaciones
│   ├── files.py           # POST /files/upload · POST /files/query
│   ├── images.py          # POST /images/generate
│   └── search.py          # POST /search/web
├── services/
│   ├── ollama.py          # Cliente para la API de Ollama
│   ├── memory.py          # Gestión de contexto y memoria
│   ├── file_reader.py     # LlamaIndex para procesamiento
│   └── image_gen.py       # diffusers + SDXL-Turbo
├── models/
│   ├── chat.py            # Schemas Pydantic para chat
│   ├── conversation.py    # Schemas de conversación
│   └── settings.py        # Schema de configuración
└── database/
    ├── db.py              # Conexión SQLite, SQLAlchemy
    └── migrations/        # Migraciones de esquema
```

**Endpoints principales:**

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/health` | Verificación de estado (usado por Tauri al inicio) |
| `GET` | `/models` | Lista modelos disponibles en Ollama |
| `POST` | `/chat` | Envía mensaje y recibe respuesta en streaming (SSE) |
| `GET` | `/conversations` | Lista todas las conversaciones |
| `GET` | `/conversations/{id}` | Obtiene una conversación con sus mensajes |
| `DELETE` | `/conversations/{id}` | Elimina una conversación |
| `POST` | `/files/upload` | Procesa y fragmenta un archivo |
| `POST` | `/files/query` | Consulta sobre un archivo procesado |
| `POST` | `/search/web` | Búsqueda en DuckDuckGo |
| `POST` | `/images/generate` | Genera una imagen con Stable Diffusion |

**Ejemplo — endpoint de chat con SSE:**

```python
# routers/chat.py
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from services.ollama import stream_response

router = APIRouter()

@router.post("/chat")
async def chat(request: ChatRequest):
    async def event_generator():
        async for token in stream_response(
            model=request.model,
            messages=request.messages,
            system_prompt=request.system_prompt
        ):
            yield f"data: {token}\n\n"
        yield "data: [DONE]\n\n"
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache"}
    )
```

---

### 2.4 Motor de IA — Ollama

**Responsabilidades:**
- Gestionar la descarga, almacenamiento y ejecución de modelos LLM
- Exponer una API REST en `localhost:11434`
- Aprovechar la aceleración de hardware disponible (MPS en Apple Silicon, CUDA en NVIDIA)

**Endpoints de Ollama utilizados:**

| Endpoint | Uso |
|----------|-----|
| `GET /api/tags` | Listar modelos instalados |
| `POST /api/chat` | Chat con streaming |
| `POST /api/pull` | Descargar un modelo (con progreso) |
| `GET /api/version` | Verificar que Ollama está activo |

**Configuración requerida:**

```bash
# Variable de entorno necesaria para permitir peticiones desde Tauri
export OLLAMA_ORIGINS="*"
```

---

### 2.5 Módulo de archivos — LlamaIndex

**Flujo de procesamiento:**

```
Archivo del usuario
      │
      ▼
 Detección de tipo
 (PDF/DOCX/XLSX/TXT/CSV)
      │
      ▼
 Extracción de texto
 (PyMuPDF · python-docx · openpyxl)
      │
      ▼
 Fragmentación (chunking)
 Tamaño: 512 tokens · Overlap: 50 tokens
      │
      ▼
 Embeddings con modelo local
 (nomic-embed-text vía Ollama)
      │
      ▼
 Índice en memoria
 (VectorStoreIndex de LlamaIndex)
      │
      ▼
 Consulta del usuario → Recuperación → Contexto → LLM
```

---

### 2.6 Generación de imágenes — Stable Diffusion

**Configuración para Apple Silicon (MPS):**

```python
# services/image_gen.py
import torch
from diffusers import AutoPipelineForText2Image

def get_device():
    if torch.backends.mps.is_available():
        return "mps"
    if torch.cuda.is_available():
        return "cuda"
    return "cpu"

pipe = AutoPipelineForText2Image.from_pretrained(
    "stabilityai/sdxl-turbo",
    torch_dtype=torch.float16 if get_device() != "cpu" else torch.float32,
    variant="fp16" if get_device() != "cpu" else None
).to(get_device())

def generate(prompt: str, steps: int = 4) -> str:
    image = pipe(
        prompt=prompt,
        num_inference_steps=steps,
        guidance_scale=0.0  # SDXL-Turbo no usa guidance scale
    ).images[0]
    
    path = f"~/.thot-ai/images/{uuid4()}.png"
    image.save(path)
    return path
```

---

## 3. Flujo de inicio de la aplicación

```
Usuario abre Thot AI
         │
         ▼
  Tauri inicializa
  la ventana nativa
         │
         ▼
  Rust busca puerto
  libre (ej: 8742)
         │
         ▼
  Rust lanza:
  .venv/bin/python backend/main.py
  con THOT_PORT=8742
         │
         ▼
  Tauri hace ping a
  localhost:8742/health
  cada 200ms (max 10s)
         │
    ┌────┴────┐
    │ timeout │──► Mostrar error:
    └────┬────┘    "Backend no disponible"
         │ OK
         ▼
  React se monta,
  Zustand carga config
         │
         ▼
  ¿Existe ~/.thot-ai/config.json?
    ┌────┴────┐
    │   NO    │──► Mostrar Onboarding Wizard
    └────┬────┘
         │ SÍ
         ▼
  ¿Ollama responde en
  localhost:11434?
    ┌────┴────┐
    │   NO    │──► Banner: "Ollama no está activo.
    └────┬────┘    Abre Ollama e intenta de nuevo."
         │ SÍ
         ▼
  Cargar última conversación
  o mostrar pantalla de bienvenida
```

---

## 4. Gestión de estado (Zustand)

```typescript
// store/chatStore.ts
interface ChatStore {
  conversations: Conversation[]
  activeConversationId: string | null
  isStreaming: boolean
  
  // Acciones
  createConversation: () => void
  selectConversation: (id: string) => void
  sendMessage: (content: string, file?: File) => void
  deleteConversation: (id: string) => void
}

// store/settingsStore.ts
interface SettingsStore {
  theme: 'pyramid' | 'ocean' | 'forest'
  colorMode: 'dark' | 'light'
  activeModel: string
  systemPrompt: string
  assistantName: string
  webSearchEnabled: boolean
  fontSize: 'sm' | 'md' | 'lg'
}
```

---

## 5. Sistema de temas CSS

Los temas se implementan como variables CSS en `:root`. El cambio de tema solo requiere cambiar el atributo `data-theme` en el elemento `<html>`:

```css
[data-theme="pyramid"][data-mode="dark"] {
  --bg-base:       #1a1a2e;
  --bg-surface:    #16213e;
  --bg-elevated:   #0f3460;
  --accent:        #c9a84c;
  --accent-muted:  #7b2d8b;
  --text-primary:  #e8e0d0;
  --text-secondary:#a89880;
  --border:        rgba(201, 168, 76, 0.2);
}

[data-theme="ocean"][data-mode="dark"] {
  --bg-base:       #03045e;
  --bg-surface:    #023e8a;
  --bg-elevated:   #0077b6;
  --accent:        #00b4d8;
  --accent-muted:  #0096c7;
  --text-primary:  #caf0f8;
  --text-secondary:#90e0ef;
  --border:        rgba(0, 180, 216, 0.2);
}
```

---

## 6. Seguridad

### Modelo de amenazas

| Amenaza | Mitigación |
|---------|------------|
| Inyección de prompts via archivos maliciosos | Sanitización de texto extraído antes de enviar al LLM |
| Peticiones externas no autorizadas | La app solo abre conexiones externas cuando el usuario activa búsqueda web explícitamente |
| Acceso de otras apps al backend local | FastAPI solo escucha en `127.0.0.1`, no en `0.0.0.0` |
| Archivos ejecutables disfrazados | Validación estricta de extensiones y MIME types en el módulo de archivos |

### Política de datos

- **Ningún dato** abandona el dispositivo sin consentimiento explícito del usuario
- El historial se almacena en texto plano en SQLite (sin cifrado en v1, planificado en v2)
- Las imágenes generadas se guardan localmente y nunca se suben a ningún servicio

---

## 7. Build y distribución

### Proceso de build

```bash
# Desarrollo
npm run tauri dev

# Producción (genera instaladores para la plataforma actual)
npm run tauri build
```

### Artefactos generados

| Plataforma | Archivos | Ubicación |
|-----------|---------|-----------|
| macOS ARM | `Thot-AI_x.x.x_aarch64.dmg` | `src-tauri/target/release/bundle/dmg/` |
| macOS x64 | `Thot-AI_x.x.x_x64.dmg` | `src-tauri/target/release/bundle/dmg/` |
| Windows | `Thot-AI_x.x.x_x64-setup.exe` | `src-tauri/target/release/bundle/nsis/` |
| Linux | `Thot-AI_x.x.x_amd64.AppImage` | `src-tauri/target/release/bundle/appimage/` |
| Linux | `Thot-AI_x.x.x_amd64.deb` | `src-tauri/target/release/bundle/deb/` |

### CI/CD con GitHub Actions (planeado para v1.0)

```yaml
# .github/workflows/release.yml
# En cada tag vX.Y.Z:
# 1. Build en ubuntu-latest  → AppImage + .deb
# 2. Build en windows-latest → .exe
# 3. Build en macos-latest   → .dmg (x64 + ARM64)
# 4. Crear GitHub Release con todos los artefactos
```

---

## 8. Dependencias Python completas

```txt
# requirements.txt

# API
fastapi==0.111.0
uvicorn[standard]==0.29.0
python-multipart==0.0.9
sse-starlette==2.1.0

# IA y modelos
langchain==0.2.0
langchain-community==0.2.0
llama-index==0.10.40
llama-index-llms-ollama==0.1.5

# Generación de imágenes
torch>=2.3.0
diffusers==0.27.2
transformers==4.40.0
accelerate==0.30.0

# Lectura de archivos
pymupdf==1.24.3          # PDF
python-docx==1.1.0       # DOCX
openpyxl==3.1.2          # XLSX
pandas==2.2.2            # CSV/Excel

# Búsqueda web
duckduckgo-search==6.1.7

# Base de datos
sqlalchemy==2.0.30

# Utilidades
pydantic==2.7.1
python-dotenv==1.0.1
```

---

## 9. Glosario

| Término | Definición |
|---------|------------|
| **Ollama** | Herramienta open source para ejecutar LLMs localmente vía API REST |
| **GGUF** | Formato de cuantización de modelos LLM optimizado para CPU/GPU de consumo |
| **MPS** | Metal Performance Shaders — API de Apple para computación en GPU en Silicon |
| **SSE** | Server-Sent Events — protocolo HTTP para streaming unidireccional de datos |
| **LlamaIndex** | Framework Python para indexar y consultar documentos usando LLMs |
| **SDXL-Turbo** | Variante optimizada de Stable Diffusion XL que genera imágenes en 4 pasos |
| **Chunking** | Proceso de dividir un documento largo en fragmentos manejables para el LLM |
| **Tauri IPC** | Canal de comunicación seguro entre el webview de React y el core de Rust |
| **Sidecar** | Proceso secundario gestionado por la app principal (aquí: FastAPI lanzado por Tauri) |
