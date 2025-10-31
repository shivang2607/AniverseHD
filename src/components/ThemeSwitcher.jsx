'use client';

import { useState, useEffect, useRef } from 'react';
import { FaChevronDown } from 'react-icons/fa6';


function ColorDisc({ primary = '#57a6a1', cbg = '#041C32', isSelected = false }) {
    return (
      <div className={`flex rounded-full border-2 md:ml-1 ${isSelected ? 'border-blue-500 w-5 h-5' : 'border-gray-300 w-6 h-6'} overflow-hidden shadow-sm transition-all duration-200`}>
        <div className="w-1/2 h-full" style={{ backgroundColor: primary }} />
        <div className="w-1/2 h-full" style={{ backgroundColor: cbg }} />
      </div>
    );
  }
  
  function ThemeDropdown({ themes, selectedTheme, onThemeChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    
    // Find current theme
    const currentTheme = themes.find(t => t.id === selectedTheme) || themes[0];
    
    // Close dropdown when clicking outside
    useEffect(() => {
      function handleClickOutside(event) {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setIsOpen(false);
        }
      }
      
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
  
    return (
      <div className="relative" ref={dropdownRef}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-gray-300 hover:text-primary-200  px-2 rounded-md"
          aria-label="Select theme"
          aria-expanded={isOpen}
        >
          <ColorDisc 
            primary={currentTheme.primary} 
            cbg={currentTheme.cbg} 
            isSelected={true}
          />
          <span className=' md:text-sm  '>Theme</span>
          <FaChevronDown size={12} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isOpen && (
          <div className="absolute mt-2 p-2 bg-cbg-200  rounded-md shadow-lg z-50 w-56 border border-gray-200">
            <p className="text-xs text-gray-200 mb-2 px-2 ">Select a Theme</p>
            <div className="grid grid-cols-4 gap-3">
              {themes.map((theme) => (
                <div 
                  key={theme.id}
                  className={`flex flex-col items-center justify-center p-2 rounded-md cursor-pointer hover:bg-gray-100 transition-colors ${selectedTheme === theme.id ? 'bg-gray-100' : ''}`}
                  onClick={() => {
                    onThemeChange(theme.id);
                    setIsOpen(false);
                  }}
                  title={theme.id}
                  role="option"
                  aria-selected={selectedTheme === theme.id}
                >
                  <ColorDisc 
                    primary={theme.primary} 
                    cbg={theme.cbg} 
                    isSelected={selectedTheme === theme.id}
                  />
                  {selectedTheme === theme.id && (
                    <span className="text-xs mt-1 font-medium text-blue-500">✓</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
  
  

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState('default');
  const [mounted, setMounted] = useState(false);
  
  // Available themes
  const themes = [
    { id: 'Default', name: 'Default', primary: '#57a6a1', cbg:'#041C32' },
    { id: 'DarkOrange', name: 'DarkOrange', primary: '#c2442d', cbg:'#161617' },
    { id: 'DarkPink', name: 'DarkPink', primary: '#d46085', cbg: '#1a1b22' },
    { id: 'DarkPurple', name: 'DarkPurple', primary: '#6f6dc6', cbg: '#1a1b22' },
    { id: 'DarkYellow', name: 'DarkYellow', primary: '#f8d299', cbg: '#1a1b22' },
    { id: 'CalmGreen', name: 'CalmGreen', primary: '#5c8c68', cbg: '#1a1b22' },
    { id: 'TurquoiseDark', name: 'TurquoiseDark', primary: '#50e6c1', cbg: '#1a1b22' },
    { id: 'Purple', name: 'Purple', primary: '#7b5ea6', cbg: '#7b5ea6' }
  ];
  
  // On component mount, set the theme from localStorage
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') || 'Default';
    setTheme(savedTheme);
    
    // Remove all theme classes first
    document.documentElement.classList.remove(themes.map(theme=>{return `theme${theme.name}`}).join(','));
    
    // Add the new theme class
    document.documentElement.classList.add(`theme${savedTheme}`);
  }, []);
  
  // Update theme when changed
  const changeTheme = (newTheme) => {
    // Remove all theme classes first
    document.documentElement.classList.remove(themes.map(theme=>{return `theme${theme.name}`}).join(','));
    
    // Add the new theme class
    document.documentElement.classList.add(`theme${newTheme}`);
    
    setTheme(`theme${newTheme}`);
    localStorage.setItem('theme', newTheme);
    window.location.reload();
  };
  
  // Prevent hydration mismatch
  if (!mounted) return null;
  
  return (
    <div className="relative flex gap-1 py-2 text-gray-300 hover:text-primary-200 hover:bg-primary-100/10 transition-colors">
        {/* <ColorDisc/> */}
        <ThemeDropdown 
        themes={themes} 
        selectedTheme={theme} 
        onThemeChange={changeTheme} 
      />
      {/* <select
        value={theme}
        onChange={(e) => changeTheme(e.target.value)}
        className="bg-cbg-200 text-white p-2 rounded"
      >
        {themes.map((t) => (
          <option key={t.id} value={t.id} className='flex'>
            <ColorDisc primary={t.primary} cbg={t.cbg}/>
          </option>
        ))}
      </select> */}
    </div>
  );
}