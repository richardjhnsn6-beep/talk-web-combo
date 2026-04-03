import React, { useState, useEffect, useRef } from 'react';

const Radio = () => {
  const [playlist, setPlaylist] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5); // Reduced base volume for better contrast
  const [loading, setLoading] = useState(true);
  const [showDonationSuccess, setShowDonationSuccess] = useState(false);
  const [showCustomDonation, setShowCustomDonation] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [isMember, setIsMember] = useState(false);
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [memberName, setMemberName] = useState('');
  const audioRef = useRef(null);

  useEffect(() => {
    fetchPlaylist();
    checkMembershipStatus();
    
    // Check for donation success
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('donation') === 'success') {
      setShowDonationSuccess(true);
      setTimeout(() => setShowDonationSuccess(false), 5000);
      // Clean URL
      window.history.replaceState({}, '', '/radio');
    }
  }, []);

  useEffect(() => {
    if (audioRef.current && playlist.length > 0) {
      // Apply consistent volume for all tracks
      // User controls volume with slider - no automatic adjustments
      audioRef.current.volume = volume;
      console.log(`🔊 Volume set: ${volume.toFixed(2)} (${Math.round(volume * 100)}%)`);
    }
  }, [volume, playlist, currentTrackIndex]);

  const fetchPlaylist = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/radio/playlist/mixed`);
      const data = await response.json();
      
      console.log('🎵 PLAYLIST LOADED:', data.length, 'items');
      console.log('First 6 items:');
      data.slice(0, 6).forEach((item, i) => {
        console.log(`  ${i}: ${item.type} - ${item.title}`);
      });
      
      setPlaylist(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching playlist:', error);
      setLoading(false);
    }
  };

  const checkMembershipStatus = async () => {
    try {
      // Check if email is stored in localStorage
      const storedEmail = localStorage.getItem('rjhnsn12_member_email');
      if (storedEmail) {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/membership/status/${storedEmail}`);
        const data = await response.json();
        setIsMember(data.is_member);
        if (data.is_member) {
          setMemberEmail(storedEmail);
        }
      }
    } catch (error) {
      console.error('Error checking membership:', error);
    }
  };

  const handleMembershipSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/membership/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: memberEmail,
          name: memberName
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setIsMember(true);
        localStorage.setItem('rjhnsn12_member_email', memberEmail.toLowerCase());
        setShowMembershipModal(false);
        alert(data.message);
        // Refresh playlist to include member-only content
        fetchPlaylist();
      }
    } catch (error) {
      console.error('Membership signup error:', error);
      alert('Failed to sign up. Please try again.');
    }
  };


  const currentTrack = playlist[currentTrackIndex];

  const handlePlay = async () => {
    if (audioRef.current && currentTrack) {
      try {
        console.log(`🎵 Loading: ${currentTrack.title} (${currentTrack.type})`);
        
        // Check if it's a DJ announcement or music track
        if (currentTrack.type === 'announcement') {
          // Fetch announcement audio
          const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/radio/dj/announcements`);
          const announcements = await response.json();
          const announcement = announcements.find(a => a.id === currentTrack.id);
          
          if (announcement && announcement.audio_data) {
            audioRef.current.src = `data:audio/mp3;base64,${announcement.audio_data}`;
            // Reduced volume for announcements - music should be louder
            audioRef.current.volume = 0.65; // DJ at 65% so music (100%) stays dominant
            console.log(`📢 DJ ANNOUNCEMENT - Volume: 0.65 (65%) - "${currentTrack.title}"`);
            console.log(`🔊 VOLUME COMPARISON: Announcement=0.65 vs Music=${volume.toFixed(2)}`)
          } else {
            console.error('❌ Announcement audio missing, skipping');
            handleNext();
            return;
          }
        } else {
          // Fetch track audio data
          const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/radio/track/${currentTrack.id}`);
          const trackData = await response.json();
          
          if (trackData.audio_data) {
            audioRef.current.src = `data:audio/mp3;base64,${trackData.audio_data}`;
            // Full volume for music - user controls it with slider
            audioRef.current.volume = volume; // Music plays at 100% of slider volume
            console.log(`🎵 MUSIC TRACK - Volume: ${volume.toFixed(2)} (${Math.round(volume * 100)}%) - "${currentTrack.title}"`);
          } else if (trackData.audio_url) {
            audioRef.current.src = trackData.audio_url;
            audioRef.current.volume = volume; // Music plays at 100% of slider volume
            console.log(`🎵 MUSIC TRACK - Volume: ${volume.toFixed(2)} (${Math.round(volume * 100)}%) - "${currentTrack.title}"`);
          } else {
            console.error('❌ Track audio missing, skipping');
            handleNext();
            return;
          }
        }
        
        await audioRef.current.play();
        setIsPlaying(true);
        console.log('✅ Playing');
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

  // Auto-load next track when index changes
  useEffect(() => {
    if (currentTrack && isPlaying && audioRef.current) {
      console.log(`🔄 Track index changed to ${currentTrackIndex}, loading track...`);
      handlePlay();
    }
  }, [currentTrackIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleNext = () => {
    if (playlist.length > 0) {
      const nextIndex = (currentTrackIndex + 1) % playlist.length;
      console.log(`⏭️ Next clicked: Moving from ${currentTrackIndex} to ${nextIndex}`);
      if (playlist[nextIndex]) {
        console.log(`   Next track: ${playlist[nextIndex].title} (${playlist[nextIndex].type})`);
      }
      setCurrentTrackIndex(nextIndex);
    }
  };

  const handlePrevious = () => {
    if (playlist.length > 0) {
      setCurrentTrackIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
      setIsPlaying(true);
    }
  };

  const handleTrackEnd = () => {
    handleNext();
  };

  const handleDonation = async (amount) => {
    try {
      const originUrl = window.location.origin;
      
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/payments/v1/donation/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amount,
          origin_url: originUrl,
          donor_name: "Anonymous Supporter"
        })
      });

      if (!response.ok) throw new Error('Failed to create donation session');

      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Donation error:', error);
      alert('Error processing donation. Please try again.');
    }
  };

  const handleCustomDonation = () => {
    const amount = parseFloat(customAmount);
    if (isNaN(amount) || amount < 1) {
      alert('Please enter a valid amount (minimum $1)');
      return;
    }
    handleDonation(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-teal-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading Radio Station...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-teal-900 p-4 md:p-8 relative overflow-hidden">
      {/* 3D Floating Vinyl Records */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 opacity-20 animate-spin-slow">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-400 to-pink-500 shadow-2xl" style={{
            transform: 'rotateY(45deg) rotateX(20deg)',
            animation: 'float 6s ease-in-out infinite, spin3d 20s linear infinite'
          }}>
            <div className="absolute inset-6 rounded-full bg-gray-900"></div>
            <div className="absolute inset-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600"></div>
          </div>
        </div>
        
        <div className="absolute top-40 right-20 w-24 h-24 opacity-15 animate-spin-slow">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-400 to-teal-500 shadow-2xl" style={{
            transform: 'rotateY(-30deg) rotateX(15deg)',
            animation: 'float 8s ease-in-out infinite 1s, spin3d 25s linear infinite'
          }}>
            <div className="absolute inset-4 rounded-full bg-gray-900"></div>
            <div className="absolute inset-8 rounded-full bg-gradient-to-br from-blue-600 to-teal-600"></div>
          </div>
        </div>
        
        <div className="absolute bottom-32 left-1/4 w-28 h-28 opacity-10">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-pink-400 to-purple-500 shadow-2xl" style={{
            transform: 'rotateY(60deg) rotateX(-25deg)',
            animation: 'float 7s ease-in-out infinite 2s, spin3d 30s linear infinite'
          }}>
            <div className="absolute inset-5 rounded-full bg-gray-900"></div>
            <div className="absolute inset-10 rounded-full bg-gradient-to-br from-pink-600 to-purple-600"></div>
          </div>
        </div>
        
        {/* Rotating 3D Geometric Shapes - Fireworks style */}
        <div className="absolute top-1/3 right-10 w-20 h-20 opacity-20" style={{
          animation: 'float 5s ease-in-out infinite, rotate3d 15s linear infinite'
        }}>
          <div className="w-full h-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-2xl" style={{
            clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
            transform: 'rotateX(45deg) rotateZ(45deg)'
          }}></div>
        </div>
        
        <div className="absolute bottom-1/4 right-1/3 w-16 h-16 opacity-25" style={{
          animation: 'float 6s ease-in-out infinite 1.5s, rotate3d 18s linear infinite reverse'
        }}>
          <div className="w-full h-full bg-gradient-to-br from-green-400 to-blue-500 shadow-xl" style={{
            clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
            transform: 'rotateX(30deg) rotateY(45deg)'
          }}></div>
        </div>
        
        {/* 3D Music Notes */}
        <div className="absolute top-1/2 left-20 text-6xl opacity-20" style={{
          animation: 'float 4s ease-in-out infinite, rotate3d 12s linear infinite',
          transform: 'rotateY(30deg) rotateX(20deg)'
        }}>🎵</div>
        
        <div className="absolute top-1/4 right-1/4 text-5xl opacity-15" style={{
          animation: 'float 5s ease-in-out infinite 2s, rotate3d 16s linear infinite reverse',
          transform: 'rotateY(-40deg) rotateX(-15deg)'
        }}>🎶</div>
        
        <div className="absolute bottom-1/3 left-1/3 text-4xl opacity-25" style={{
          animation: 'float 6s ease-in-out infinite 1s, rotate3d 20s linear infinite',
          transform: 'rotateY(50deg) rotateX(25deg)'
        }}>🎼</div>
        
        {/* Sparkle Particles - Fireworks effect */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full"
            style={{
              top: `${15 + i * 7}%`,
              left: `${10 + i * 8}%`,
              opacity: 0.6,
              boxShadow: '0 0 10px rgba(255, 255, 255, 0.8)',
              animation: `sparkle ${2 + i * 0.3}s ease-in-out infinite ${i * 0.2}s, float ${3 + i * 0.2}s ease-in-out infinite`
            }}
          />
        ))}
        
        {/* Orbiting particles around corners */}
        {[...Array(6)].map((_, i) => (
          <div
            key={`orbit-${i}`}
            className="absolute w-3 h-3 rounded-full bg-gradient-to-r from-purple-400 to-pink-400"
            style={{
              top: '50%',
              left: '50%',
              opacity: 0.4,
              boxShadow: '0 0 20px rgba(168, 85, 247, 0.6)',
              animation: `orbit ${8 + i}s linear infinite ${i * 1.5}s`
            }}
          />
        ))}
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-3 animate-pulse">
            🎙️ RJHNSN12 Radio


          </h1>
          <p className="text-xl text-purple-200">
            24/7 Music & Biblical Wisdom
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-white font-semibold">LIVE NOW</span>
          </div>
        </div>

        {/* Main Player Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 mb-8 border border-white/20 relative" style={{
          transform: 'perspective(1000px) rotateX(2deg)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 100px rgba(168, 85, 247, 0.4)',
          transition: 'transform 0.3s ease'
        }}
        onMouseMove={(e) => {
          const card = e.currentTarget;
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const rotateX = (y - centerY) / 20;
          const rotateY = (centerX - x) / 20;
          card.style.transform = `perspective(1000px) rotateX(${2 - rotateX}deg) rotateY(${rotateY}deg)`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'perspective(1000px) rotateX(2deg)';
        }}
        >
          {playlist.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-8xl mb-4">🎵</div>
              <h3 className="text-2xl font-bold text-white mb-4">Radio Station Coming Soon!</h3>
              <p className="text-purple-200 text-lg mb-6">
                The playlist is being prepared. Check back soon for 24/7 music and biblical content!
              </p>
              <div className="bg-white/5 rounded-lg p-6 max-w-md mx-auto">
                <p className="text-white text-sm">
                  <strong>Coming Soon:</strong>
                </p>
                <ul className="text-purple-200 text-sm mt-3 space-y-2 text-left">
                  <li>🎵 Continuous music streaming</li>
                  <li>🎙️ AI DJ announcements</li>
                  <li>📖 Biblical content promotion</li>
                  <li>💰 Support through donations</li>
                </ul>
              </div>
            </div>
          ) : (
            <>
              {/* Now Playing Display */}
              <div className="text-center mb-8">
                <p className="text-purple-300 text-sm uppercase tracking-wide mb-2">Now Playing</p>
                <h2 className="text-3xl font-bold text-white mb-2">{currentTrack?.title || 'Loading...'}</h2>
                <p className="text-xl text-purple-200">{currentTrack?.artist || ''}</p>
              </div>

              {/* Audio Element */}
              <audio
                ref={audioRef}
                onEnded={handleTrackEnd}
              />

              {/* Player Controls */}
              <div className="flex items-center justify-center gap-6 mb-8">
                <button
                  onClick={handlePrevious}
                  className="bg-white/20 hover:bg-white/30 text-white p-4 rounded-full transition-all shadow-lg"
                  disabled={playlist.length === 0}
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                  </svg>
                </button>

                <button
                  onClick={isPlaying ? handlePause : handlePlay}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white p-6 rounded-full transition-all shadow-2xl transform hover:scale-110 relative"
                  disabled={playlist.length === 0}
                  style={{
                    boxShadow: isPlaying ? '0 0 60px rgba(168, 85, 247, 0.8), 0 0 100px rgba(236, 72, 153, 0.6), 0 20px 40px rgba(0,0,0,0.3)' : '0 20px 40px rgba(0,0,0,0.3)',
                    animation: isPlaying ? 'pulse-glow 2s ease-in-out infinite' : 'none'
                  }}
                >
                  {isPlaying ? (
                    <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                    </svg>
                  ) : (
                    <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  )}
                </button>

                <button
                  onClick={handleNext}
                  className="bg-white/20 hover:bg-white/30 text-white p-4 rounded-full transition-all shadow-lg"
                  disabled={playlist.length === 0}
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 18h2V6h-2zm-4-12v12l-8.5-6z"/>
                  </svg>
                </button>
              </div>

              {/* Volume Control */}
              <div className="flex items-center justify-center gap-4 mb-6">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                </svg>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-32 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, rgb(168, 85, 247) 0%, rgb(168, 85, 247) ${volume * 100}%, rgba(255,255,255,0.2) ${volume * 100}%, rgba(255,255,255,0.2) 100%)`
                  }}
                />
              </div>

              {/* Track Info */}
              <div className="text-center text-purple-200 text-sm">
                Track {currentTrackIndex + 1} of {playlist.length}
              </div>
            </>
          )}
        </div>

        {/* Upcoming Tracks */}
        {playlist.length > 0 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-white/20 mb-8 relative" style={{
            transform: 'perspective(1000px) rotateX(1deg)',
            boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.4), 0 0 80px rgba(59, 130, 246, 0.3)'
          }}>
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <span>📻</span> Up Next
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {playlist.slice(currentTrackIndex + 1, currentTrackIndex + 6).map((track, idx) => (
                <div key={track.id} className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all transform hover:translate-x-2" style={{
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)'
                }}>
                  <p className="text-white font-semibold">{track.title}</p>
                  <p className="text-purple-300 text-sm">{track.artist}</p>
                </div>
              ))}
              {playlist.length > currentTrackIndex + 6 && (
                <p className="text-purple-300 text-sm text-center italic">
                  ...and {playlist.length - currentTrackIndex - 6} more tracks
                </p>
              )}
            </div>
          </div>
        )}

        {/* Featured Content Banners */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <a href="/book-of-amos" className="block group">
            <img 
              src="https://static.prod-images.emergentagent.com/jobs/dae91dca-f806-499e-ba09-9fd13250539c/images/485ee5484e46ee0129440753c53f3fa24ae14f946532c2df14c0474155b1308d.png"
              alt="Unlock the Book of Amos"
              className="w-full h-48 object-cover rounded-lg shadow-lg group-hover:shadow-2xl transition-all"
            />
          </a>
          <a href="/page-two" className="block group">
            <img 
              src="https://static.prod-images.emergentagent.com/jobs/dae91dca-f806-499e-ba09-9fd13250539c/images/0b3440b12a9bf7b882f6b7bd8658c0f354cdefe37cdba2fa7307055e6b0a9bd5.png"
              alt="20-Letter TRUE Hebrew Alphabet System"
              className="w-full h-48 object-cover rounded-lg shadow-lg group-hover:shadow-2xl transition-all"
            />
          </a>
        </div>

        {/* Support Section */}
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl shadow-2xl p-8 text-center">
          {showDonationSuccess && (
            <div className="mb-6 p-4 bg-white rounded-lg animate-bounce">
              <p className="text-2xl font-bold text-green-600">🎉 Thank You for Your Support!</p>
              <p className="text-gray-700 mt-2">Your donation helps keep this ministry alive!</p>
            </div>
          )}
          
          <h3 className="text-3xl font-bold text-white mb-3">
            ❤️ Support True Knowledge
          </h3>
          <p className="text-white/90 text-lg mb-6">
            Love the music and biblical content? Support this ministry!
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <a 
              href="/shop"
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:opacity-90 transition-all shadow-lg"
            >
              🛒 Visit Our Shop
            </a>
            <a 
              href="/#ai-richard"
              onClick={() => window.location.hash = 'ai-richard'}
              className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:opacity-90 transition-all shadow-lg"
            >
              💳 Subscribe ($2 or $5/mo)
            </a>
          </div>
          
          <p className="text-white/80 text-sm">
            💝 Support through our <a href="/shop" className="text-purple-300 hover:text-purple-200 underline">Shop Page</a> or PayPal memberships
          </p>
        </div>

        {/* Explore More Content */}
        <div className="mt-8 bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            📚 Explore Biblical Truth
          </h3>
          <p className="text-purple-200 mb-6">
            Discover the original 20-letter Hebrew system and ancient biblical texts
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/book-of-amos"
              className="bg-teal-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-teal-700 transition-all shadow-lg"
            >
              📖 Book of Amos Sample
            </a>
            <a
              href="/books"
              className="bg-purple-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-purple-700 transition-all shadow-lg"
            >
              📚 Published Books
            </a>
          </div>
        </div>

        {/* RJHNSN12 Radio Membership */}
        <div className="mt-8 bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-purple-500/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
              🎵 RJHNSN12 Radio Membership
              {isMember && <span className="text-4xl">👍</span>}
            </h3>
          </div>
          
          {isMember ? (
            <div className="text-center">
              <p className="text-green-300 text-lg mb-4">
                ✅ You're a member! Enjoy all RJHNSN12 benefits:
              </p>
              <ul className="text-white/90 mb-4 space-y-2 text-left max-w-2xl mx-auto">
                <li>🌙 <strong>The Quiet Storm</strong> - Exclusive radio content</li>
                <li>📚 <strong>Book Discounts</strong> - Save on Hebrew literature</li>
                <li>📖 <strong>Hebrew Learning</strong> - Access to Book of Amos translations</li>
                <li>💬 <strong>AI Chat Priority</strong> - Enhanced support from AI Richard</li>
              </ul>
              <p className="text-purple-200 text-sm">
                Member email: {memberEmail}
              </p>
            </div>
          ) : (
            <div>
              <p className="text-purple-200 mb-4">
                Join RJHNSN12 for FREE and unlock exclusive benefits across the entire platform:
              </p>
              <ul className="text-white/90 mb-6 space-y-2 text-left">
                <li>🌙 <strong>The Quiet Storm</strong> - Exclusive late-night radio vibes (6 PM - Midnight)</li>
                <li>📚 <strong>Book Discounts</strong> - Save 15% on Hebrew literature & Book of Amos</li>
                <li>📖 <strong>Hebrew Learning</strong> - Access to original 20-letter Hebrew system</li>
                <li>💬 <strong>AI Chat Priority</strong> - Enhanced guidance from AI Richard</li>
                <li>💌 <strong>Member Updates</strong> - Exclusive announcements and content</li>
              </ul>
              <button
                onClick={() => setShowMembershipModal(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-lg font-bold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg text-lg"
              >
                Join for FREE 🎉
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Membership Sign-Up Modal */}
      {showMembershipModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-purple-900 to-pink-900 rounded-2xl p-8 max-w-md w-full shadow-2xl border-2 border-purple-500">
            <h2 className="text-3xl font-bold text-white mb-4">Join RJHNSN12 🎵</h2>
            <p className="text-purple-200 mb-6">
              Get FREE access to exclusive content across the entire platform: The Quiet Storm radio, Book discounts, Hebrew learning, and more!
            </p>
            
            <form onSubmit={handleMembershipSignup} className="space-y-4">
              <div>
                <label className="text-white font-semibold block mb-2">Email Address *</label>
                <input
                  type="email"
                  required
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 rounded-lg text-gray-800 font-semibold"
                />
              </div>
              
              <div>
                <label className="text-white font-semibold block mb-2">Name (Optional)</label>
                <input
                  type="text"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-4 py-3 rounded-lg text-gray-800 font-semibold"
                />
              </div>
              
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 transition-all shadow-lg"
                >
                  Join Now! 🎉
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowMembershipModal(false);
                    setMemberEmail('');
                    setMemberName('');
                  }}
                  className="bg-gray-600 text-white px-4 py-3 rounded-lg font-bold hover:bg-gray-700 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
            
            <p className="text-purple-300 text-sm mt-4">
              🔒 Your email is safe with us. No spam, ever.
            </p>
          </div>
        </div>
      )}
      
      {/* 3D Animation Styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) translateX(0px); 
          }
          50% { 
            transform: translateY(-20px) translateX(10px); 
          }
        }
        
        @keyframes spin3d {
          0% { 
            transform: rotateY(0deg) rotateX(20deg); 
          }
          100% { 
            transform: rotateY(360deg) rotateX(20deg); 
          }
        }
        
        @keyframes rotate3d {
          0% { 
            transform: rotateX(45deg) rotateZ(0deg); 
          }
          100% { 
            transform: rotateX(45deg) rotateZ(360deg); 
          }
        }
        
        @keyframes sparkle {
          0%, 100% { 
            opacity: 0.3; 
            transform: scale(1); 
          }
          50% { 
            opacity: 1; 
            transform: scale(2); 
          }
        }
        
        @keyframes orbit {
          0% {
            transform: translate(-50%, -50%) rotate(0deg) translateX(300px) rotate(0deg);
          }
          100% {
            transform: translate(-50%, -50%) rotate(360deg) translateX(300px) rotate(-360deg);
          }
        }
        
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 60px rgba(168, 85, 247, 0.8), 0 0 100px rgba(236, 72, 153, 0.6), 0 20px 40px rgba(0,0,0,0.3);
          }
          50% {
            box-shadow: 0 0 80px rgba(168, 85, 247, 1), 0 0 120px rgba(236, 72, 153, 0.8), 0 20px 40px rgba(0,0,0,0.3);
          }
        }
        
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Radio;
