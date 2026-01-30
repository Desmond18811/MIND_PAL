import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';

// Get screen dimensions for responsive styling
const { width, height } = Dimensions.get('window');

// Define colors based on the image
const Colors = {
  purpleBackground: '#D8C4E5', // Background color from the image
  darkBrown: '#6B4A3A',        // Color for text, button border, and arrow button
  white: '#FFFFFF',            // Background color of the bottom card
  progressBarActive: '#6B4A3A', // Color for the filled part of the progress bar
  progressBarInactive: '#D0D0D0', // Color for the track of the progress bar
};

const OnboardingScreenFive = ({ navigation }) => {
  const handleNextPress = () => {
    // Replace 'Home' with your target screen
    navigation.navigate('SignUp');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Set the status bar style and background color */}
      <StatusBar barStyle="dark-content" backgroundColor={Colors.purpleBackground} />

      {/* Background Illustration */}
      <Image
        source={require('../assets/supportive.png')}
        style={styles.illustration}
        resizeMode="cover"
      />

      {/* Content Overlay for status bar and step button */}
      <View style={styles.contentOverlay}>
        {/* Status Bar elements (Time and Icons) */}
        <View style={styles.statusBar}>
          
          <View style={styles.iconContainer}>
          </View>
        </View>

        {/* "Step Five" Button */}
        <TouchableOpacity style={styles.stepButton}>
          <Text style={styles.stepButtonText}>Step Five</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Section (White Card with curved top) */}
      <View style={styles.bottomSection}>
        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarActive} />
          <View style={styles.progressBarInactive} />
        </View>

        {/* Main Text Content */}
        <Text style={styles.mainText}>Loving & Supportive Community</Text>

        {/* Circular Navigation Button */}
        <TouchableOpacity style={styles.circularButton} onPress={handleNextPress}>
          <Text style={styles.arrowText}>→</Text>
        </TouchableOpacity>

        {/* Bottom Home Indicator Line */}
        <View style={styles.bottomLine} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.purpleBackground,
  },
  illustration: {
    width: width,
    height: height * 0.7,
    position: 'absolute',
    top: 0,
    left: 0,
    resizeMode: 'cover',
  },
  contentOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.6,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 10,
    paddingHorizontal: 20,
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  statusBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: height * 0.05,
  },

  iconContainer: {
    flexDirection: 'row',
  },

  stepButton: {
    borderWidth: 1.5,
    borderColor: Colors.darkBrown,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginBottom: height * 0.1,
    alignSelf: 'center',
    backgroundColor: Colors.white,
  },
  stepButtonText: {
    fontSize: 18,
    color: Colors.darkBrown,
    fontWeight: '500',
  },
  bottomSection: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.45,
    paddingHorizontal: 30,
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
  },
  progressBarContainer: {
    flexDirection: 'row',
    width: '80%',
    height: 6,
    backgroundColor: Colors.progressBarInactive,
    borderRadius: 3,
    marginBottom: 30,
  },
  progressBarActive: {
    width: '100%', // Fully filled for Step Five
    height: '100%',
    backgroundColor: Colors.progressBarActive,
    borderRadius: 3,
  },
  progressBarInactive: {
    flex: 1,
    height: '100%',
    backgroundColor: 'transparent',
  },
  mainText: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: Colors.darkBrown,
    lineHeight: 38,
    marginBottom: 40,
  },
  circularButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.darkBrown,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  arrowText: {
    fontSize: 30,
    color: Colors.white,
    fontWeight: 'bold',
  },
  bottomLine: {
    width: 100,
    height: 4,
    backgroundColor: Colors.darkBrown,
    borderRadius: 2,
    alignSelf: 'center',
  },
});

export default OnboardingScreenFive;