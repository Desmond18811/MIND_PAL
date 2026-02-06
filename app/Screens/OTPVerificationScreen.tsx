import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StatusBar,
    Alert,
    KeyboardAvoidingView,
    ScrollView,
    Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import "../global.css";

const OTPVerificationScreen = ({ navigation, route }) => {
    const insets = useSafeAreaInsets();
    const [otp, setOtp] = useState(['', '', '', '']);
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const inputRefs = useRef<Array<TextInput | null>>([]);

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer(prev => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        } else {
            setCanResend(true);
        }
    }, [timer]);

    const handleOtpChange = (value: string, index: number) => {
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 3) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleResend = () => {
        if (!canResend) return;
        setTimer(60);
        setCanResend(false);
        Alert.alert('OTP Sent', 'A new OTP has been sent to your email.');
    };

    const handleVerify = () => {
        const otpString = otp.join('');
        if (otpString.length !== 4) {
            Alert.alert('Invalid OTP', 'Please enter the complete 4-digit OTP.');
            return;
        }
        // Navigate to Reset Password if it's for pw reset, or Home if signup verification
        // For this flow (auth), let's assume it leads to ResetPassword
        navigation.navigate('ResetPassword');
    };

    const canContinue = otp.every(digit => digit !== '');

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
                    <Text className="text-white text-lg font-bold">Verification</Text>
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
                    <View className="bg-white rounded-t-[30px] pt-6 items-center">
                        <Text className="text-3xl font-bold text-[#4A3B32] mb-4 text-center">Enter 4-Digit OTP Code</Text>
                        <Text className="text-base text-[#4A3B32] text-center opacity-70 leading-6 mb-10 px-4">
                            We sent a 4-digit OTP code to your email address. Please enter the code below.
                        </Text>

                        {/* OTP Inputs */}
                        <View className="flex-row justify-center gap-4 mb-10">
                            {otp.map((digit, index) => (
                                <TextInput
                                    key={index}
                                    ref={ref => inputRefs.current[index] = ref}
                                    className={`w-14 h-14 rounded-[20px] border-2 text-2xl font-bold text-center text-[#4A3B32] ${digit ? 'border-[#8EAA79] bg-[#F5FAF2]' : 'border-[#E0E0E0] bg-white'}`}
                                    value={digit}
                                    onChangeText={(value) => handleOtpChange(value.replace(/[^0-9]/g, ''), index)}
                                    onKeyPress={(e) => handleKeyPress(e, index)}
                                    keyboardType="number-pad"
                                    maxLength={1}
                                    selectTextOnFocus
                                    // Add shadow slightly
                                    style={{
                                        shadowColor: "#000",
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.05,
                                        shadowRadius: 3,
                                        elevation: 2
                                    }}
                                />
                            ))}
                        </View>

                        {/* Timer */}
                        <View className="flex-row justify-center items-center gap-2 mb-8">
                            <Ionicons name="time-outline" size={20} color="#8EAA79" />
                            <Text className="text-sm text-[#4A3B32] font-medium">
                                {timer > 0 ? `Resend in ${timer}s` : 'You can resend now'}
                            </Text>
                        </View>

                        {/* Resend Button */}
                        <TouchableOpacity
                            className={`items-center mb-8 py-2 px-4 ${!canResend ? 'opacity-50' : ''}`}
                            onPress={handleResend}
                            disabled={!canResend}
                        >
                            <Text className={`text-base font-bold ${canResend ? 'text-[#8EAA79]' : 'text-[#A0A0A0]'}`}>
                                Resend OTP
                            </Text>
                        </TouchableOpacity>

                        {/* Verify Button */}
                        <TouchableOpacity
                            className={`bg-[#4A3B32] w-full rounded-full py-4 flex-row justify-center items-center shadow-md active:opacity-90 ${!canContinue ? 'opacity-70' : ''}`}
                            onPress={handleVerify}
                            disabled={!canContinue}
                        >
                            <Text className="text-white text-lg font-bold mr-2">Confirm</Text>
                            <Ionicons name="arrow-forward" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

export default OTPVerificationScreen;
