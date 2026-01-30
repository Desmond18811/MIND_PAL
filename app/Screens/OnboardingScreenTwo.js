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

const { width, height } = Dimensions.get('window');

// Define colors specific to this screen's design
const ColorsTwo = {
  lightOrangeBackground: '#F8E9DE', // Background color of the top section
  darkBrown: '#6B3F25',             // Color for text, button border, and arrow button
  highlightOrange: '#EF8A2C',       // Highlight color for "Intelligent"
  progressBarActive: '#A27562',     // Color for the filled part of the progress bar
  progressBarInactive: '#D0D0D0',   // Color for the track of the progress bar
  white: '#FFFFFF',                 // Background color of the bottom card
};

const OnboardingScreenTwo = ({ navigation }) => {
  // Function to navigate to the next screen (e.g., OnboardingScreenThree)
  const handleNextPress = () => {
  
     navigation.navigate('OnboardingThree');
  };

  return (
    <SafeAreaView style={styles.container}>
     
      <StatusBar barStyle="dark-content" backgroundColor={ColorsTwo.lightOrangeBackground} />

      <Image
        source={require('../assets/moodtracking.png')} // <<<<<< IMPORTANT: Replace with your image asset path
        style={styles.illustration}
        resizeMode="cover" // 'cover' fills the area, cropping if aspect ratio doesn't match
      />

      {/* Content Overlay for elements that sit on top of the illustration */}
      <View style={styles.contentOverlay}>
        {/* Status Bar elements (Time and Icons) */}
       

        {/* "Step Two" Button */}
        <TouchableOpacity style={styles.stepTwoButton}>
          <Text style={styles.stepTwoButtonText}>Step Two</Text>
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
          <Text style={styles.highlightText}>Intelligent</Text> Mood Tracking{' '}
          {'&'} AI Emotion Insights
        </Text>

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
    backgroundColor: ColorsTwo.lightOrangeBackground, // Background for the entire screen below the status bar
  },
  illustration: {
    width: width,              
    height: height * 0.7,      // Image takes about 70% of screen height from the top
    position: 'absolute',      // Allows layering
    top: 0,
    left: 0,
    resizeMode: 'cover',
  },
  contentOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.6, // Content is primarily in the top 60% of the screen
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 10,
    paddingHorizontal: 20,
    zIndex: 1, // Ensures this content is above the illustration
    alignItems: 'center', // Center items horizontally
    justifyContent: 'flex-start', // Align items to the top
  },
  stepTwoButton: {
    borderWidth: 1.5,
    borderColor: ColorsTwo.darkBrown,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginBottom: height * 0.1, // Spacing from the illustration/bottom curve
    alignSelf: 'center', // Ensures the button is centered horizontally
  },
  stepTwoButtonText: {
    fontSize: 14,
    color: ColorsTwo.darkBrown,
    fontWeight: '500',
  },
  bottomSection: {
    backgroundColor: ColorsTwo.white,
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
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
  },
  progressBarContainer: {
    flexDirection: 'row',
    width: '80%', // Width of the entire progress bar
    height: 6,
    backgroundColor: ColorsTwo.progressBarInactive, // The inactive track color
    borderRadius: 3,
    marginBottom: 30, // Spacing below the progress bar
  },
  progressBarActive: {
    width: '60%', // Represents the filled portion (e.g., 60% progress for Step Two)
    height: '100%',
    backgroundColor: ColorsTwo.progressBarActive, // Active color
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
    color: ColorsTwo.darkBrown,
    lineHeight: 38, // Adjust line height for better readability
    marginBottom: 40, // Spacing below the text
  },
  highlightText: {
    color: ColorsTwo.highlightOrange, // Color for "Intelligent"
  },
  circularButton: {
    width: 60,
    height: 60,
    borderRadius: 30, // Half of width/height for a perfect circle
    backgroundColor: ColorsTwo.darkBrown,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20, // Spacing above the bottom line
  },
  arrowText: {
    fontSize: 30,
    color: ColorsTwo.white,
    fontWeight: 'bold',
  },
  bottomLine: {
    width: 100,
    height: 4,
    backgroundColor: ColorsTwo.darkBrown,
    borderRadius: 2,
    alignSelf: 'center', // Center the line
  },
});

export default OnboardingScreenTwo;