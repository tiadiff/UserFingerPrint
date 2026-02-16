// 1. Fallback hash function (DJB2 variant) for insecure contexts
const simpleHash = (str: string): string => {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
};

// 2. Robust SHA-256 implementation
const sha256 = async (message: string): Promise<string> => {
  const hasCrypto = 
    typeof window !== 'undefined' && 
    window.crypto && 
    window.crypto.subtle;

  if (hasCrypto) {
    try {
      const msgBuffer = new TextEncoder().encode(message);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      console.warn("Secure crypto failed, using fallback.");
    }
  }
  return simpleHash(message);
};

// Normalize GPU strings to match across browsers (e.g. remove "ANGLE" prefix in Chrome)
const normalizeGpuString = (str: string): string => {
  if (!str) return 'unknown_gpu';
  // Remove common browser wrappers like "ANGLE (" or "Direct3D" to find the core GPU name
  let clean = str.toLowerCase();
  // Strip ANGLE, Direct3D, OpenGL engine versions, parentheses
  clean = clean.replace(/angle/g, '').replace(/direct3d/g, '').replace(/opengl/g, '');
  clean = clean.replace(/[()]/g, '');
  // Remove version numbers that might change with driver updates slightly
  // clean = clean.replace(/\d+\.\d+\.\d+/g, ''); 
  return clean.trim();
};

export interface FingerprintResult {
  screen: {
    width: number;
    height: number;
    colorDepth: number;
    pixelDepth: number;
    devicePixelRatio: number; // Be careful, zoom level changes this
  };
  webgl: {
    vendor: string;
    renderer: string;
    unmaskedVendor: string;
    unmaskedRenderer: string;
  };
  hardware: {
    concurrency: number;
    memory: number | string; // memory is optional in TS for navigator
    platform: string;
    timezone: string;
  };
}

// Master Aggregator - FOCUSED ON HARDWARE STABILITY
export const generateVisitorId = async (data: FingerprintResult): Promise<string> => {
  
  // CRITICAL: We only use signals that rely on PHYSICAL HARDWARE
  // We strictly exclude:
  // - Canvas Pixels (Rendering engine varies: Skia vs Gecko)
  // - Audio Buffers (Compression algorithms vary)
  // - Installed Fonts (Browsers hide these differently)
  
  const hardwareComponents = [
    // 1. Screen Physics (Monitor doesn't change between browsers)
    // We use screen.width/height (full monitor resolution), NOT window.inner...
    `${data.screen.width}x${data.screen.height}`,
    data.screen.colorDepth,
    
    // 2. GPU Hardware (Normalized)
    // This is the strongest cross-browser signal if we strip the prefixes
    normalizeGpuString(data.webgl.unmaskedVendor),
    normalizeGpuString(data.webgl.unmaskedRenderer),
    
    // 3. CPU / OS Core
    data.hardware.concurrency, // CPU Cores
    data.hardware.platform,    // OS (Win32, MacIntel...)
    data.hardware.timezone,    // Timezone 
    
    // 4. Memory (Round to nearest bucket if needed, but raw is okay for now)
    // Note: Firefox often hides deviceMemory, so we treat 'undefined' as a consistent 'N/A'
    data.hardware.memory || 'mem_na' 
  ];

  const fingerprintString = hardwareComponents.join('|||');
  
  // Debug log to see what makes up the key
  console.log("Hardware Fingerprint Construction:", fingerprintString);

  return await sha256(fingerprintString);
};

// 1. Screen Fingerprinting (New)
export const getScreenFingerprint = async () => {
  return {
    width: window.screen.width,
    height: window.screen.height,
    colorDepth: window.screen.colorDepth,
    pixelDepth: window.screen.pixelDepth,
    devicePixelRatio: window.devicePixelRatio || 1
  };
};

// 2. WebGL Fingerprinting (Hardware Strings Only)
export const getWebGLFingerprint = async () => {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    let unmaskedVendor = 'Unknown';
    let unmaskedRenderer = 'Unknown';
    
    if (gl instanceof WebGLRenderingContext) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        unmaskedVendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
        unmaskedRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      }
      
      return {
        vendor: gl.getParameter(gl.VENDOR) || '',
        renderer: gl.getParameter(gl.RENDERER) || '',
        unmaskedVendor: unmaskedVendor || '',
        unmaskedRenderer: unmaskedRenderer || ''
      };
    }
  } catch (e) {
    console.warn("WebGL error", e);
  }
  
  return {
    vendor: 'N/A',
    renderer: 'N/A',
    unmaskedVendor: 'N/A',
    unmaskedRenderer: 'N/A'
  };
};

// 3. Basic Hardware Info
export const getHardwareFingerprint = async () => {
  return {
    concurrency: navigator.hardwareConcurrency || 1,
    // @ts-ignore - deviceMemory is experimental but useful in Chrome
    memory: navigator.deviceMemory,
    platform: navigator.platform || 'unknown',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  };
};