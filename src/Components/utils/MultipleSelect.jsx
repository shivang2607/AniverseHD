"use client"
import React, { useState, useEffect, useRef } from 'react';
import { ImCancelCircle } from "react-icons/im";
import { FaChevronRight } from "react-icons/fa";
import toast from 'react-hot-toast';

export default function MultipleSelect({ options, selectedOptions, setSelectedOptions, buttonLabel, showSearchPanel = false }) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchText, setSearchText] = useState('');
    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);

    const filteredOptions = options.filter(option => selectedOptions.every(sel => sel !== option.value) && (option.value.toLowerCase().includes(searchText.toLowerCase())));

    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target) && !buttonRef.current.contains(event.target)) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);


    const handleSelectedOptions = (sel)=>{
        if(selectedOptions.length===1){
            toast.error(`${buttonLabel} cannot be empty!`);
            return;
        }
        setSelectedOptions(selectedOptions.filter(s => s !== sel));
    }

    return (
        <div className='multiple-select flex flex-col gap-1 mb-3 w-full'>
            <button ref={buttonRef} className='flex items-center text-primary-600 px-1 gap-1 text-lg font-semibold tracking-wide' onClick={() => setIsOpen(prev => !prev)}>
                {buttonLabel} <FaChevronRight className={`${isOpen?"rotate-90":"rotate-0"} duration-200 transition-all`}/>
            </button>
            {isOpen && 
                <div ref={dropdownRef} className='absolute my-8 max-h-96 overflow-y-scroll scrollbar-none  self-center text-sm z-10 bg-gray-700 py-4 w-72 rounded-lg p-2'>
                    <div className='flex flex-col py-2 gap-3'>
                        <button className='self-start rounded-lg border-[1.5px] border-fuchsia-300 px-2 text-sm text-fuchsia-300  py-1' onClick={()=>setSelectedOptions(options.map(op=>op.value))}>Select All</button>

                        {showSearchPanel && <input type="text" className='text-primary-300 outline-none rounded-lg px-2 py-1 w-full bg-cbg-300' placeholder="Search" onChange={e=>setSearchText(e.target.value)} />}

                        <div className='flex flex-wrap gap-2 text-xs'>
                            {selectedOptions?.map(sel => (
                                <button
                                    key={sel}
                                    className='rounded-full px-2 py-1 border-2 text-primary-200 border-primary-200 bg-cbg-200 flex gap-1 items-center'
                                    onClick={()=>handleSelectedOptions(sel)}
                                >
                                    {sel} <ImCancelCircle />
                                </button>
                            ))}
                            <br />
                            {filteredOptions?.map(option => (
                                <button
                                    key={option.value}
                                    className='rounded-full px-2 py-1 border-2 text-gray-400 border-gray-400'
                                    onClick={() => setSelectedOptions(option.value)}
                                >
                                    {option.value}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            }
        </div>
    );
}
