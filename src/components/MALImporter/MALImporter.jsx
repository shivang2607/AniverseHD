import React, { useState } from 'react';
import { IoClose, IoDownload, IoDocument, IoArrowForward } from 'react-icons/io5';
import { MergeMALData } from './utilFunctions';
import Image from 'next/image';

const MALImporter = ({loggedInUserId}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [animationPhase, setAnimationPhase] = useState(0);

  const handleSubmit = async () => {
    if (!username.trim()) return;
    
    setIsLoading(true);
    setAnimationPhase(1);
    
    // Better timing for animation phases
    setTimeout(() => setAnimationPhase(2), 1000);   // Start file movement
    // setTimeout(() => setAnimationPhase(3), 5200);  // Processing phase
    // setTimeout(() => setAnimationPhase(4), 6000);  // Complete phase
    
    // Call your actual import function here
    try {
      setAnimationPhase(3, 1000);
        await MergeMALData(username, loggedInUserId);
        setAnimationPhase(4);
      // await importMALWatchlist(username);
      // setTimeout(() => {
        setIsLoading(false);
        setAnimationPhase(0);
        setIsModalOpen(false);
        setUsername('');
      // }, 1000);
    } catch (error) {
      console.error('Import failed:', error);
      setIsLoading(false);
      setAnimationPhase(0);
    }
  };

 
  const AnimatedFiles = () => {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated files */}
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="absolute transition-all ease-in-out duration-[2000ms]"
            style={{
              left: '80px', // Fixed starting position
              top: `${35 + i * 6}%`, // Spread files vertically
              transform: animationPhase >= 2 ? 'translateX(240px) scale(0.8)' : 'translateX(0px) scale(1)', // Smooth translation
              opacity: animationPhase >= 2 ? (animationPhase >= 3 ? 0 : 0.8) : 1,
              transitionDelay: `${i * 200}ms`, // Stagger the animation
              zIndex: 30 + i,
            }}
          >
            <div className="relative flex items-center">
              <IoDocument 
                className={`w-6 h-6 transition-colors duration-3000 ${
                  animationPhase >= 2 ? 'text-primary-200' : 'text-sky-500'
                } ${animationPhase >= 2 ? 'animate-bounce' : ''}`}
                style={{
                  animationDuration: '2s',
                  animationDelay: `${i * 100}ms`
                }}
              />
              {/* Motion blur trail effect */}
              {animationPhase >= 2 && (
                <>
                  <div 
                    className="absolute -left-8 top-0 w-8 h-6 opacity-40"
                    style={{ 
                      background: 'linear-gradient(90deg, transparent, rgba(164, 205, 202, 0.4), transparent)',
                      borderRadius: '50%',
                    }}
                  />
                  <div 
                    className="absolute -left-4 top-0 w-4 h-6 opacity-60"
                    style={{ 
                      background: 'linear-gradient(90deg, transparent, rgba(164, 205, 202, 0.6), transparent)',
                      borderRadius: '50%',
                    }}
                  />
                </>
              )}
            </div>
          </div>
        ))}
        
        {/* Connection line during transfer */}
        {animationPhase >= 2 && animationPhase < 4 && (
          <div className="absolute left-24 right-24 top-1/2 transform -translate-y-1/2">
            <div className="relative h-0.5 bg-gradient-to-r from-blue-400 via-primary-200 to-primary-300 opacity-60 animate-pulse">
              <div className="absolute -top-1 left-0 w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
              <div className="absolute -top-1 right-0 w-2 h-2 bg-primary-200 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
            </div>
          </div>
        )}
        
        {/* Floating particles during transfer */}
        {animationPhase >= 2 && animationPhase < 4 && (
          <>
            {[...Array(8)].map((_, i) => (
              <div
                key={`particle-${i}`}
                className="absolute w-1.5 h-1.5 bg-primary-300 rounded-full opacity-70"
                style={{
                  left: `${25 + Math.random() * 50}%`,
                  top: `${30 + Math.random() * 40}%`,
                  animation: `float 3s ease-in-out infinite`,
                  animationDelay: `${i * 300}ms`,
                }}
              />
            ))}
          </>
        )}
        
        {/* Arrow indicating direction */}
        <div className={`absolute left-1/2 top-[45%] transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ${
          animationPhase >= 2 && animationPhase < 4 
            ? 'opacity-100 scale-100' 
            : 'opacity-0 scale-75'
        }`}>
          <div className="relative">
            <IoArrowForward className="w-8 h-8 text-primary-200 animate-pulse" />
            {/* Subtle glow */}
            <div className="absolute inset-0 w-8 h-8 bg-primary-200 opacity-20 rounded-full blur-sm animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* MAL Importer Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 bg-primary-100 hover:bg-primary-200 text-white transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 md:py-2 md:px-3 md:mr-2 py-1.5 px-2.5 mr-2.5 rounded-md w-fit h-fit"
      >
        <IoDownload className="w-5 h-5 flex" />
        MAL Importer
      </button>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-cbg-300 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-cbg-100 border border-cbg-300 rounded-2xl w-full max-w-md mx-auto relative overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-cbg-600">
              <h2 className="text-xl font-bold text-gray-200">Import MAL Watchlist</h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setUsername('');
                  setIsLoading(false);
                  setAnimationPhase(0);
                }}
                className="text-cbg-500 hover:text-gray-200 transition-colors"
                disabled={isLoading}
              >
                <IoClose className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            {/* Animation Container */}
            {isLoading && (
              <div className="absolute inset-0 bg-cbg-100 bg-opacity-98 z-10 flex items-center justify-center">
                <div className="relative w-full h-full">
                  {/* MAL Logo (left side) */}
                  <div className={`absolute left-6 top-1/2 transform -translate-y-1/2 transition-all duration-1000 ${
                    animationPhase >= 3 ? 'scale-90 opacity-70' : 'scale-100 opacity-100'
                  }`}>
                    <div className="relative">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-2xl border-2 border-blue-400">
                        <span className="text-white font-bold text-lg">MAL</span>
                      </div>
                      {/* Pulsing ring effect during active phase */}
                      {animationPhase >= 1 && animationPhase < 3 && (
                        <div className="absolute inset-0 w-20 h-20 border-2 border-blue-300 rounded-xl animate-ping opacity-30"></div>
                      )}
                    </div>
                    <p className="text-xs text-cbg-500 text-center mt-2 font-medium">MyAnimeList</p>
                  </div>

                  {/* Your Website Logo (right side) */}
                  <div className={`absolute right-6 top-1/3 transform  transition-all duration-1000 ${
                    animationPhase >= 4 
                      ? 'scale-110 opacity-100' 
                      : animationPhase >= 2 
                        ? 'scale-105 opacity-90' 
                        : 'scale-100 opacity-60'
                  }`}>
                    <div className="relative">

                      <div className={`w-20 h-20  rounded-xl flex items-center justify-center shadow-2xl  transition-all duration-500 ${
                        animationPhase >= 4 ? 'border-primary-200 shadow-primary-200/30' : 'border-primary-300'
                      }`}>
                        <Image src="/logo-teal-stretched.png" fill/>
                      </div>
                      {/* <div className={`w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-300 rounded-xl flex items-center justify-center shadow-2xl border-2 transition-all duration-500 ${
                        animationPhase >= 4 ? 'border-primary-200 shadow-primary-200/30' : 'border-primary-300'
                      }`}>
                        <span className="text-white font-bold text-lg">MY</span>
                      </div> */}
                      {/* Success ring effect */}
                      {animationPhase >= 4 && (
                        <div className="absolute inset-0 w-20 h-20 border-2 border-primary-200 rounded-xl animate-ping opacity-50"></div>
                      )}
                    </div>
                  </div>

                  {/* Animated Files */}
                  <AnimatedFiles />

                  {/* Loading Text */}
                  <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 text-gray-200 mb-3">
                        <div className="w-2 h-2 bg-primary-200 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-primary-200 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-primary-200 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                      <p className="text-sm text-cbg-400 font-medium">
                        {animationPhase === 1 && 'Connecting to MAL...'}
                        {animationPhase === 2 && 'Transferring watchlist data...'}
                        {animationPhase === 3 && 'Processing and organizing...'}
                        {animationPhase === 4 && 'Import completed successfully!'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Content */}
            <div className="p-6 pt-4 space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-200 mb-2">
                  MAL Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-cbg-500 border border-cbg-400 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-transparent transition-all"
                  placeholder="Enter your MAL username"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Note */}
              <div className="bg-cbg-200 border-l-4 border-red-400 bg-red-300/20 p-2 rounded-r-lg">
                <div className="flex items-start">
                  <div className="ml-2">
                    <p className="text-gray-300 text-xs tracking-wide leading-tight">
                      <strong className="text-red-400">Important:</strong> Make sure MAL username is correct and public. Private profiles cannot be imported. Once imported, it cannot be undone.
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={isLoading || !username.trim()}
                className="w-full !mt-12 py-3 bg-primary-100 hover:bg-primary-200 disabled:bg-cbg-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:hover:scale-100"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Importing...
                  </div>
                ) : (
                  'Import Watchlist'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add custom styles for animations */}
      <style jsx>{`
        @keyframes trail {
          0% { opacity: 0; transform: translateX(-20px); }
          50% { opacity: 0.6; }
          100% { opacity: 0; transform: translateX(20px); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.6; }
          50% { transform: translateY(-10px) rotate(180deg); opacity: 0.2; }
        }
      `}</style>
    </>
  );
};

export default MALImporter;