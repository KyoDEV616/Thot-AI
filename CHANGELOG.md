# Changelog — Thot AI

Todos los cambios notables de este proyecto se documentan en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es/1.0.0/)  
y este proyecto sigue [Semantic Versioning](https://semver.org/lang/es/).

> **Tipos de cambio:**
> - `✨ Agregado` — nuevas funcionalidades
> - `🔄 Cambiado` — cambios en funcionalidades existentes
> - `🗑️ Eliminado` — funcionalidades eliminadas
> - `🐛 Corregido` — corrección de errores
> - `🔒 Seguridad` — cambios relacionados con vulnerabilidades
> - `⚡ Rendimiento` — mejoras de rendimiento sin cambios funcionales

---

## [Sin lanzar]

### ✨ Agregado
- Estructura base del proyecto (Tauri 2 + React + FastAPI)
- Configuración inicial de Tailwind con tema Pyramid (dorado/púrpura)
- Conexión Tauri ↔ FastAPI ↔ Ollama
- Chat básico con streaming SSE
- Sistema de gestión de procesos Python desde Rust

---

## [0.1.0-alpha] — *Próximamente*

### ✨ Agregado
- Interfaz de chat principal con burbujas de mensaje
- Streaming de respuestas token por token
- Selector dinámico de modelos Ollama
- Historial de conversaciones en SQLite
- Sidebar colapsable con lista de conversaciones
- Búsqueda en historial por texto
- Dark mode y Light mode con toggle
- Tema visual "Pyramid" (dorado/púrpura egipcio)
- Wizard de onboarding (3 pasos)
- Verificación de estado de Ollama en tiempo real
- Proceso Python gestionado automáticamente por Tauri

---

## [0.2.0] — *Planeado*

### ✨ Agregado
- Lector de archivos con drag & drop
- Soporte para PDF, DOCX, XLSX, TXT, CSV
- Procesamiento de documentos con LlamaIndex
- Badge visual del archivo cargado en el input
- Memoria de contexto entre sesiones (últimas 3 conversaciones relevantes)

---

## [0.3.0] — *Planeado*

### ✨ Agregado
- Búsqueda web con comando `/web [query]`
- Integración con DuckDuckGo (sin API key)
- Síntesis de resultados con citación de fuentes
- Toggle de búsqueda automática en Settings

---

## [0.4.0] — *Planeado*

### ✨ Agregado
- Generación de imágenes con comando `/imagen [descripción]`
- Motor: Stable Diffusion SDXL-Turbo
- Aceleración MPS para Apple Silicon
- Imágenes inline en el chat
- Galería local en `~/.thot-ai/images/`

---

## [0.5.0] — *Planeado*

### ✨ Agregado
- Tema visual "Ocean" (azules y cianes)
- Tema visual "Forest" (verdes y esmeraldas)
- Panel de Settings completo
- System prompt personalizable
- Configuración de tamaño de fuente
- Indicador de uso de RAM en tiempo real

---

## [1.0.0] — *Planeado*

### ✨ Agregado
- Instaladores firmados para macOS (.dmg), Windows (.exe), Linux (.AppImage / .deb)
- GitHub Releases automáticos vía GitHub Actions
- Documentación completa

### 🔄 Cambiado
- Versión estable y apta para distribución pública

---

<!--
PLANTILLA para nuevas entradas:

## [X.Y.Z] — YYYY-MM-DD

### ✨ Agregado
-

### 🔄 Cambiado
-

### 🗑️ Eliminado
-

### 🐛 Corregido
-

### 🔒 Seguridad
-

### ⚡ Rendimiento
-
-->
