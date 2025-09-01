import CryptoJS from 'crypto-js';

// Thu thập thông tin WebGL (cố định theo thiết bị)
function getWebGLFingerprint() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) return null;
    
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) return null;
    
    return {
      vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
      renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL),
      version: gl.getParameter(gl.VERSION),
      shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
      maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
      maxViewportDims: gl.getParameter(gl.MAX_VIEWPORT_DIMS),
      maxRenderbufferSize: gl.getParameter(gl.MAX_RENDERBUFFER_SIZE)
    };
  } catch (e) {
    return null;
  }
}

// Thu thập thông tin Canvas (cố định theo thiết bị)
function getCanvasFingerprint() {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Vẽ text với font đặc biệt
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Fingerprint Canvas 🎨', 2, 2);
    
    // Vẽ hình học
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillRect(100, 5, 80, 20);
    ctx.strokeStyle = 'rgba(204, 0, 0, 0.7)';
    ctx.strokeRect(100, 5, 80, 20);
    
    // Vẽ đường cong
    ctx.beginPath();
    ctx.moveTo(20, 20);
    ctx.lineTo(80, 20);
    ctx.lineTo(50, 40);
    ctx.closePath();
    ctx.fillStyle = 'rgba(0, 0, 204, 0.7)';
    ctx.fill();
    
    return canvas.toDataURL();
  } catch (e) {
    return null;
  }
}

// Thu thập thông tin Audio (cố định theo thiết bị)
function getAudioFingerprint() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const analyser = audioContext.createAnalyser();
    const gainNode = audioContext.createGain();
    const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);
    
    gainNode.gain.value = 0; // Không phát âm thanh
    oscillator.type = 'triangle';
    
    oscillator.connect(analyser);
    analyser.connect(scriptProcessor);
    scriptProcessor.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 10000;
    
    const audioData = new Float32Array(analyser.frequencyBinCount);
    analyser.getFloatFrequencyData(audioData);
    
    return {
      sampleRate: audioContext.sampleRate,
      channelCount: audioContext.destination.channelCount,
      maxChannelCount: audioContext.destination.maxChannelCount
      // Bỏ frequencyData vì có thể thay đổi
    };
  } catch (e) {
    return null;
  }
}

// Thu thập thông tin Client Rects (cố định theo thiết bị)
function getClientRectsFingerprint() {
  try {
    const element = document.createElement('div');
    element.style.width = '100px';
    element.style.height = '100px';
    element.style.position = 'absolute';
    element.style.top = '-9999px';
    element.style.left = '-9999px';
    
    document.body.appendChild(element);
    const rects = element.getClientRects();
    document.body.removeChild(element);
    
    return {
      length: rects.length,
      rects: Array.from(rects).map(rect => ({
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height
      }))
    };
  } catch (e) {
    return null;
  }
}

// Thu thập thông tin Platform (chỉ giữ phần cố định)
function getPlatformFingerprint() {
  return {
    // Bỏ userAgent vì có thể thay đổi khi update browser
    platform: navigator.platform,
    language: navigator.language,
    languages: navigator.languages,
    cookieEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack,
    hardwareConcurrency: navigator.hardwareConcurrency, // Cố định theo CPU
    maxTouchPoints: navigator.maxTouchPoints, // Cố định theo thiết bị
    vendor: navigator.vendor,
    product: navigator.product,
    productSub: navigator.productSub,
    vendorSub: navigator.vendorSub,
    buildID: navigator.buildID,
    oscpu: navigator.oscpu,
    deviceMemory: navigator.deviceMemory // Cố định theo RAM
    // Bỏ connection vì thay đổi theo mạng
  };
}

// Thu thập thông tin Screen (cố định theo thiết bị)
function getScreenFingerprint() {
  return {
    width: screen.width,
    height: screen.height,
    availWidth: screen.availWidth,
    availHeight: screen.availHeight,
    colorDepth: screen.colorDepth,
    pixelDepth: screen.pixelDepth,
    orientation: screen.orientation ? {
      type: screen.orientation.type,
      angle: screen.orientation.angle
    } : null
  };
}

// Thu thập thông tin Timezone (cố định theo vị trí)
function getTimezoneFingerprint() {
  return {
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timezoneOffset: new Date().getTimezoneOffset()
    // Bỏ dateTimeFormat vì có thể thay đổi
  };
}

