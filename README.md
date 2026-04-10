# Meeting Agent

Sistema automatizado para **acceder a reuniones virtuales** en **Microsoft Teams** y **Google Meet** mediante navegación controlada con **Playwright**, con **captura de audio** (**ffmpeg**), **grabación de vídeo de la sesión del navegador** y **generación de transcripciones** a partir del audio grabado.

---

## Resumen técnico

El flujo principal es el siguiente:

1. **`agent.js`** recibe una o más URL de reuniones.
2. Por cada URL se invoca **`startMeetingBot`** (`meetingBot.js`), que lanza **Chromium** con Playwright.
3. Según el dominio o ruta de la URL se ejecuta la rutina correspondiente:
   - **`platforms/teams.js`**: unión a reuniones de Microsoft Teams.
   - **`platforms/meet.js`**: unión a reuniones de Google Meet.
4. Se inicia la **grabación de audio** (`audioRecorder.js` → **ffmpeg**) y la **grabación de vídeo del contexto del navegador** (API `recordVideo` de Playwright, configurada en `videoRecorder.js`).
5. Al recibir **SIGINT** o **SIGTERM** (por ejemplo, **Ctrl+C**), el proceso **cierra los navegadores**, **detiene ffmpeg** y, para cada reunión con archivo de audio válido, ejecuta la **transcripción** (`transcriber.js`).

Los artefactos se organizan bajo **`recordings/<meetingId>/`** (por ejemplo, `meeting1`, `meeting2`).

---

## Funcionalidades principales

- **Microsoft Teams**: detección de diálogos de continuación, nombre de participante por defecto (`Zion Bot`) y acciones de unión, con **esperas y tiempos de espera ampliados** para adaptarse a redes lentas o cambios menores de interfaz.
- **Google Meet**: **inicio de sesión opcional** mediante variables de entorno; nombre de participante y unión a la reunión cuando la interfaz lo permite.
- **Grabación de audio**: un archivo **`.wav`** (mono, 16 kHz) por reunión, generado con **ffmpeg** desde un dispositivo de captura configurado para el entorno (véase *Requisitos*).
- **Grabación de vídeo**: vídeo **`.webm`** producido por Playwright al cerrar el contexto o el navegador (resolución configurada, por defecto **1280×720**).
- **Transcripción del audio**:
  - Con **`OPENAI_API_KEY`**: API **OpenAI**, modelo **`whisper-1`**, idioma español.
  - Sin clave: modelo local **`Xenova/whisper-small`** mediante **`@xenova/transformers`** (cuantizado), con procesamiento por fragmentos.
- **Salidas de transcripción**: para cada reunión, **`*.transcript.txt`** y **`*.transcript.json`** (metadatos, motor utilizado y texto).

---

## Stack y tecnologías

| Ámbito | Tecnología |
|--------|------------|
| Entorno de ejecución | **Node.js** (≥ 18) |
| Automatización web | **Playwright**, motor **Chromium** |
| Gestión de dependencias | **npm** |
| Variables de entorno | **dotenv** |
| Audio / vídeo | **ffmpeg**; **PulseAudio** (dispositivo `*.monitor`) en la configuración actual de audio |
| Transcripción en la nube | **OpenAI API** (Whisper) |
| Transcripción local | **@xenova/transformers**, modelo **Whisper** vía Hugging Face / ONNX |
| Lenguaje | **JavaScript** (CommonJS, `require`) |

---

## Actualizaciones recientes del repositorio

- **Grabación de vídeo y transcripción textual**: integración de Playwright `recordVideo` y flujo de transcripción al finalizar la sesión (audio → texto).
- **Estructura de almacenamiento**: directorio **`recordings/`** por identificador de reunión, unificando audio, vídeo y transcripciones.
- **Grabación de audio por reunión** y soporte para **varias reuniones en paralelo** desde la línea de comandos.
- **Ajustes de acceso y tiempos de espera**: esperas más tolerantes en Teams y Meet para mejorar la fiabilidad ante latencia o variaciones de la interfaz.
- **Definición formal del proyecto**: **`package.json`** con scripts (`npm start`), dependencias declaradas y restricción de versión de Node.

---

## Requisitos previos

- **Node.js** 18 o superior.
- **npm**.
- **Playwright** y navegadores instalados según la documentación del proyecto (`npx playwright install`).
- **ffmpeg** disponible en el **`PATH`** del sistema.
- Para la **captura de audio** con el comando actual (`-f pulse`), un entorno típico es **Linux con PulseAudio**, donde exista un dispositivo **`<meetingId>.monitor`**. En **Windows** o **macOS** será necesario **adaptar** en `audioRecorder.js` el formato (`-f`) y el dispositivo de entrada (`-i`) al sistema de audio correspondiente.
- Para transcripción con OpenAI: una **clave de API** válida en **`OPENAI_API_KEY`**. En su ausencia se usa el **modelo local** (primera ejecución puede incluir la descarga del modelo).

