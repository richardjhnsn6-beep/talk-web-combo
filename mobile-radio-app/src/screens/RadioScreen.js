import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Linking,
} from 'react-native';
import TrackPlayer, {
  usePlaybackState,
  useProgress,
  useTrackPlayerEvents,
  Event,
  State,
} from 'react-native-track-player';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig.extra?.apiUrl || 'https://talk-web-combo.preview.emergentagent.com';

const RadioScreen = ({ navigation }) => {
  const [playlist, setPlaylist] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [loading, setLoading] = useState(true);
  const playbackState = usePlaybackState();
  const progress = useProgress();

  useEffect(() => {
    loadPlaylist();
  }, []);

  // Listen to track changes
  useTrackPlayerEvents([Event.PlaybackTrackChanged], async (event) => {
    if (event.type === Event.PlaybackTrackChanged && event.nextTrack != null) {
      const track = await TrackPlayer.getTrack(event.nextTrack);
      setCurrentTrack(track);
    }
  });

  const loadPlaylist = async () => {
    try {
      setLoading(true);
      
      // Fetch playlist from backend
      const response = await fetch(`${API_URL}/api/radio/playlist/mixed`);
      const data = await response.json();
      
      console.log(`📻 Loaded ${data.length} items`);
      
      // Convert playlist to TrackPlayer format
      const tracks = await Promise.all(
        data.map(async (item, index) => {
          if (item.type === 'announcement') {
            // Fetch announcement audio
            const announcementResponse = await fetch(`${API_URL}/api/radio/dj/announcements`);
            const announcements = await announcementResponse.json();
            const announcement = announcements.find(a => a.id === item.id);
            
            return {
              id: item.id,
              url: announcement?.audio_data 
                ? `data:audio/mp3;base64,${announcement.audio_data}`
                : null,
              title: '🎙️ Station ID',
              artist: 'RJHNSN12 Radio',
              artwork: null,
              isAnnouncement: true,
            };
          } else {
            // Fetch track audio
            const trackResponse = await fetch(`${API_URL}/api/radio/track/${item.id}`);
            const trackData = await trackResponse.json();
            
            return {
              id: item.id,
              url: trackData.audio_data 
                ? `data:audio/mp3;base64,${trackData.audio_data}`
                : trackData.audio_url,
              title: item.title,
              artist: item.artist,
              artwork: null,
              isAnnouncement: false,
            };
          }
        })
      );
      
      // Filter out tracks without audio
      const validTracks = tracks.filter(t => t.url);
      
      // Add tracks to player
      await TrackPlayer.reset();
      await TrackPlayer.add(validTracks);
      
      setPlaylist(validTracks);
      setLoading(false);
      
      // Get first track
      if (validTracks.length > 0) {
        const firstTrack = await TrackPlayer.getTrack(0);
        setCurrentTrack(firstTrack);
      }
    } catch (error) {
      console.error('Error loading playlist:', error);
      setLoading(false);
    }
  };

  const togglePlayback = async () => {
    const state = await TrackPlayer.getState();
    
    if (state === State.Playing) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  };

  const skipToNext = async () => {
    await TrackPlayer.skipToNext();
  };

  const skipToPrevious = async () => {
    await TrackPlayer.skipToPrevious();
  };

  const openWebsite = () => {
    Linking.openURL('https://talk-web-combo.preview.emergentagent.com');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7c3aed" />
        <Text style={styles.loadingText}>Loading Radio Station...</Text>
      </View>
    );
  }

  const isPlaying = playbackState === State.Playing;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Live Indicator */}
        <View style={styles.liveContainer}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE NOW</Text>
        </View>

        {/* Now Playing Card */}
        <View style={styles.playerCard}>
          <Text style={styles.nowPlayingLabel}>NOW PLAYING</Text>
          <Text style={styles.trackTitle} numberOfLines={2}>
            {currentTrack?.title || 'RJHNSN12 Radio'}
          </Text>
          <Text style={styles.trackArtist}>
            {currentTrack?.artist || '24/7 Music & Biblical Wisdom'}
          </Text>

          {/* Player Controls */}
          <View style={styles.controls}>
            <TouchableOpacity onPress={skipToPrevious} style={styles.controlButton}>
              <Text style={styles.controlIcon}>⏮️</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={togglePlayback} style={styles.playButton}>
              <Text style={styles.playIcon}>{isPlaying ? '⏸️' : '▶️'}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={skipToNext} style={styles.controlButton}>
              <Text style={styles.controlIcon}>⏭️</Text>
            </TouchableOpacity>
          </View>

          {/* Track Info */}
          <Text style={styles.trackInfo}>
            {playlist.length} tracks in rotation
          </Text>
        </View>

        {/* Support Section */}
        <View style={styles.supportCard}>
          <Text style={styles.supportTitle}>❤️ Support True Knowledge</Text>
          <Text style={styles.supportText}>
            Love the music and biblical content? Support this ministry!
          </Text>
          
          <TouchableOpacity
            style={styles.donateButton}
            onPress={() => navigation.navigate('Donation')}
          >
            <Text style={styles.donateButtonText}>Make a Donation</Text>
          </TouchableOpacity>
        </View>

        {/* Explore Content */}
        <View style={styles.exploreCard}>
          <Text style={styles.exploreTitle}>📚 Explore Biblical Truth</Text>
          <Text style={styles.exploreText}>
            Discover the original 20-letter Hebrew system and ancient biblical texts on our website
          </Text>
          
          <TouchableOpacity
            style={styles.websiteButton}
            onPress={openWebsite}
          >
            <Text style={styles.websiteButtonText}>Visit Website</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1b4b',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1e1b4b',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 16,
  },
  content: {
    padding: 16,
  },
  liveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  liveDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ef4444',
    marginRight: 8,
  },
  liveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  playerCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
  },
  nowPlayingLabel: {
    color: '#c4b5fd',
    fontSize: 12,
    marginBottom: 8,
    letterSpacing: 2,
  },
  trackTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  trackArtist: {
    color: '#c4b5fd',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 24,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  controlButton: {
    padding: 16,
  },
  controlIcon: {
    fontSize: 32,
  },
  playButton: {
    backgroundColor: '#7c3aed',
    borderRadius: 50,
    padding: 20,
    marginHorizontal: 24,
  },
  playIcon: {
    fontSize: 40,
  },
  trackInfo: {
    color: '#c4b5fd',
    fontSize: 14,
  },
  supportCard: {
    backgroundColor: '#f59e0b',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
  },
  supportTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  supportText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  donateButton: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  donateButtonText: {
    color: '#f59e0b',
    fontSize: 18,
    fontWeight: 'bold',
  },
  exploreCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  exploreTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  exploreText: {
    color: '#c4b5fd',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  websiteButton: {
    backgroundColor: '#14b8a6',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  websiteButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default RadioScreen;
