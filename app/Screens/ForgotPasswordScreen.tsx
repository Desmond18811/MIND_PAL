import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import "../global.css";

const ForgotPasswordScreen = ({ navigation }: { navigation: any }) => {
  const insets = useSafeAreaInsets();
  const [resetMethod, setResetMethod] = useState<'2fa' | 'password'>('password'); // Defaulting to email ('password' refers to email in this context based on UI)
  const [loading, setLoading] = useState(false);

  const handleSendPassword = async () => {
    setLoading(true);
    try {
      // Simulate API call to send OTP/Link
      setTimeout(() => {
        // Navigation to verification screen
        navigation.navigate('OTPVerification');
        setLoading(false);
      }, 1500);
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Failed to send reset instructions');
    }
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Green Header */}
      <View
        className="bg-[#A8C789] w-full items-center pt-8 pb-12 rounded-b-[40px] absolute top-0 z-0"
        style={{ paddingTop: insets.top + 20, height: 220 }}
      >
        <View className="w-full px-6 flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
          >
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-lg font-bold">Forgot Password</Text>
          <View className="w-10" />
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop: 180, paddingHorizontal: 24, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="bg-white rounded-t-[30px] pt-6">
          <Text className="text-3xl font-bold text-[#4A3B32] mb-4 text-center">Forgot Password</Text>
          <Text className="text-base text-[#4A3B32] text-center opacity-70 leading-6 mb-10">
            Select which contact details should we use to reset your password
          </Text>

          {/* Options */}
          <View className="gap-5 mb-10">
            <TouchableOpacity
              className={`flex-row items-center p-4 rounded-[20px] border-2 ${resetMethod === '2fa' ? 'border-[#8EAA79] bg-[#F5FAF2]' : 'border-[#E0E0E0] bg-white'}`}
              onPress={() => setResetMethod('2fa')}
              activeOpacity={0.9}
            >
              <View className={`w-14 h-14 rounded-full justify-center items-center mr-4 ${resetMethod === '2fa' ? 'bg-[#D3E5CC]' : 'bg-gray-100'}`}>
                <Ionicons name="chatbubble-ellipses" size={24} color={resetMethod === '2fa' ? '#4A3B32' : '#A0A0A0'} />
              </View>
              <View className="flex-1">
                <Text className="text-xs text-[#8EAA79] font-semibold mb-0.5">via SMS:</Text>
                <Text className="text-base font-bold text-[#4A3B32]">+1 111 ******99</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-row items-center p-4 rounded-[20px] border-2 ${resetMethod === 'password' ? 'border-[#8EAA79] bg-[#F5FAF2]' : 'border-[#E0E0E0] bg-white'}`}
              onPress={() => setResetMethod('password')}
              activeOpacity={0.9}
            >
              <View className={`w-14 h-14 rounded-full justify-center items-center mr-4 ${resetMethod === 'password' ? 'bg-[#D3E5CC]' : 'bg-gray-100'}`}>
                <Ionicons name="mail" size={24} color={resetMethod === 'password' ? '#4A3B32' : '#A0A0A0'} />
              </View>
              <View className="flex-1">
                <Text className="text-xs text-[#8EAA79] font-semibold mb-0.5">via Email:</Text>
                <Text className="text-base font-bold text-[#4A3B32]">pri...ya@gmail.com</Text>
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            className="bg-[#4A3B32] rounded-full py-4 flex-row justify-center items-center shadow-md active:opacity-90"
            onPress={handleSendPassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text className="text-white text-lg font-bold mr-2">Continue</Text>
                <Ionicons name="arrow-forward" size={20} color="white" />
              </>
            )}
          </TouchableOpacity>

        </View>
      </ScrollView>
    </View>
  );
};

export default ForgotPasswordScreen;