---

## Instalación

1. **Clonar el repositorio**

```bash
git clone <URL_DEL_REPOSITORIO>
cd ProyectoEstadia
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Instalar los navegadores de Playwright**

```bash
npx playwright install
```

4. **Instalar ffmpeg**

- **Windows**: instalación desde el sitio oficial de FFmpeg y inclusión del ejecutable en el `PATH`.
- **Linux** (ejemplo): `sudo apt install ffmpeg` (y configuración de PulseAudio según el entorno).
- **macOS** (ejemplo): `brew install ffmpeg`.

---

## Configuración

Cree un archivo **`.env`** en la raíz del proyecto.

### Google Meet (opcional)

| Variable | Descripción |
|----------|-------------|
| `MEET_EMAIL` | Cuenta de Google para iniciar sesión cuando la interfaz lo requiera. |
| `MEET_PASSWORD` | Contraseña asociada. |

Si no se definen, el flujo intentará continuar **sin inicio de sesión explícito** (reuniones abiertas o sesión ya establecida en el navegador).

### Transcripción con OpenAI (opcional)

| Variable | Descripción |
|----------|-------------|
| `OPENAI_API_KEY` | Si está presente, la transcripción utiliza el modelo **Whisper** de OpenAI. |

Ejemplo de **`.env`**:

```env
MEET_EMAIL=tu_correo@gmail.com
MEET_PASSWORD=contraseña_segura
OPENAI_API_KEY=sk-...
```

---

## Uso

Punto de entrada: **`agent.js`**. También puede ejecutarse mediante:

```bash
npm start -- <url1> <url2> ...
```

o, equivalentemente:

```bash
node agent.js <url1> <url2> ...
```

**Ejemplos:**

```bash
node agent.js "https://teams.microsoft.com/l/meetup-join/..."
```

```bash
node agent.js "https://meet.google.com/xxx-yyyy-zzz"
```

```bash
node agent.js "https://teams.microsoft.com/..." "https://meet.google.com/xxx-yyyy-zzz"
```

**Finalización recomendada:** **Ctrl+C** en la terminal donde corre el agente, para que se ejecuten el cierre ordenado del navegador, la detención de **ffmpeg** y la transcripción.

---

## Estructura del proyecto

| Ruta | Rol |
|------|-----|
| **`agent.js`** | Argumentos de línea de comandos, registro de sesiones y apagado ante señales del sistema; invoca la transcripción al cerrar. |
| **`meetingBot.js`** | Lanzamiento de Chromium, contexto con permisos de micrófono y cámara, `recordVideo`, enrutamiento a Teams o Meet, inicio de grabación de audio. |
| **`audioRecorder.js`** | Ejecución de **ffmpeg** y generación del **`.wav`** por reunión. |
| **`videoRecorder.js`** | Carpeta raíz **`recordings/`**, creación de directorios por **`meetingId`** y opciones de vídeo para Playwright. |
| **`transcriber.js`** | Transcripción del **`.wav`** (OpenAI o Xenova); escritura de **`.transcript.txt`** y **`.transcript.json`**. |
| **`platforms/teams.js`** | Automatización de unión en **Microsoft Teams**. |
| **`platforms/meet.js`** | Automatización de unión en **Google Meet** (login condicional). |

---

## Salidas por reunión (ejemplo)

Para `meeting1`, bajo **`recordings/meeting1/`** se esperan, según el entorno y el cierre correcto de la sesión:

- **`meeting1.wav`**: audio.
- Archivo(s) **`.webm`**: vídeo generado por Playwright en la misma carpeta.
- **`meeting1.transcript.txt`** y **`meeting1.transcript.json`**: resultado de la transcripción.

---

## Limitaciones conocidas

- **Dependencia de la interfaz de Teams y Meet**: cambios sustanciales en la web pueden requerir actualizar selectores y lógica de espera.
- **Captura de audio**: el comando **ffmpeg** actual está orientado a **PulseAudio en Linux**; otros sistemas exigen adaptación.
- **Seguridad de credenciales**: almacenar contraseñas en **`.env`** implica proteger ese archivo y no versionarlo en el repositorio (manténgalo en **`.gitignore`**).
- **Calidad de la transcripción**: depende de la calidad del audio, del motor elegido (API vs. local) y de la duración del archivo.

---

## Contribución

1. Realice un *fork* del repositorio.
2. Cree una rama para su propuesta de cambio:

```bash
git checkout -b feature/descripcion-del-cambio
```

3. Envíe sus *commits* y abra un *pull request* describiendo el alcance y las pruebas realizadas.

---


