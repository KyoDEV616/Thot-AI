# Especificaciones del Proyecto — Thot AI

> **Versión del documento:** 1.0  
> **Fecha:** Mayo 2025  
> **Estado:** Borrador activo

---

## 1. Visión general

**Thot AI** es una aplicación de escritorio multiplataforma que permite a cualquier usuario ejecutar un asistente de inteligencia artificial personal de forma completamente local. El sistema utiliza modelos de lenguaje open source a través de Ollama, sin requerir conexión a servicios externos, suscripciones pagas ni cuentas de usuario.

El nombre hace referencia a **Thot**, dios egipcio de la sabiduría, el conocimiento y la escritura.

### 1.1 Problema que resuelve

Los asistentes de IA actuales (ChatGPT, Claude, Gemini) requieren conexión a internet, envían datos a servidores de terceros y tienen costos recurrentes. Thot AI democratiza el acceso a IA conversacional avanzada para usuarios que valoran su privacidad o no tienen acceso constante a internet.

### 1.2 Usuarios objetivo

- Usuarios técnicos y no técnicos con PC de gama media-alta
- Profesionales que manejan información sensible (médicos, abogados, investigadores)
- Desarrolladores que quieren un asistente local para programar
- Cualquier persona interesada en IA que prefiera control total sobre sus datos

---

## 2. Requisitos funcionales

### 2.1 Chat conversacional

| ID | Requisito | Prioridad |
|----|-----------|-----------|
| F-01 | El sistema debe permitir conversaciones en lenguaje natural con el modelo seleccionado | Alta |
| F-02 | Las respuestas deben mostrarse en streaming (token por token) | Alta |
| F-03 | El usuario debe poder seleccionar entre los modelos disponibles en Ollama | Alta |
| F-04 | El chat debe soportar formato Markdown en las respuestas (negrita, código, listas, tablas) | Alta |
| F-05 | El usuario debe poder limpiar la conversación actual en cualquier momento | Media |
| F-06 | Se debe mostrar un indicador animado mientras el modelo genera la respuesta | Media |

### 2.2 Historial y memoria

| ID | Requisito | Prioridad |
|----|-----------|-----------|
| F-07 | Todas las conversaciones deben guardarse automáticamente en una base de datos local | Alta |
| F-08 | El usuario debe poder acceder a conversaciones anteriores desde el sidebar | Alta |
| F-09 | El sistema debe generar un título automático para cada conversación | Media |
| F-10 | El usuario debe poder buscar en el historial por texto | Media |
| F-11 | El sistema debe inyectar contexto de conversaciones relevantes pasadas al prompt | Media |
| F-12 | El usuario debe poder eliminar conversaciones individuales o todo el historial | Media |

### 2.3 Lector de archivos

| ID | Requisito | Prioridad |
|----|-----------|-----------|
| F-13 | El usuario debe poder adjuntar archivos mediante drag & drop en el área de chat | Alta |
| F-14 | El sistema debe soportar los formatos: PDF, DOCX, XLSX, TXT, CSV | Alta |
| F-15 | El contenido del archivo debe procesarse y fragmentarse para ser consultado por el modelo | Alta |
| F-16 | Se debe mostrar un indicador visual del archivo cargado antes de enviar el mensaje | Media |
| F-17 | El usuario debe poder hacer preguntas específicas sobre el contenido del archivo | Alta |

### 2.4 Búsqueda web

| ID | Requisito | Prioridad |
|----|-----------|-----------|
| F-18 | El usuario debe poder activar búsqueda web con el comando `/web [consulta]` | Media |
| F-19 | El sistema debe usar DuckDuckGo como motor de búsqueda (sin API key) | Media |
| F-20 | El modelo debe sintetizar los resultados y citar las fuentes con URLs | Media |
| F-21 | El usuario debe poder activar/desactivar la búsqueda web desde Settings | Baja |

### 2.5 Generación de imágenes

