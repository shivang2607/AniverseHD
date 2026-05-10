import React, { useState } from 'react';
import { IoChevronDown, IoCheckmark } from 'react-icons/io5';
import Link from 'next/link';
import useStreamStore from '@/components/utils/streamStore';
import { usePathname, useSearchParams } from 'next/navigation';

const ProviderSelect = () => {
  const searchParams = useSearchParams();
  const provider = searchParams.get("provider") || "megaplay";
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  
  // Example providers - replace with your actual providers
  const providers = [
    { id: "megaplay", name: "Provider-M", displayName: "MegaPlay Provider" },
    { id: "hnembed", name: "Provider-H", displayName: "HNEmbed Provider" },
    // { id: "animepahe", name: "Provider-A", displayName: "Animepahe Provider" },
    // { id: "zoro", name: "Provider-Z", displayName: "Zoro Provider" },
    // { id: "aniwatch", name: "Provider-A", displayName: "AniWatch Provider" },
    // { id: "gogoanime", name: "Provider-G", displayName: "GogoAnime Provider" },
    // { id: "9anime", name: "Provider-9", displayName: "9Anime Provider" },
    // { id: "crunchyroll", name: "Provider-C", displayName: "Crunchyroll Provider" }
  ];
  
  const updateParams = (paramsList, resetT = true) => {
    const newParams = new URLSearchParams(searchParams); 
    if(resetT) newParams.delete("t");
    paramsList.forEach(par => {
      newParams.set(par.key, par.val ? par.val : '');
    });

    return pathname + '?' + newParams.toString();
  }

  const currentProvider = providers.find(p => p.id === provider) || providers[0];

  const handleProviderSelect = () => {
    setIsOpen(false);
    // Add any additional logic here if needed
  };

  return (
    <div className="relative self-center">
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-gray-200 text-lg font-semibold p-1 px-2 rounded-md bg-primary-100 hover:bg-primary-200 transition-colors"
      >
        <span>{currentProvider.name}</span>
        <IoChevronDown 
          size={16} 
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop to close dropdown when clicking outside */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          <div className="absolute top-full left-0 mt-1 bg-gray-800 border border-gray-600 rounded-md shadow-lg z-20 min-w-full whitespace-nowrap">
            {providers.map((providerItem) => (
              <Link
                key={providerItem.id}
                href={updateParams([
                  { key: "provider", val: providerItem.id },
                  { key: "server", val: '' }
                ], false)}
                scroll={false}
                className="flex items-center justify-between px-3 py-2 text-gray-200 hover:bg-gray-700 transition-colors first:rounded-t-md last:rounded-b-md"
                onClick={() => handleProviderSelect()}
              >
                <span className="text-sm font-medium">
                  {providerItem.displayName}
                </span>
                {provider === providerItem.id && (
                  <IoCheckmark size={16} className="text-green-400" />
                )}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ProviderSelect;