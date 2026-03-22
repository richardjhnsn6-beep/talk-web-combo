import React, { useState, useEffect, useRef } from 'react';

const Radio = () => {
  const [playlist, setPlaylist] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [loading, setLoading] = useState(true);
  const [showDonationSuccess, setShowDonationSuccess] = useState(false);
  const [showCustomDonation, setShowCustomDonation] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const audioRef = useRef(null);

  useEffect(() => {
    fetchPlaylist();
    
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
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

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
            console.log('📢 Playing DJ announcement with volume boost');
            audioRef.current.src = `data:audio/mp3;base64,${announcement.audio_data}`;
            // Boost volume for announcements (they're quieter)
            audioRef.current.volume = Math.min(volume * 4.0, 1.0);
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
            // Normal volume for music
            audioRef.current.volume = volume;
          } else if (trackData.audio_url) {
            audioRef.current.src = trackData.audio_url;
            audioRef.current.volume = volume;
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

  // Auto-load and play when track index changes
  useEffect(() => {
    if (currentTrack && isPlaying && audioRef.current) {
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

  // Auto-play next track when audio is loaded
  useEffect(() => {
    if (audioRef.current && isPlaying && currentTrack) {
      audioRef.current.play();
    }
  }, [currentTrackIndex]);

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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-teal-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
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
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 mb-8 border border-white/20">
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
              {currentTrack && (
                <audio
                  ref={audioRef}
                  onEnded={handleTrackEnd}
                  autoPlay={isPlaying}
                />
              )}

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
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white p-6 rounded-full transition-all shadow-2xl transform hover:scale-110"
                  disabled={playlist.length === 0}
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
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-white/20 mb-8">
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <span>📻</span> Up Next
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {playlist.slice(currentTrackIndex + 1, currentTrackIndex + 6).map((track, idx) => (
                <div key={track.id} className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all">
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
          
          {!showCustomDonation ? (
            <>
              <div className="flex flex-wrap justify-center gap-4 mb-6">
                <button 
                  onClick={() => handleDonation(5)}
                  className="bg-white text-orange-600 px-6 py-3 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all shadow-lg transform hover:scale-105"
                >
                  $5
                </button>
                <button 
                  onClick={() => handleDonation(10)}
                  className="bg-white text-orange-600 px-6 py-3 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all shadow-lg transform hover:scale-105"
                >
                  $10
                </button>
                <button 
                  onClick={() => handleDonation(25)}
                  className="bg-white text-orange-600 px-6 py-3 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all shadow-lg transform hover:scale-105"
                >
                  $25
                </button>
                <button 
                  onClick={() => setShowCustomDonation(true)}
                  className="bg-white text-orange-600 px-6 py-3 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all shadow-lg transform hover:scale-105"
                >
                  Custom
                </button>
              </div>
            </>
          ) : (
            <div className="max-w-md mx-auto mb-6">
              <div className="flex gap-3">
                <div className="flex-1">
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="Enter amount"
                    min="1"
                    className="w-full px-4 py-3 rounded-lg text-gray-800 font-semibold text-lg"
                  />
                </div>
                <button
                  onClick={handleCustomDonation}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 transition-all shadow-lg"
                >
                  Donate
                </button>
                <button
                  onClick={() => {
                    setShowCustomDonation(false);
                    setCustomAmount('');
                  }}
                  className="bg-gray-600 text-white px-4 py-3 rounded-lg font-bold hover:bg-gray-700 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          
          <p className="text-white/80 text-sm">
            One-time donation • Secure payment via Stripe
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
      </div>
    </div>
  );
};

export default Radio;
