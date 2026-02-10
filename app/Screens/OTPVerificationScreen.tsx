import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import "../global.css";

const OTPVerificationScreen = ({ navigation }: { navigation: any }) => {
    const [code, setCode] = useState(['', '', '', '']); // 4 digits

    // Mock Invalid State as shown in screenshot
    const [isInvalid, setIsInvalid] = useState(true);

    const handleCodeChange = (text: string, index: number) => {
        const newCode = [...code];
        newCode[index] = text;
        setCode(newCode);
        // Auto focus logic would go here in real implementation with refs
    };

    return (
        <View className="flex-1 bg-[#FBFBF9]">
            <StatusBar barStyle="dark-content" backgroundColor="#FBFBF9" />
            <SafeAreaView className="flex-1 px-6">

                {/* Header */}
                <View className="flex-row items-center mt-4 mb-20">
                    <TouchableOpacity
                        className="w-10 h-10 rounded-full border border-[#E8D5B7] justify-center items-center"
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="chevron-back" size={24} color="#4A3B32" />
                    </TouchableOpacity>
                    <Text className="text-xl font-[Urbanist-Bold] text-[#4A3B32] ml-4">OTP Setup</Text>
                </View>

                <View className="items-center mb-8">
                    <Text className="text-2xl font-[Urbanist-Bold] text-[#4A3B32] mb-4">Enter 4 digit OTP Code</Text>
                    <Text className="text-center text-[#8B7B6B] font-[Urbanist-Medium] px-4">
                        Enter the verification code we just sent to your number.
                    </Text>
                </View>

                {/* Code Input */}
                <View className="flex-row justify-center space-x-4 mb-8">
                    {[0, 1, 2, 3].map((digit, index) => {
                        const val = index === 0 ? '9' : index === 1 ? '5' : '0'; // Mock values from screenshot
                        const isFocused = index === 1; // Mock focus

                        return (
                            <View
                                key={index}
                                className={`w-16 h-20 rounded-[30px] justify-center items-center border ${index === 1 ? 'bg-[#9BB168] border-[#9BB168]' : 'bg-white border-[#F0F0F0] shadow-sm'}`}
                            >
                                <Text className={`text-3xl font-[Urbanist-Bold] ${index === 1 ? 'text-white' : 'text-[#B0B0B0]'}`}>
                                    {val}
                                </Text>
                            </View>
                        );
                    })}
                </View>

                {/* Invalid Warning */}
                {isInvalid && (
                    <View className="bg-[#FFF3E0] border border-[#F4A460] rounded-[20px] p-4 flex-row items-center justify-center mb-8">
                        <Ionicons name="warning" size={20} color="#E67E22" />
                        <Text className="text-[#4A3B32] font-[Urbanist-Bold] ml-2">Invalid OTP! Try Again!</Text>
                    </View>
                )}

                {/* Continue Button */}
                <TouchableOpacity
                    className="bg-[#4A3B32] flex-row items-center justify-center py-4 rounded-full mt-auto mb-10"
                    onPress={() => {
                        navigation.navigate('FingerprintSetup');
                    }}
                >
                    <Text className="text-white text-lg font-[Urbanist-Bold] mr-2">Continue</Text>
                    <Ionicons name="arrow-forward" size={20} color="white" />
                </TouchableOpacity>

                <TouchableOpacity className="items-center mb-6">
                    <Text className="text-[#8B7B6B] font-[Urbanist-Medium]">
                        Didn't receive the OTP? <Text className="text-[#E67E22] font-[Urbanist-Bold]">Re-send.</Text>
                    </Text>
                </TouchableOpacity>

            </SafeAreaView>
        </View>
    );
};

export default OTPVerificationScreen;
