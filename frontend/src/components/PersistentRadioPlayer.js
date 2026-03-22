import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const PersistentRadioPlayer = () => {
  const [playlist, setPlaylist] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMinimized, setIsMinimized] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const gainNodeRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const location = useLocation();

  // Fetch playlist and setup video detection on mount
  useEffect(() => {
    fetchPlaylist();
    const cleanup = setupVideoDetection();
    return cleanup;
  }, []);

  const fetchPlaylist = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/radio/playlist/mixed`);
      const data = await response.json();
      if (data.length > 0) {
        setPlaylist(data);
        setIsVisible(true);
      }
    } catch (error) {
      console.error('Error fetching playlist:', error);
    }
  };

  const setupVideoDetection = () => {
    // Detect when videos play and pause the radio
    const handleMediaEvent = (e) => {
      const target = e.target;
      
      // Check if it's a video or iframe (embedded video)
      if (target.tagName === 'VIDEO' || (target.tagName === 'IFRAME' && target.src)) {
        if (e.type === 'play' || e.type === 'playing') {
          // Video started - pause radio
          if (audioRef.current && !audioRef.current.paused) {
            audioRef.current.pause();
            setIsPlaying(false);
            console.log('📹 Video playing - Radio paused');
          }
        } else if (e.type === 'ended') {
          // Video ended - resume radio after 1 second
          setTimeout(() => {
            if (audioRef.current && audioRef.current.paused) {
              const playPromise = audioRef.current.play();
              if (playPromise !== undefined) {
                playPromise.then(() => {
                  setIsPlaying(true);
                  console.log('🎵 Video ended - Radio resumed');
                }).catch(() => {
                  console.log('Auto-resume prevented by browser');
                });
              }
            }
          }, 1000);
        }
      }
    };

    // Add event listeners to document for video events
    document.addEventListener('play', handleMediaEvent, true);
    document.addEventListener('playing', handleMediaEvent, true);
    document.addEventListener('ended', handleMediaEvent, true);

    // Also check for YouTube iframe API events
    window.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.event === 'onStateChange') {
          if (data.info === 1) {
            // YouTube video playing
            if (audioRef.current && !audioRef.current.paused) {
              audioRef.current.pause();
              setIsPlaying(false);
              console.log('📹 YouTube video playing - Radio paused');
            }
          }
        }
      } catch (e) {
        // Not YouTube message
      }
    });

    // Cleanup
    return () => {
      document.removeEventListener('play', handleMediaEvent, true);
      document.removeEventListener('playing', handleMediaEvent, true);
      document.removeEventListener('ended', handleMediaEvent, true);
    };
  };

  // Initialize Web Audio API for volume amplification
  useEffect(() => {
    if (!audioContextRef.current && audioRef.current) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContextRef.current = new AudioContext();
        gainNodeRef.current = audioContextRef.current.createGain();
        gainNodeRef.current.connect(audioContextRef.current.destination);
      } catch (error) {
        console.error('Web Audio API not supported:', error);
      }
    }
  }, []);

  const currentTrack = playlist[currentTrackIndex];

  // Update volume with special boost for announcements
  useEffect(() => {
    if (audioRef.current) {
      const isAnnouncement = currentTrack?.type === 'announcement';
      // Announcements get 4x boost (up to max), music gets normal volume
      const targetVolume = isAnnouncement ? Math.min(volume * 4.0, 1.0) : volume;
      audioRef.current.volume = targetVolume;
      
      // Also apply gain node boost for announcements if available
      if (gainNodeRef.current) {
        gainNodeRef.current.gain.value = isAnnouncement ? 3.0 : 1.0;
      }
    }
  }, [volume, currentTrack]);

  const handlePlay = async () => {
    if (audioRef.current && currentTrack) {
      try {
        // Check if it's a DJ announcement or music track
        if (currentTrack.type === 'announcement') {
          // Fetch announcement audio
          const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/radio/dj/announcements`);
          const announcements = await response.json();
          const announcement = announcements.find(a => a.id === currentTrack.id);
          
          if (announcement && announcement.audio_data) {
            audioRef.current.src = `data:audio/mp3;base64,${announcement.audio_data}`;
          }
        } else {
          // Fetch track audio data
          const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/radio/track/${currentTrack.id}`);
          const trackData = await response.json();
          
          if (trackData.audio_data) {
            audioRef.current.src = `data:audio/mp3;base64,${trackData.audio_data}`;
          } else if (trackData.audio_url) {
            audioRef.current.src = trackData.audio_url;
          }
        }
        
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            setIsPlaying(true);
          }).catch(error => {
            console.log('Playback prevented:', error);
            setIsPlaying(false);
          });
        }
      } catch (error) {
        console.error('Playback error:', error);
        setIsPlaying(false);
      }
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleNext = () => {
    if (playlist.length > 0) {
      const nextIndex = (currentTrackIndex + 1) % playlist.length;
      setCurrentTrackIndex(nextIndex);
      setIsPlaying(true);
    }
  };

  const handlePrevious = () => {
    if (playlist.length > 0) {
      const prevIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
      setCurrentTrackIndex(prevIndex);
      setIsPlaying(true);
    }
  };

  const handleTrackEnd = () => {
    handleNext();
  };

  // Auto-load next track when index changes
  useEffect(() => {
    if (currentTrack && isPlaying && audioRef.current && audioRef.current.src) {
      // Only if already playing and has source
      handlePlay();
    }
  }, [currentTrackIndex]);

  // Don't show player if no tracks or on admin radio page (to avoid duplicate players)
  if (!isVisible || playlist.length === 0 || location.pathname === '/admin/radio') {
    return null;
  }

  return (
    <>
      <audio ref={audioRef} onEnded={handleTrackEnd} />
      
      {/* Floating Mini Player */}
      <div className={`fixed bottom-0 left-0 right-0 bg-gradient-to-r from-purple-900 to-blue-900 text-white shadow-2xl z-50 transition-all duration-300 ${isMinimized ? 'h-20' : 'h-64'}`}>
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          
          {isMinimized ? (
            // Minimized View
            <>
              <div className="flex items-center gap-4 flex-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-bold">LIVE</span>
                </div>
                <div className="text-sm">
                  {currentTrack?.type === 'announcement' ? (
                    <>
                      <p className="font-semibold truncate max-w-xs">🎙️ Station ID</p>
                      <p className="text-xs text-purple-300 truncate">RJHNSN12 Radio DJ</p>
                    </>
                  ) : (
                    <>
                      <p className="font-semibold truncate max-w-xs">{currentTrack?.title || 'Radio'}</p>
                      <p className="text-xs text-purple-300 truncate">{currentTrack?.artist || ''}</p>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrevious}
                  className="p-2 hover:bg-white/10 rounded-full transition-all"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                  </svg>
                </button>

                <button
                  onClick={isPlaying ? handlePause : handlePlay}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-full hover:scale-110 transition-all"
                >
                  {isPlaying ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  )}
                </button>

                <button
                  onClick={handleNext}
                  className="p-2 hover:bg-white/10 rounded-full transition-all"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 18h2V6h-2zm-4-12v12l-8.5-6z"/>
                  </svg>
                </button>

                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-20 h-1 cursor-pointer"
                />

                <button
                  onClick={() => setIsMinimized(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-all"
                  title="Expand player"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 14l5-5 5 5z"/>
                  </svg>
                </button>
              </div>
            </>
          ) : (
            // Expanded View
            <div className="w-full py-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🎙️</span>
                    <h3 className="text-lg font-bold">RJHNSN12 Radio</h3>
                    <div className="flex items-center gap-1 ml-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-xs">LIVE</span>
                    </div>
                  </div>
                  <p className="text-sm text-purple-300 mb-1">Now Playing:</p>
                  <p className="font-semibold">{currentTrack?.title || 'Loading...'}</p>
                  <p className="text-sm text-purple-300">{currentTrack?.artist || ''}</p>
                </div>
                
                <button
                  onClick={() => setIsMinimized(true)}
                  className="p-2 hover:bg-white/10 rounded-full transition-all"
                  title="Minimize player"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 10l5 5 5-5z"/>
                  </svg>
                </button>
              </div>

              <div className="flex items-center justify-center gap-6 mb-4">
                <button onClick={handlePrevious} className="p-3 hover:bg-white/20 rounded-full transition-all">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                  </svg>
                </button>

                <button
                  onClick={isPlaying ? handlePause : handlePlay}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 p-5 rounded-full hover:scale-110 transition-all"
                >
                  {isPlaying ? (
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                    </svg>
                  ) : (
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  )}
                </button>

                <button onClick={handleNext} className="p-3 hover:bg-white/20 rounded-full transition-all">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 18h2V6h-2zm-4-12v12l-8.5-6z"/>
                  </svg>
                </button>
              </div>

              <div className="flex items-center justify-center gap-3">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                </svg>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-48 h-2 cursor-pointer"
                />
                <span className="text-xs">{Math.round(volume * 100)}%</span>
              </div>

              <p className="text-center text-xs text-purple-300 mt-3">
                Track {currentTrackIndex + 1} of {playlist.length}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Spacer to prevent content being hidden behind player */}
      <div className="h-20"></div>
    </>
  );
};

export default PersistentRadioPlayer;
