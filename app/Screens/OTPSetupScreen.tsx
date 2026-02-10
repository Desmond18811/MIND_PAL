import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StatusBar,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import "../global.css";

const OTPSetupScreen = ({ navigation }: { navigation: any }) => {
    const [phoneNumber, setPhoneNumber] = useState('');

    return (
        <View className="flex-1 bg-[#FBFBF9]">
            <StatusBar barStyle="dark-content" backgroundColor="#FBFBF9" />
            <SafeAreaView className="flex-1 px-6">

                {/* Header */}
                <View className="flex-row items-center mt-4">
                    <TouchableOpacity
                        className="w-10 h-10 rounded-full border border-[#E8D5B7] justify-center items-center"
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="chevron-back" size={24} color="#4A3B32" />
                    </TouchableOpacity>
                    <Text className="text-xl font-[Urbanist-Bold] text-[#4A3B32] ml-4">OTP Setup</Text>
                </View>

                {/* Illustration Area */}
                <View className="items-center justify-center h-[300px] my-4">
                    {/* Placeholder for Illustration showing shield/security */}
                    <View className="w-64 h-64 bg-[#FFF3E0] rounded-full justify-center items-center relative">
                        <Ionicons name="shield-checkmark" size={120} color="#9BB168" />
                        {/* Decorative stars */}
                        <Ionicons name="star" size={30} color="#F1C40F" style={{ position: 'absolute', top: 20, right: 20 }} />
                        <Ionicons name="star" size={20} color="#F1C40F" style={{ position: 'absolute', bottom: 40, left: 10 }} />
                    </View>
                </View>

                <View className="items-center mb-8">
                    <Text className="text-2xl font-[Urbanist-Bold] text-[#4A3B32] mb-2">OTP Verification</Text>
                    <Text className="text-center text-[#8B7B6B] font-[Urbanist-Medium]">
                        We will send a one time SMS message. Carrier rates may apply.
                    </Text>
                </View>

                {/* Phone Input */}
                <View className="flex-row items-center bg-[#F5F5F5] border border-[#9BB168] rounded-[30px] px-4 py-4 mb-8">
                    <TouchableOpacity className="flex-row items-center mr-3 pr-3 border-r border-[#D3C1B0]">
                        {/* Mock US Flag/Code */}
                        <Text className="text-2xl mr-2">🇺🇸</Text>
                        <Ionicons name="chevron-down" size={16} color="#4A3B32" />
                    </TouchableOpacity>
                    <Text className="text-lg font-[Urbanist-Bold] text-[#4A3B32] mr-2">(+1)</Text>
                    <TextInput
                        className="flex-1 text-lg font-[Urbanist-Bold] text-[#4A3B32]"
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        placeholder="234-567-89"
                        keyboardType="phone-pad"
                    />
                    <Ionicons name="phone-portrait-outline" size={24} color="#4A3B32" />
                </View>

                {/* Send OTP Button */}
                <TouchableOpacity
                    className="bg-[#4A3B32] flex-row items-center justify-center py-4 rounded-full mt-auto mb-10"
                    onPress={() => {
                        navigation.navigate('OTPVerification');
                    }}
                >
                    <Text className="text-white text-lg font-[Urbanist-Bold] mr-2">Send OTP</Text>
                    <Ionicons name="arrow-forward" size={20} color="white" />
                </TouchableOpacity>

            </SafeAreaView>
        </View>
    );
};

export default OTPSetupScreen;
