# PrivacyPrint Inspector

PrivacyPrint Inspector is a hardware-based identity protocol designed to generate a persistent visitor ID based on physical hardware characteristics rather than browser-stored data.

## How it Works

The program generates a unique **Hardware Fingerprint** by analyzing and normalizing signals directly from your physical components. Unlike traditional tracking methods, this system focuses on **Hardware Stability**.

### Core Identification Signals
- **Display Physics:** Screen resolution and color depth (Monitor-specific).
- **GPU Silicon ID:** Normalized WebGL renderer and vendor strings.
- **CPU Architecture:** Hardware concurrency (core count) and platform info.
- **System Environment:** Timezone and device memory.

### Hardware Normalization
We implement a normalization layer for GPU strings (e.g., stripping browser-specific prefixes like "ANGLE" or "Direct3D"). This ensures that the generated ID remains consistent even when accessed via different rendering engines or browsers.

## Persistence Features

The generated ID is designed to be extremely resilient:

- **Incognito / Private Mode:** The ID remains the same because it relies on hardware signals that browsers cannot hide or spoof easily in private modes.
- **Cleared Cookies / LocalStorage:** Since no data is stored in the browser's storage for identification, clearing your cache, cookies, or LocalStorage will **not** change your ID.
- **Cross-Browser Consistency:** You can switch from **Chrome to Firefox** (or any other browser) on the same machine, and the ID will remain identical thanks to our hardware normalization logic.

### When does the ID change?
The identity hash will only change if:
1. You physically change your **Hardware** (e.g., a new monitor, a new graphics card).
2. You perform a major **Driver Update** that drastically changes how the hardware identifies itself to the OS.

---

## Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (Latest LTS recommended)

### Getting Started

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Run the Development Server:**
   ```bash
   npm run dev
   ```

3. **Access the Inspector:**
   Open your browser to the URL provided by the terminal (usually `http://localhost:5173`).

---

## Technical Details

The project utilizes a custom `generateVisitorId` utility that aggregates hardware signals and processes them through a robust SHA-256 hashing algorithm (with a DJB2 fallback for insecure contexts).

- **Source Code:** [fingerprinting.ts](./utils/fingerprinting.ts)
- **App Entry:** [App.tsx](./App.tsx)
