import { registerRootComponent } from 'expo';
import TrackPlayer from 'react-native-track-player';
import App from './App';

// Register the playback service for background audio
TrackPlayer.registerPlaybackService(() => require('./service.js'));

// Register the main component
registerRootComponent(App);
