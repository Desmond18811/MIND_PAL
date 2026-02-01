
import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const WelcomeIllustration = require('../assets/illustration.png');

const WelcomeScreen = ({ navigation }) => {
  const handleGetStarted = () => {
    navigation.navigate('Onboarding');
  };

  const handleSigninLink = () => {
    navigation.navigate('SignIn');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Icon */}
      <View>
        <Text style={styles.logo}>🍃</Text>
      </View>

      {/* Main Content */}
      <View style={styles.contentContainer}>
        <Text style={styles.mainTitle}>Welcome to </Text>
        <Text style={styles.highlightTitle}>MINDPAL !!!!!</Text>
        <Text style={styles.subtitle}>
          Your mindful mental health AI companion{'\n'}for everyone, anywhere 🌿
        </Text>

        {/* Illustration */}
        <Image
          source={WelcomeIllustration}
          style={styles.illustration}
          resizeMode="contain"
        />
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavContainer}>
        <TouchableOpacity style={styles.getStartedButton} onPress={handleGetStarted}>
          <Text style={styles.getStartedButtonText}>Get Started</Text>
          <Text style={styles.arrowIcon}>→</Text>
        </TouchableOpacity>
        <Text style={styles.signInText}>
          Already have an account? <Text style={styles.signInLink} onPress={handleSigninLink}>Sign In.</Text>
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5DC',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: height * 0.05,
  },
  logo: {
    fontSize: 64,
    color: '#8B6A56',
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingHorizontal: width * 0.08,
  },
  mainTitle: {
    fontSize: 28,
    color: '#4F3422',
    textAlign: 'center',
    marginBottom: 5,
  },
  highlightTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#4F3422',
  },
  subtitle: {
    fontSize: 16,
    color: '#4F3422',
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 10,
    marginBottom: height * 0.05,
  },
  illustration: {
    width: width * 0.8,
    height: height * 0.35,
    marginBottom: height * 0.02,
  },
  bottomNavContainer: {
    width: '100%',
    paddingHorizontal: width * 0.08,
    paddingBottom: height * 0.03,
    alignItems: 'center',
  },
  getStartedButton: {
    flexDirection: 'row',
    backgroundColor: '#4F3422',
    borderRadius: 30,
    width: '100%',
    paddingVertical: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  getStartedButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
  arrowIcon: {
    color: 'white',
  },
  signInText: {
    fontSize: 15,
    color: '#4F3422',
    marginBottom: 15,
  },
  signInLink: {
    color: 'orange',
    fontWeight: 'bold',
  },
});

export default WelcomeScreen;