| ID | Requisito | Prioridad |
|----|-----------|-----------|
| F-22 | El usuario debe poder generar imágenes con el comando `/imagen [descripción]` | Media |
| F-23 | El sistema debe usar Stable Diffusion SDXL-Turbo como motor de generación | Media |
| F-24 | Las imágenes deben aparecer inline en el chat | Media |
| F-25 | El sistema debe mostrar una barra de progreso durante la generación | Media |
| F-26 | Las imágenes generadas deben guardarse en `~/.thot-ai/images/` | Baja |

### 2.6 Interfaz y personalización

| ID | Requisito | Prioridad |
|----|-----------|-----------|
| F-27 | El usuario debe poder alternar entre dark mode y light mode | Alta |
| F-28 | El sistema debe ofrecer al menos 3 temas de color: Pyramid, Ocean, Forest | Media |
| F-29 | El usuario debe poder personalizar el system prompt del asistente | Media |
| F-30 | El usuario debe poder cambiar el tamaño de fuente desde Settings | Baja |

### 2.7 Onboarding

| ID | Requisito | Prioridad |
|----|-----------|-----------|
| F-31 | La primera vez que se abre la app debe mostrarse un wizard de configuración | Alta |
| F-32 | El wizard debe verificar si Ollama está instalado y ofrecer link de descarga si no | Alta |
| F-33 | El wizard debe permitir descargar un modelo con barra de progreso | Alta |
| F-34 | El wizard debe permitir personalizar el nombre del asistente y el system prompt | Media |
| F-35 | El onboarding no debe mostrarse si ya existe `~/.thot-ai/config.json` | Alta |

---

## 3. Requisitos no funcionales

### 3.1 Rendimiento

| ID | Requisito |
|----|-----------|
| NF-01 | La aplicación debe iniciar en menos de 5 segundos en hardware recomendado |
| NF-02 | El primer token de respuesta debe aparecer en menos de 3 segundos con Llama 3.2 3B |
| NF-03 | La UI debe mantenerse responsiva durante la generación de texto (no bloquear el hilo principal) |
| NF-04 | La generación de imágenes no debe bloquear la interfaz de chat |

### 3.2 Privacidad y seguridad

| ID | Requisito |
|----|-----------|
| NF-05 | Ningún dato de conversación debe salir del dispositivo del usuario |
| NF-06 | La aplicación no debe incluir telemetría, analytics ni reportes de uso |
| NF-07 | La única conexión externa permitida es la búsqueda web, y solo cuando el usuario la activa explícitamente |
| NF-08 | No se deben requerir cuentas de usuario ni autenticación |

### 3.3 Compatibilidad

| ID | Requisito |
|----|-----------|
| NF-09 | Debe funcionar en macOS 12+, Windows 10+, Ubuntu 20.04+ |
| NF-10 | Debe soportar arquitecturas x64 y ARM64 (Apple Silicon) |
| NF-11 | En Apple Silicon, debe usar MPS (Metal Performance Shaders) para aceleración de IA |

### 3.4 Instalación y distribución

| ID | Requisito |
|----|-----------|
| NF-12 | El instalador no debe superar los 30 MB |
| NF-13 | La instalación no debe requerir permisos de administrador (excepto en Windows con NSIS) |
| NF-14 | El proceso de configuración inicial (onboarding) debe completarse en menos de 10 minutos |
| NF-15 | Todos los datos del usuario deben guardarse en `~/.thot-ai/` para fácil respaldo |

---

## 4. Restricciones técnicas

- **Sin GPU dedicada requerida:** El sistema debe funcionar en modo CPU como fallback
- **Sin dependencias de red en tiempo de ejecución:** Excepto búsqueda web activada por el usuario
- **Sin base de datos externa:** Todo en SQLite local
- **Sin Docker ni contenedores:** Instalación nativa para facilitar acceso a GPU
- **Modelos de IA deben ser open source:** Con licencias que permitan uso comercial o personal sin restricciones significativas

---

## 5. Comandos de chat disponibles

