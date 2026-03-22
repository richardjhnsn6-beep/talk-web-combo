import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StripeProvider } from '@stripe/stripe-react-native';
import TrackPlayer from 'react-native-track-player';
import RadioScreen from './src/screens/RadioScreen';
import DonationScreen from './src/screens/DonationScreen';

const Stack = createStackNavigator();

// Register playback service
TrackPlayer.registerPlaybackService(() => require('./service.js'));

const App = () => {
  useEffect(() => {
    setupPlayer();
  }, []);

  const setupPlayer = async () => {
    try {
      await TrackPlayer.setupPlayer({
        android: {
          appKilledPlaybackBehavior: 'StopPlaybackAndRemoveNotification',
        },
      });
      
      await TrackPlayer.updateOptions({
        capabilities: [
          TrackPlayer.CAPABILITY_PLAY,
          TrackPlayer.CAPABILITY_PAUSE,
          TrackPlayer.CAPABILITY_SKIP_TO_NEXT,
          TrackPlayer.CAPABILITY_SKIP_TO_PREVIOUS,
          TrackPlayer.CAPABILITY_STOP,
        ],
        compactCapabilities: [
          TrackPlayer.CAPABILITY_PLAY,
          TrackPlayer.CAPABILITY_PAUSE,
          TrackPlayer.CAPABILITY_SKIP_TO_NEXT,
        ],
        notificationCapabilities: [
          TrackPlayer.CAPABILITY_PLAY,
          TrackPlayer.CAPABILITY_PAUSE,
          TrackPlayer.CAPABILITY_SKIP_TO_NEXT,
          TrackPlayer.CAPABILITY_SKIP_TO_PREVIOUS,
        ],
      });
      
      console.log('✅ Track Player setup complete');
    } catch (error) {
      console.log('Track Player setup error:', error);
    }
  };

  return (
    <StripeProvider
      publishableKey="pk_test_51QkZS2RvPlSC4fzHrLfPINBCe6jVxFkqF2e92y7VqnDkwjbLs8FqxnlWrLaBa4Ny0fRDIFLZqUfbJXL1aBKaBL7k00yIBhZrwx"
      merchantIdentifier="merchant.com.rjhnsn12.radio"
    >
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: '#7c3aed',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen 
            name="Radio" 
            component={RadioScreen}
            options={{ title: '🎙️ RJHNSN12 Radio' }}
          />
          <Stack.Screen 
            name="Donation" 
            component={DonationScreen}
            options={{ title: '❤️ Support Us' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </StripeProvider>
  );
};

export default App;
