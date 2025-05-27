// used to load scripts mainly used for the ads scripts
import { useEffect, useState } from 'react';



export function useScript({ src, options = {} }) {
  const {
    removeOnUnmount = false,
    attributes = {},
    content = '',
  } = options;
  
  const [status, setStatus] = useState(src ? 'loading' : 'idle');

  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    // If no src or content is provided, do nothing
    if (!src && !content) {
      setStatus('idle');
      return;
    }

    // Create script element
    const script = document.createElement('script');
    
    // Add attributes to script element
    Object.entries(attributes).forEach(([key, value]) => {
      script.setAttribute(key, value);
    });

    // For external script
    if (src) {
      script.src = src;
      script.async = true;
      
      // Event handlers to update status
      script.onload = () => {
        setStatus('ready');
      };
      
      script.onerror = () => {
        setStatus('error');
      };
    } 
    // For inline script
    else if (content) {
      script.innerHTML = content;
      setStatus('ready');
    }

    // Add script to document body
    document.body.appendChild(script);

    // Cleanup function that runs when component unmounts
    return () => {
      if (removeOnUnmount) {
        document.body.removeChild(script);
      }
    };
  }, [src, content, attributes, removeOnUnmount]);

  return { status };
}