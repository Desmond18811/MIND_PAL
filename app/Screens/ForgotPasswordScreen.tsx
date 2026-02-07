import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import "../global.css";

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ForgotPasswordScreen = ({ navigation }: { navigation: any }) => {
  const insets = useSafeAreaInsets();
  const [selectedMethod, setSelectedMethod] = useState<'2fa' | 'password' | 'google'>('password');
  const [loading, setLoading] = useState(false);

  const handleSendPassword = async () => {
    setLoading(true);
    try {
      // Simulate API call
      setTimeout(() => {
        navigation.navigate('OTPVerification');
        setLoading(false);
      }, 1500);
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Failed to send reset instructions');
    }
  };

  const methods = [
    {
      id: '2fa',
      title: 'Use 2FA',
      icon: 'lock-closed',
      color: '#A8C789', // Greenish
      bgColor: '#E6E8D6', // Light Green
    },
    {
      id: 'password',
      title: 'Password',
      icon: 'key', // Using key or similar
      color: '#4A3B32', // Brown
      bgColor: '#EFE5DA', // Light Beige
    },
    {
      id: 'google',
      title: 'Google Authenticator',
      icon: 'logo-google',
      color: '#A8C789',
      bgColor: '#E6E8D6',
    },
  ];

  return (
    <View className="flex-1 bg-[#F9F9F9]">
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Header with Back Button */}
      <View style={{ paddingTop: insets.top + 10, paddingHorizontal: 24 }} className="flex-row items-center justify-between mb-6">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-12 h-12 rounded-full border border-gray-200 bg-white items-center justify-center"
        >
          <Ionicons name="chevron-back" size={24} color="#4A3B32" />
        </TouchableOpacity>
        <View />
        <View className="w-12" />
      </View>


      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-3xl font-[Urbanist-Bold] text-[#4A3B32] mb-4 text-left">Forgot Password</Text>
        <Text className="text-base text-[#4A3B32] text-left opacity-70 leading-6 mb-10 font-[Urbanist-Medium]">
          Select contact details where you want to reset your password.
        </Text>

        {/* Options */}
        <View className="gap-6 mb-10">
          {/* 2FA Option */}
          <TouchableOpacity
            onPress={() => setSelectedMethod('2fa')}
            className={`flex-row items-center p-4 rounded-[30px] bg-white border-2 ${selectedMethod === '2fa' ? 'border-[#9BB168]' : 'border-transparent'} shadow-sm`}
            style={{ height: 100 }}
          >
            <View className="w-16 h-16 rounded-full bg-[#9BB168] justify-center items-center mr-6">
              <Ionicons name="lock-closed" size={30} color="#4A3B32" />
            </View>
            <Text className="text-xl font-[Urbanist-Bold] text-[#4A3B32]">Use 2FA</Text>
          </TouchableOpacity>


          {/* Password Option (Selected Style mockup based on image) */}
          <TouchableOpacity
            onPress={() => setSelectedMethod('password')}
            className={`flex-row items-center p-4 rounded-[30px] bg-white border-2 ${selectedMethod === 'password' ? 'border-[#9BB168]' : 'border-transparent'} shadow-sm`}
            style={{ height: 100 }}
          >
            <View className="w-16 h-16 rounded-full bg-[#E6E8D6] justify-center items-center mr-6 relative overflow-hidden">
              {/* Visual styling to mimic the quadrant circle in image if needed, for now standard icon */}
              <View className="absolute top-0 right-0 w-8 h-8 bg-[#9BB168]" />
              <View className="absolute bottom-0 left-0 w-8 h-8 bg-[#4A3B32]" />
            </View>
            <Text className="text-xl font-[Urbanist-Bold] text-[#4A3B32]">Password</Text>
          </TouchableOpacity>

          {/* Google Auth Option */}
          <TouchableOpacity
            onPress={() => setSelectedMethod('google')}
            className={`flex-row items-center p-4 rounded-[30px] bg-white border-2 ${selectedMethod === 'google' ? 'border-[#9BB168]' : 'border-transparent'} shadow-sm`}
            style={{ height: 100 }}
          >
            <View className="w-16 h-16 rounded-full bg-[#E6E8D6] justify-center items-center mr-6 relative overflow-hidden">
              {/* Visual styling to mimic the hourglass/triangle shape in image */}
              <View className="absolute top-0 w-full h-1/2 bg-[#9BB168] opacity-80" style={{ transform: [{ rotate: '45deg' }] }} />
              <View className="absolute bottom-0 w-full h-1/2 bg-[#4A3B32] opacity-100" style={{ transform: [{ rotate: '45deg' }, { translateY: 10 }] }} />
            </View>
            <Text className="text-xl font-[Urbanist-Bold] text-[#4A3B32] flex-1">Google Authenticator</Text>
          </TouchableOpacity>

        </View>


        <TouchableOpacity
          className="bg-[#4A3B32] rounded-full py-5 flex-row justify-center items-center shadow-md active:opacity-90 mt-4"
          onPress={handleSendPassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Text className="text-white text-lg font-[Urbanist-Bold] mr-2">Send Password</Text>
              <Ionicons name="lock-closed-outline" size={20} color="white" />
            </>
          )}
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
};

export default ForgotPasswordScreen;