## Meeting Agent

Bot automático para unirse a reuniones de **Microsoft Teams** y **Google Meet** usando **Playwright**, y grabar el audio de cada reunión con **ffmpeg**.

El flujo básico es:

- **`agent.js`** recibe una o varias URLs de reuniones.
- Por cada URL levanta un **navegador Chromium controlado por Playwright**.
- Según la URL, llama a:
  - **`platforms/teams.js`** para entrar a una reunión de Microsoft Teams.
  - **`platforms/meet.js`** para entrar a una reunión de Google Meet.
- Una vez dentro, inicia una **grabación de audio** mediante **`audioRecorder.js`** y `ffmpeg`, generando un archivo `.wav` por reunión.

---

## Funcionalidades principales

- **Ingreso automático a reuniones de Teams**
  - Detecta botones de *Continuar / usar este navegador*.
  - Intenta rellenar el nombre del participante (por defecto: `Zion Bot`).
  - Busca y pulsa el botón de *Unirse / Join*.

- **Ingreso automático a reuniones de Google Meet**
  - Soporta **login opcional** con correo y contraseña de Google (usando variables de entorno).
  - Intenta rellenar el nombre del participante (`Zion Bot`) si la UI lo pide.
  - Busca y pulsa el botón de *Unirse / Join*.

- **Grabación de audio por reunión**
  - Cada reunión se graba en un archivo distinto: `meeting1.wav`, `meeting2.wav`, etc.
  - Usa `ffmpeg` para capturar audio desde un dispositivo tipo `meetingX.monitor`.

---

## Requisitos

- **Node.js** 18 o superior (recomendado).
- **npm** o **yarn** para instalar dependencias.
- **Playwright** con soporte para Chromium.
- **ffmpeg** instalado y disponible en el `PATH`.
- **(Actualmente)** el grabador está pensado para un entorno con **PulseAudio** (por ejemplo, Linux):
  - `audioRecorder.js` usa el formato `-f pulse -i <meetingId>.monitor`.
  - En Windows o macOS será necesario adaptar el comando de `ffmpeg` al dispositivo de audio correspondiente.

---

## Instalación

1. **Clonar el repositorio**

```bash
git clone <URL_DEL_REPO>
cd ProyectoEstadia
```

2. **Instalar dependencias de Node**

> Nota: No hay un `package.json` incluido aún, pero el proyecto utiliza al menos estas dependencias:

- `playwright`
- `dotenv`

Un ejemplo de instalación mínima sería:

```bash
npm init -y
npm install playwright dotenv
```

3. **Instalar Playwright browsers (si es necesario)**

```bash
npx playwright install
```

4. **Instalar ffmpeg**

- En Windows: instalar desde el sitio oficial y agregar `ffmpeg.exe` al `PATH`.
- En Linux: por ejemplo `sudo apt install ffmpeg`.
- En macOS: `brew install ffmpeg`.

---

## Configuración

Crear un archivo `.env` en la raíz del proyecto para configurar credenciales de Google Meet (opcional) y otras variables futuras.

Variables usadas actualmente:

- **`MEET_EMAIL`**: correo de la cuenta de Google para Meet.
- **`MEET_PASSWORD`**: contraseña de la cuenta.

Ejemplo de `.env`:

```env
MEET_EMAIL=tu_correo@gmail.com
MEET_PASSWORD=tu_password_segura
```

Si **no** defines estas variables, el bot intentará entrar a la reunión de Meet **sin iniciar sesión**, lo que puede funcionar en reuniones públicas o si ya existe una sesión abierta en el navegador.

---

## Uso

El punto de entrada del proyecto es `agent.js`.

### Ejecutar el bot con una o varias reuniones

```bash
node agent.js <url1> <url2> ...
```

Ejemplos:

```bash
node agent.js "https://teams.microsoft.com/l/meetup-join/..." 
```

```bash
node agent.js "https://meet.google.com/xxx-yyyy-zzz"
```

```bash
node agent.js "https://teams.microsoft.com/..." "https://meet.google.com/xxx-yyyy-zzz"
```

Por cada URL:

- Se abre un navegador Chromium controlado por Playwright.
- Se ejecuta la rutina de ingreso específica de la plataforma.
- Se lanza la grabación de audio asociada con un ID de reunión:
  - `meeting1` → `meeting1.wav`
  - `meeting2` → `meeting2.wav`

Los archivos `.wav` se guardan en la carpeta raíz del proyecto (o donde se ejecute el comando).

---

## Estructura del proyecto

Resumen de los archivos más importantes:

- **`agent.js`**
  - Procesa los argumentos de línea de comandos (URLs).
  - Llama a `startMeetingBot` para cada URL con un `meetingId` incremental.

- **`meetingBot.js`**
  - Configura y lanza Chromium con Playwright.
  - Decide si llamar a `joinTeams` o `joinMeet` según el contenido de la URL.
  - Inicia la grabación de audio con `startRecording(meetingId)`.

- **`audioRecorder.js`**
  - Ejecuta `ffmpeg` como proceso hijo.
  - Graba audio desde un dispositivo tipo `<meetingId>.monitor`.
  - Genera un archivo `<meetingId>.wav`.

- **`platforms/teams.js`**
  - Contiene la lógica de automatización para entrar a reuniones de Microsoft Teams.
  - Usa selectores robustos (por texto y atributos) e `await` con timeouts amplios para adaptarse a cambios de UI y conexiones lentas.

- **`platforms/meet.js`**
  - Contiene la lógica de login opcional a Google (usando `.env`).
  - Automatiza la entrada a la reunión de Google Meet y el join.

---

## Limitaciones actuales

- **Dependencia de la UI de las plataformas**
  - Si Microsoft Teams o Google Meet cambian sus selectores o textos de botones, puede que el bot ya no encuentre los elementos.

- **Grabación de audio ligada a PulseAudio**
  - El comando `ffmpeg` actual está orientado a Linux + PulseAudio.  
  - En Windows/macOS hay que adaptar el parámetro `-f` y el dispositivo (`-i`) al sistema de audio correspondiente.

- **Sin manejo avanzado de errores**
  - Actualmente la lógica se basa en logs por consola y timeouts; no hay reintentos complejos ni notificaciones externas.

---

## Ideas de mejoras futuras

- Agregar un `package.json` formal con scripts de:
  - `npm run start` (para ejecutar el bot).
  - `npm run lint` / `npm test`, etc.
- Hacer configurable:
  - El nombre del bot (en lugar de `Zion Bot` fijo).
  - Tiempo máximo de duración de la grabación por reunión.
- Crear una interfaz (CLI o web) para:
  - Agendar reuniones y lanzar el bot automáticamente a ciertas horas.
  - Ver el estado de cada reunión y grabación.

---

## Contribuir

1. Haz un fork del repositorio.
2. Crea una rama con tu cambio:

```bash
git checkout -b feature/mi-mejora
```

3. Haz tus commits y abre un Pull Request.

---

## Licencia

Define aquí la licencia del proyecto (por ejemplo, MIT, Apache 2.0, privada, etc.).

