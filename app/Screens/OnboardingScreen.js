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
  Platform, // Used for platform-specific styling (e.g., StatusBar height)
} from 'react-native';

// Get screen dimensions for responsive styling
const { width, height } = Dimensions.get('window');

// Define colors based on the image for easy customization
const Colors = {
  lightGreenBackground: '#E5F0E5', // Background color of the top section
  darkBrown: '#6B3F25',             // Color for text, button border, and arrow button
  greenish: '#85B26E',              // Highlight color for "Health State"
  progressBarActive: '#A27562',     // Color for the filled part of the progress bar
  progressBarInactive: '#D0D0D0',   // Color for the track of the progress bar
  white: '#FFFFFF',                 // Background color of the bottom card
};

const OnboardingScreen =  ({navigation}) => {
    const handleNextPress = () => {
    navigation.navigate('OnboardingTwo')
  }
  return (
    <SafeAreaView style={styles.container}>
      {/* Set the status bar style and background color */}
      <StatusBar barStyle="dark-content" backgroundColor={Colors.lightGreenBackground} />

      <Image
        source={require('../assets/meditation.png')}
        style={styles.illustration}
        resizeMode="cover" 
      />

      {/* Content Overlay for elements that sit on top of the illustration */}
      <View style={styles.contentOverlay}>
        {/* Status Bar elements (Time and Icons) */}
        <View style={styles.statusBar}>
          
          <View style={styles.iconContainer}>
          
          </View>
        </View>

        {/* "Step One" Button */}
        <TouchableOpacity style={styles.stepOneButton}>
          <Text style={styles.stepOneButtonText}>Step One</Text>
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
        <Text style={styles.mainText}>
          Personalize Your Mental{' '}
          {/* Highlighted text part */}
          <Text style={styles.highlightText}>Health State</Text> With AI
        </Text>

        {/* Circular Navigation Button */}
        <TouchableOpacity style={styles.circularButton}
        onPress={handleNextPress}
        >
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
    backgroundColor: Colors.lightGreenBackground, // Background for the entire screen below the status bar
  },
  illustration: {
    width: width,              // Image spans the full width of the screen
    height: height * 0.7,      // Image takes about 70% of screen height from the top
    position: 'absolute',      // Allows layering
    top: 0,
    left: 0,
    // 'cover' ensures the image fills the area, cropping if necessary.
    // If your image has extra padding, 'contain' might be better, but 'cover' matches the original design's feel.
    resizeMode: 'cover',
  },
  contentOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.6, // Content is primarily in the top 60% of the screen
    // Add padding for the status bar and general layout
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 10,
    paddingHorizontal: 20,
    zIndex: 1, // Ensures this content is above the illustration
    alignItems: 'center', // Center items horizontally
    justifyContent: 'flex-start', // Align items to the top
  },
  statusBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: height * 0.05, // Spacing from top elements, adjust proportionally
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.darkBrown,
  },
  iconContainer: {
    flexDirection: 'row',
  },
 
  stepOneButton: {
    borderWidth: 1.5,
    borderColor: Colors.darkBrown,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginBottom: height * 0.1, // Spacing from the illustration/bottom curve
    alignSelf: 'center', // Ensures the button is centered horizontally
  },
  stepOneButtonText: {
    fontSize: 14,
    color: Colors.darkBrown,
    fontWeight: '500',
  },
  bottomSection: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 50, // Large radius for the top-left curve
    borderTopRightRadius: 50, // Large radius for the top-right curve
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.45, // Fixed height for the white card (45% of screen height)
    paddingHorizontal: 30,
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'space-between', // Distribute content vertically within the section
    zIndex: 2, // Ensures this section is above the illustration and content overlay
    // Adjust padding for iOS devices with home indicator
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
  },
  progressBarContainer: {
    flexDirection: 'row',
    width: '80%', // Width of the entire progress bar
    height: 6,
    backgroundColor: Colors.progressBarInactive, // The inactive track color
    borderRadius: 3,
    marginBottom: 30, // Spacing below the progress bar
  },
  progressBarActive: {
    width: '30%', // Represents the filled portion (e.g., 30% progress)
    height: '100%',
    backgroundColor: Colors.progressBarActive, // Active color
    borderRadius: 3,
  },
  progressBarInactive: {
    flex: 1, // Takes the remaining space
    height: '100%',
    backgroundColor: 'transparent', // The container already provides the inactive color
  },
  mainText: {
    fontSize: 28, // Large font size
    fontWeight: 'bold',
    textAlign: 'center',
    color: Colors.darkBrown,
    lineHeight: 38, // Adjust line height for better readability
    marginBottom: 40, // Spacing below the text
  },
  highlightText: {
    color: Colors.greenish, // Color for "Health State"
  },
  circularButton: {
    width: 60,
    height: 60,
    borderRadius: 30, // Half of width/height for a perfect circle
    backgroundColor: Colors.darkBrown,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20, // Spacing above the bottom line
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
    alignSelf: 'center', // Center the line
  },
});

export default OnboardingScreen;