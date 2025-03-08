import { useScript } from "./utils/useScript";

export function GlobalScripts() {
    // Load ad-blocker detection script
    useScript({
      src: `/scripts/adblocker-detection.js?${Date.now()}`,
      options: {
        attributes: { 
          'data-cfasync': 'false',
          'type': 'text/javascript'
        }
      }
    });
  
    // Load monetag script
    useScript({
      src: `/scripts/monetag-script.js?${Date.now()}`,
      options: {
        attributes: { 
          'type': 'text/javascript'
        }
      }
    });
  
    return null;
  }