| Comando | Descripción | Ejemplo |
|---------|-------------|---------|
| `/web [query]` | Busca en internet y sintetiza resultados | `/web precio del dólar hoy` |
| `/imagen [prompt]` | Genera una imagen con Stable Diffusion | `/imagen un gato astronauta` |
| `/modelo [nombre]` | Cambia el modelo activo | `/modelo llama3.1:8b` |
| `/limpiar` | Limpia la conversación actual | `/limpiar` |
| `/ayuda` | Muestra la lista de comandos disponibles | `/ayuda` |

---

## 6. Datos almacenados localmente

```
~/.thot-ai/
├── config.json          # Preferencias: tema, modelo, system prompt, etc.
├── conversations.db     # SQLite: historial completo de conversaciones
└── images/              # Imágenes generadas con Stable Diffusion
```

### Esquema de la base de datos

**Tabla `conversations`**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | TEXT (UUID) | Identificador único |
| `title` | TEXT | Título autogenerado |
| `created_at` | DATETIME | Fecha de creación |
| `updated_at` | DATETIME | Última actualización |
| `model` | TEXT | Modelo usado |

**Tabla `messages`**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | TEXT (UUID) | Identificador único |
| `conversation_id` | TEXT (FK) | Referencia a la conversación |
| `role` | TEXT | `user` o `assistant` |
| `content` | TEXT | Contenido del mensaje |
| `created_at` | DATETIME | Timestamp del mensaje |
| `metadata` | JSON | Archivos adjuntos, fuentes web, etc. |

---

## 7. Temas visuales

### Pyramid (predeterminado)
Inspirado en el Antiguo Egipto. Tonos dorados, púrpuras profundos y arena.

```css
--color-primary:     #c9a84c;   /* Dorado */
--color-secondary:   #7b2d8b;   /* Púrpura */
--color-background:  #1a1a2e;   /* Azul noche */
--color-surface:     #16213e;   /* Superficie */
--color-text:        #e8e0d0;   /* Arena */
```

### Ocean
Tonos de agua profunda, cyan y azul marino.

```css
--color-primary:     #00b4d8;   /* Cyan claro */
--color-secondary:   #0077b6;   /* Azul océano */
--color-background:  #03045e;   /* Azul noche */
--color-surface:     #023e8a;   /* Superficie */
--color-text:        #caf0f8;   /* Agua clara */
```

### Forest
Verdes naturales, musgo y madera.

```css
--color-primary:     #52b788;   /* Verde hoja */
--color-secondary:   #2d6a4f;   /* Verde oscuro */
--color-background:  #1b2d1e;   /* Bosque noche */
--color-surface:     #1e3a22;   /* Superficie */
--color-text:        #d8f3dc;   /* Verde claro */
```

---

## 8. Modelos de IA soportados

### Modelos de chat (vía Ollama)

| Modelo | Tamaño | RAM mín. | Licencia | Recomendado para |
|--------|--------|----------|----------|-----------------|
| llama3.2:3b | 2.0 GB | 8 GB | Llama Community | Uso diario, equipos con poca RAM |
| llama3.1:8b | 4.7 GB | 12 GB | Llama Community | Calidad general, balanceado |
| mistral:7b | 4.1 GB | 10 GB | Apache 2.0 | Código y análisis técnico |
| phi3:mini | 2.3 GB | 8 GB | MIT | Respuestas rápidas |
| llava:7b | 4.5 GB | 12 GB | Llama Community | Análisis de imágenes (multimodal) |

### Modelo de generación de imágenes

| Modelo | Tamaño | RAM GPU | Velocidad en M4 |
|--------|--------|---------|-----------------|
| SDXL-Turbo | 6.9 GB | 8 GB VRAM / MPS | ~8 segundos/imagen |

---

## 9. Criterios de aceptación por versión

### v0.1.0-alpha
- [ ] La app inicia y conecta con Ollama sin intervención del usuario
- [ ] Se puede tener una conversación completa con streaming funcional
- [ ] El historial se guarda y puede recuperarse entre reinicios
- [ ] El onboarding guía correctamente al usuario desde cero

### v1.0.0 (estable)
- [ ] Todas las funcionalidades del roadmap implementadas y probadas
- [ ] Instaladores disponibles para los 3 sistemas operativos
- [ ] Sin errores críticos conocidos
- [ ] Documentación completa y actualizada
