import React from 'react';
import { Text, View, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Logo from '../assets/logo.svg';
import "../global.css";

const { width, height } = Dimensions.get('window');

// Assuming illustration.png is the robot character
const WelcomeIllustration = require('../assets/illustration.png');

const WelcomeScreen = ({ navigation }) => {
  const handleGetStarted = () => {
    navigation.navigate('Onboarding');
  };

  const handleSigninLink = () => {
    navigation.navigate('SignIn');
  };

  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1 bg-[#FDFDF5] items-center justify-between"
      style={{
        paddingTop: insets.top + 10,
        paddingBottom: insets.bottom + 20
      }}
    >
      {/* Top Section */}
      <View className="items-center w-full px-8">
        {/* Logo */}
        <View className="mb-6">
          {typeof Logo === 'function' ? (
            <Logo width={60} height={60} />
          ) : (
            // Fallback if SVG transformer isn't working (e.g. restart needed)
            <View style={{ width: 60, height: 60, backgroundColor: '#4F3422', borderRadius: 30, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: 'white', fontWeight: 'bold' }}>MP</Text>
            </View>
          )}
        </View>

        {/* Title */}
        <Text className="text-3xl font-bold text-[#4A3B32] text-center mb-4">
          Welcome to MindPal!!
        </Text>

        {/* Subtitle */}
        <Text className="text-base text-[#666666] text-center leading-6 font-medium">
          Your mindful mental health AI companion{'\n'}for everyone, anywhere 🌿
        </Text>
      </View>

      {/* Center Illustration */}
      <View className="flex-1 justify-center items-center w-full my-4">
        <Image
          source={WelcomeIllustration}
          className="w-full h-full"
          style={{ width: width * 0.9, height: width * 0.9 }}
          resizeMode="contain"
        />
      </View>

      {/* Bottom Section */}
      <View className="w-full px-8 pb-4 items-center gap-6">
        {/* Get Started Button */}
        <TouchableOpacity
          className="w-full bg-[#4A3B32] rounded-full py-4 flex-row justify-center items-center shadow-sm active:opacity-90"
          onPress={handleGetStarted}
        >
          <Text className="text-white text-lg font-bold mr-2">Get Started</Text>
          <Text className="text-white text-xl">→</Text>
        </TouchableOpacity>

        {/* Sign In Link */}
        <Text className="text-sm text-[#4A3B32]">
          Already have an account? <Text className="text-[#FF8C42] font-bold" onPress={handleSigninLink}>Sign In.</Text>
        </Text>
      </View>
    </View>
  );
};

export default WelcomeScreen;
