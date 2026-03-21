import React, { useState, useEffect } from 'react';

const AdminRadio = () => {
  const [playlist, setPlaylist] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    title: '',
    artist: '',
    duration: 180,
    audioFile: null
  });
  
  // DJ announcement form state
  const [djForm, setDjForm] = useState({
    script: '',
    voice: 'nova'
  });
  
  const [uploading, setUploading] = useState(false);
  const [generatingDJ, setGeneratingDJ] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [playlistRes, announcementsRes] = await Promise.all([
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/radio/playlist`),
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/radio/dj/announcements`)
      ]);
      
      const playlistData = await playlistRes.json();
      const announcementsData = await announcementsRes.json();
      
      setPlaylist(playlistData);
      setAnnouncements(announcementsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    setUploadForm({ ...uploadForm, audioFile: e.target.files[0] });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadForm.audioFile) {
      alert('Please select an audio file');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('title', uploadForm.title);
      formData.append('artist', uploadForm.artist);
      formData.append('duration', uploadForm.duration);
      formData.append('audio_file', uploadForm.audioFile);

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/radio/track/upload`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Upload failed');

      alert('✅ Track uploaded successfully!');
      setUploadForm({ title: '', artist: '', duration: 180, audioFile: null });
      fetchData();
    } catch (error) {
      console.error('Upload error:', error);
      alert('❌ Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleGenerateDJ = async (e) => {
    e.preventDefault();
    if (!djForm.script.trim()) {
      alert('Please enter a DJ script');
      return;
    }

    setGeneratingDJ(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/radio/dj/announcement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script: djForm.script,
          voice: djForm.voice,
          position: 'between_tracks'
        })
      });

      if (!response.ok) throw new Error('Generation failed');

      const data = await response.json();
      alert('✅ DJ announcement generated!');
      
      // Play the generated audio
      const audio = new Audio(`data:audio/mp3;base64,${data.audio_data}`);
      audio.play();

      setDjForm({ script: '', voice: 'nova' });
      fetchData();
    } catch (error) {
      console.error('DJ generation error:', error);
      alert('❌ Generation failed. Please try again.');
    } finally {
      setGeneratingDJ(false);
    }
  };

  const handleDeleteTrack = async (trackId) => {
    if (!window.confirm('Delete this track?')) return;

    try {
      await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/radio/track/${trackId}`, {
        method: 'DELETE'
      });
      fetchData();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete track');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🎙️ Radio Station Admin</h1>
          <p className="text-gray-600">Manage your 24/7 music stream and AI DJ announcements</p>
        </div>

        {/* Upload Track Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">🎵 Upload Music Track</h2>
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Track Title</label>
                <input
                  type="text"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Song name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Artist</label>
                <input
                  type="text"
                  value={uploadForm.artist}
                  onChange={(e) => setUploadForm({ ...uploadForm, artist: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Artist name"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Duration (seconds)</label>
              <input
                type="number"
                value={uploadForm.duration}
                onChange={(e) => setUploadForm({ ...uploadForm, duration: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Audio File (MP3)</label>
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileSelect}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
              />
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full bg-teal-600 text-white py-3 rounded-lg font-bold hover:bg-teal-700 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : '⬆️ Upload Track'}
            </button>
          </form>
        </div>

        {/* Generate DJ Announcement Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">🎤 Generate AI DJ Announcement</h2>
          <form onSubmit={handleGenerateDJ} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">DJ Script</label>
              <textarea
                value={djForm.script}
                onChange={(e) => setDjForm({ ...djForm, script: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent h-24"
                placeholder="Example: You're listening to RJHNSN12 Radio, bringing you biblical wisdom and great music 24/7. Check out the Book of Amos at our website!"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Max 4000 characters</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">DJ Voice</label>
              <select
                value={djForm.voice}
                onChange={(e) => setDjForm({ ...djForm, voice: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="nova">Nova - Energetic, upbeat</option>
                <option value="alloy">Alloy - Neutral, balanced</option>
                <option value="echo">Echo - Smooth, calm</option>
                <option value="fable">Fable - Expressive, storytelling</option>
                <option value="onyx">Onyx - Deep, authoritative</option>
                <option value="shimmer">Shimmer - Bright, cheerful</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={generatingDJ}
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {generatingDJ ? 'Generating...' : '🎙️ Generate DJ Voice'}
            </button>
          </form>
        </div>

        {/* Current Playlist */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            🎵 Current Playlist ({playlist.length} tracks)
          </h2>
          {playlist.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎵</div>
              <p className="text-gray-500 text-lg">No tracks uploaded yet</p>
              <p className="text-gray-400 text-sm mt-2">Upload your first track above!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {playlist.map((track, idx) => (
                <div key={track.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all">
                  <div className="flex items-center gap-4">
                    <span className="text-gray-500 font-bold text-lg">#{idx + 1}</span>
                    <div>
                      <p className="font-semibold text-gray-800">{track.title}</p>
                      <p className="text-sm text-gray-600">{track.artist}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteTrack(track.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all text-sm font-semibold"
                  >
                    🗑️ Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* DJ Announcements */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            🎤 DJ Announcements ({announcements.length})
          </h2>
          {announcements.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎙️</div>
              <p className="text-gray-500 text-lg">No announcements created yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {announcements.map((announcement, idx) => (
                <div key={announcement.id} className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm font-semibold text-purple-700">
                      Voice: {announcement.voice} | Created: {new Date(announcement.created_at).toLocaleDateString()}
                    </p>
                    <button
                      onClick={async () => {
                        const audio = new Audio(`data:audio/mp3;base64,${announcement.audio_data}`);
                        audio.play();
                      }}
                      className="bg-purple-500 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-purple-600"
                    >
                      ▶️ Play
                    </button>
                  </div>
                  <p className="text-gray-700 text-sm italic">"{announcement.script}"</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Tips */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6 border border-blue-300">
          <h3 className="text-lg font-bold text-blue-900 mb-3">💡 Quick Tips</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>✅ Upload MP3 files for best compatibility</li>
            <li>✅ DJ announcements auto-play between tracks (coming soon)</li>
            <li>✅ Tracks play in the order uploaded (drag-to-reorder coming soon)</li>
            <li>✅ Recommended: Upload 10-20 tracks for continuous rotation</li>
            <li>✅ Use DJ announcements to promote your books and biblical content!</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminRadio;
