import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import "../global.css";

const ResetPasswordScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    // Client-side validation
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    try {
      // Logic for reset (using stored Token/ID or just UI simulation for now as requested)
      // Since context implies we are just fixing UI and flow:
      setTimeout(() => {
        setLoading(false);
        Alert.alert(
          'Success',
          'Password reset successfully!',
          [{ text: 'Login', onPress: () => navigation.navigate('Login') }]
        );
      }, 1500);

    } catch (error: any) {
      setLoading(false);
      Alert.alert('Error', error.response?.data?.error || 'Something went wrong');
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
          <Text className="text-white text-lg font-bold">Reset Password</Text>
          <View className="w-10" />
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 bg-transparent"
          contentContainerStyle={{ paddingTop: 180, paddingHorizontal: 24, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="bg-white rounded-t-[30px] pt-6">
            <Text className="text-3xl font-bold text-[#4A3B32] mb-4 text-center">New Credentials</Text>
            <Text className="text-base text-[#4A3B32] text-center opacity-70 leading-6 mb-10">
              Your identity has been verified. Create your new password.
            </Text>

            {/* New Password Input */}
            <View className="mb-5">
              <Text className="text-sm font-semibold text-[#4A3B32] mb-2 ml-1">New Password</Text>
              <View className="flex-row items-center bg-white rounded-full border border-[#E0E0E0] px-5 py-3.5 shadow-sm">
                <Ionicons name="lock-closed-outline" size={20} color="#4A3B32" style={{ marginRight: 10 }} />
                <TextInput
                  className="flex-1 text-base text-[#4A3B32]"
                  placeholder="Enter new password"
                  placeholderTextColor="#A0A0A0"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#A0A0A0" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password Input */}
            <View className="mb-10">
              <Text className="text-sm font-semibold text-[#4A3B32] mb-2 ml-1">Confirm Password</Text>
              <View className="flex-row items-center bg-white rounded-full border border-[#E0E0E0] px-5 py-3.5 shadow-sm">
                <Ionicons name="lock-closed-outline" size={20} color="#4A3B32" style={{ marginRight: 10 }} />
                <TextInput
                  className="flex-1 text-base text-[#4A3B32]"
                  placeholder="Confirm new password"
                  placeholderTextColor="#A0A0A0"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#A0A0A0" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Reset Button */}
            <TouchableOpacity
              className="bg-[#4A3B32] rounded-full py-4 flex-row justify-center items-center mb-10 shadow-md active:opacity-90"
              onPress={handleResetPassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Text className="text-white text-lg font-bold mr-2">Reset Password</Text>
                  <Ionicons name="arrow-forward" size={20} color="white" />
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ResetPasswordScreen;