// Thu thập thông tin Fonts (cố định theo hệ thống)
function getFontsFingerprint() {
  const testString = 'mmmmmmmmmmlli';
  const testSize = '72px';
  const h = document.getElementsByTagName('body')[0];
  
  const s = document.createElement('span');
  s.style.fontSize = testSize;
  s.innerHTML = testString;
  h.appendChild(s);
  
  const defaultWidth = s.offsetWidth;
  const defaultHeight = s.offsetHeight;
  
  const fonts = [
    'Arial', 'Verdana', 'Helvetica', 'Times New Roman', 'Courier New',
    'Georgia', 'Palatino', 'Garamond', 'Bookman', 'Comic Sans MS',
    'Trebuchet MS', 'Arial Black', 'Impact', 'Lucida Console',
    'Tahoma', 'Geneva', 'Lucida Sans Unicode', 'Franklin Gothic Medium',
    'Arial Narrow', 'Calibri', 'Cambria', 'Candara', 'Consolas',
    'Constantia', 'Corbel', 'Segoe UI', 'Segoe Print', 'Segoe Script'
  ];
  
  const detectedFonts = [];
  
  fonts.forEach(font => {
    s.style.fontFamily = font;
    if (s.offsetWidth !== defaultWidth || s.offsetHeight !== defaultHeight) {
      detectedFonts.push(font);
    }
  });
  
  h.removeChild(s);
  
  return detectedFonts;
}

// Thu thập thông tin Hardware (cố định theo thiết bị)
function getHardwareFingerprint() {
  return {
    // CPU cores
    cores: navigator.hardwareConcurrency,
    
    // Memory
    memory: navigator.deviceMemory,
    
    // Touch support
    touchSupport: navigator.maxTouchPoints,
    
    // Battery (nếu có)
    battery: navigator.getBattery ? 'supported' : 'not_supported',
    
    // Connection (chỉ giữ type cố định)
    connection: navigator.connection ? {
      effectiveType: navigator.connection.effectiveType,
      downlink: navigator.connection.downlink,
      rtt: navigator.connection.rtt
    } : null
  };
}

// Thu thập thông tin Browser (chỉ giữ phần cố định)
function getBrowserFingerprint() {
  return {
    // Chỉ giữ các thuộc tính cố định
    cookieEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine,
    javaEnabled: navigator.javaEnabled ? navigator.javaEnabled() : false,
    
    // Bỏ các thuộc tính có thể thay đổi
    // userAgent, appVersion, appName, appCodeName
  };
}

// Tạo fingerprint hoàn chỉnh (chỉ giữ thuộc tính cố định)
export function generateFingerprint() {
  const fingerprint = {
    webgl: getWebGLFingerprint(),
    canvas: getCanvasFingerprint(),
    audio: getAudioFingerprint(),
    clientRects: getClientRectsFingerprint(),
    platform: getPlatformFingerprint(),
    screen: getScreenFingerprint(),
    timezone: getTimezoneFingerprint(),
    fonts: getFontsFingerprint(),
    hardware: getHardwareFingerprint(),
    browser: getBrowserFingerprint()
    // Bỏ timestamp và random vì thay đổi mỗi lần
    // Bỏ các thuộc tính liên quan đến session, cache, storage
  };
  
  return fingerprint;
}

// Tạo hash từ fingerprint với secret key
export function hashFingerprint(fingerprint, secretKey) {
  try {
    // Chuyển fingerprint thành string
    const fingerprintString = JSON.stringify(fingerprint);
    
    // Tạo hash với HMAC-SHA256
    const hash = CryptoJS.HmacSHA256(fingerprintString, secretKey);
    
    return hash.toString();
  } catch (error) {
    console.error('Error hashing fingerprint:', error);
    return null;
  }
}

// Tạo fingerprint và hash
export function createSecureFingerprint(secretKey) {
  const fingerprint = generateFingerprint();
  const hash = hashFingerprint(fingerprint, secretKey);
  
  return {
    fingerprint,
    hash,
    timestamp: Date.now() // Timestamp chỉ để tracking, không dùng trong fingerprint
  };
}

// Kiểm tra fingerprint có hợp lệ không
export function validateFingerprint(fingerprint, hash, secretKey) {
  const expectedHash = hashFingerprint(fingerprint, secretKey);
  return expectedHash === hash;
}

// Tạo fingerprint ổn định (loại bỏ các yếu tố có thể thay đổi)
export function generateStableFingerprint() {
  const fingerprint = generateFingerprint();
  
  // Loại bỏ các thuộc tính có thể thay đổi giữa các session
  const stableFingerprint = {
    webgl: fingerprint.webgl,
    canvas: fingerprint.canvas,
    audio: fingerprint.audio,
    clientRects: fingerprint.clientRects,
    platform: fingerprint.platform,
    screen: fingerprint.screen,
    timezone: fingerprint.timezone,
    fonts: fingerprint.fonts,
    hardware: fingerprint.hardware,
    browser: fingerprint.browser
  };
  
  return stableFingerprint;
}
