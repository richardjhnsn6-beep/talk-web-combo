import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig.extra?.apiUrl || 'https://talk-web-combo.preview.emergentagent.com';

const DonationScreen = ({ navigation }) => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [customAmount, setCustomAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDonation = async (amount) => {
    try {
      setLoading(true);

      // Create payment intent on backend
      const response = await fetch(`${API_URL}/api/payments/v1/donation/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amount,
          origin_url: 'mobile-app',
          donor_name: 'Mobile App Supporter',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create donation session');
      }

      const data = await response.json();

      if (data.url) {
        // Redirect to Stripe checkout
        await Linking.openURL(data.url);
      }

      setLoading(false);
      Alert.alert('Thank You!', 'Thank you for your generous donation!');
      navigation.goBack();
    } catch (error) {
      console.error('Donation error:', error);
      setLoading(false);
      Alert.alert('Error', 'Could not process donation. Please try again.');
    }
  };

  const handleCustomDonation = () => {
    const amount = parseFloat(customAmount);
    if (isNaN(amount) || amount < 1) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount (minimum $1)');
      return;
    }
    handleDonation(amount);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7c3aed" />
        <Text style={styles.loadingText}>Processing...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Support True Knowledge</Text>
        <Text style={styles.subtitle}>
          Your donation helps keep biblical wisdom and great music flowing 24/7!
        </Text>

        {/* Preset Amounts */}
        <View style={styles.amountContainer}>
          <TouchableOpacity
            style={styles.amountButton}
            onPress={() => handleDonation(5)}
          >
            <Text style={styles.amountText}>$5</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.amountButton}
            onPress={() => handleDonation(10)}
          >
            <Text style={styles.amountText}>$10</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.amountButton}
            onPress={() => handleDonation(25)}
          >
            <Text style={styles.amountText}>$25</Text>
          </TouchableOpacity>
        </View>

        {/* Custom Amount */}
        <View style={styles.customContainer}>
          <Text style={styles.customLabel}>Custom Amount</Text>
          <View style={styles.customInputRow}>
            <Text style={styles.dollarSign}>$</Text>
            <TextInput
              style={styles.customInput}
              value={customAmount}
              onChangeText={setCustomAmount}
              placeholder="Enter amount"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
            />
          </View>
          
          <TouchableOpacity
            style={styles.customButton}
            onPress={handleCustomDonation}
          >
            <Text style={styles.customButtonText}>Donate Custom Amount</Text>
          </TouchableOpacity>
        </View>

        {/* Info */}
        <Text style={styles.info}>
          One-time donation • Secure payment via Stripe
        </Text>
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
    fontSize: 16,
    marginTop: 16,
  },
  content: {
    padding: 24,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    color: '#c4b5fd',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  amountButton: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 16,
    marginHorizontal: 4,
    borderRadius: 12,
    alignItems: 'center',
  },
  amountText: {
    color: '#f59e0b',
    fontSize: 20,
    fontWeight: 'bold',
  },
  customContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  customLabel: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  customInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  dollarSign: {
    color: '#374151',
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 8,
  },
  customInput: {
    flex: 1,
    color: '#374151',
    fontSize: 18,
    paddingVertical: 12,
  },
  customButton: {
    backgroundColor: '#10b981',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  customButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  info: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default DonationScreen;
