import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Dimensions,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const colors = {
    primaryGreen: '#8EBA6B',
    darkBrown: '#6D482F',
    lightBeige: '#F3EDE4',
    textDark: '#333333',
    textLight: '#FFFFFF',
    borderColor: '#8DC63F',
    placeholderText: '#A0A0A0',
    lightGray: '#E0E0E0',
    successGreen: '#4CAF50',
};

const OTPVerificationScreen = ({ navigation, route }) => {
    const [otp, setOtp] = useState(['', '', '', '']);
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const inputRefs = useRef([]);

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

    const handleOtpChange = (value, index) => {
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 3) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e, index) => {
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
        // Navigate to next screen
        navigation.navigate('FingerprintSetup', {
            ...route.params,
            otpVerified: true,
        });
    };

    const canContinue = otp.every(digit => digit !== '');

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.lightBeige} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="chevron-back" size={24} color={colors.darkBrown} />
                </TouchableOpacity>
                <View style={styles.stepIndicator}>
                    <Text style={styles.stepText}>OTP Setup</Text>
                    <Text style={styles.stepNumber}>Step 3/6</Text>
                </View>
            </View>

            {/* Illustration */}
            <View style={styles.illustrationContainer}>
                <View style={styles.illustrationBox}>
                    <Ionicons name="shield-checkmark" size={60} color={colors.primaryGreen} />
                </View>
            </View>

            <View style={styles.content}>
                <Text style={styles.title}>Enter 4-Digit OTP Code</Text>
                <Text style={styles.subtitle}>
                    We sent a 4-digit OTP code to your email address. Please enter the code below.
                </Text>

                {/* OTP Inputs */}
                <View style={styles.otpContainer}>
                    {otp.map((digit, index) => (
                        <TextInput
                            key={index}
                            ref={ref => inputRefs.current[index] = ref}
                            style={[
                                styles.otpInput,
                                digit && styles.otpInputFilled,
                            ]}
                            value={digit}
                            onChangeText={(value) => handleOtpChange(value.replace(/[^0-9]/g, ''), index)}
                            onKeyPress={(e) => handleKeyPress(e, index)}
                            keyboardType="number-pad"
                            maxLength={1}
                            selectTextOnFocus
                        />
                    ))}
                </View>

                {/* Timer */}
                <View style={styles.timerContainer}>
                    <Ionicons name="time-outline" size={20} color={colors.placeholderText} />
                    <Text style={styles.timerText}>
                        {timer > 0 ? `Resend in ${timer}s` : 'You can resend now'}
                    </Text>
                </View>

                {/* Resend Button */}
                <TouchableOpacity
                    style={[styles.resendButton, !canResend && styles.resendButtonDisabled]}
                    onPress={handleResend}
                    disabled={!canResend}
                >
                    <Text style={[styles.resendText, !canResend && styles.resendTextDisabled]}>
                        Resend OTP
                    </Text>
                </TouchableOpacity>

                {/* Verify Button */}
                <TouchableOpacity
                    style={[styles.continueButton, !canContinue && styles.continueButtonDisabled]}
                    onPress={handleVerify}
                    disabled={!canContinue}
                >
                    <Text style={styles.continueButtonText}>Confirm</Text>
                    <Ionicons name="arrow-forward" size={20} color={colors.textLight} />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.lightBeige,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.textLight,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    stepIndicator: {
        flex: 1,
        alignItems: 'center',
    },
    stepText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.darkBrown,
    },
    stepNumber: {
        fontSize: 12,
        color: colors.placeholderText,
        marginTop: 2,
    },
    illustrationContainer: {
        alignItems: 'center',
        paddingVertical: 30,
    },
    illustrationBox: {
        width: 120,
        height: 120,
        borderRadius: 20,
        backgroundColor: colors.textLight,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.darkBrown,
        textAlign: 'center',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 14,
        color: colors.placeholderText,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 30,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 15,
        marginBottom: 30,
    },
    otpInput: {
        width: 60,
        height: 60,
        borderRadius: 15,
        backgroundColor: colors.textLight,
        borderWidth: 2,
        borderColor: colors.lightGray,
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        color: colors.darkBrown,
    },
    otpInputFilled: {
        borderColor: colors.primaryGreen,
        backgroundColor: '#E8F5E8',
    },
    timerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        marginBottom: 15,
    },
    timerText: {
        fontSize: 14,
        color: colors.placeholderText,
    },
    resendButton: {
        alignItems: 'center',
        marginBottom: 30,
    },
    resendButtonDisabled: {
        opacity: 0.5,
    },
    resendText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.primaryGreen,
    },
    resendTextDisabled: {
        color: colors.placeholderText,
    },
    continueButton: {
        backgroundColor: colors.darkBrown,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        borderRadius: 25,
        marginTop: 'auto',
        marginBottom: 30,
        gap: 10,
    },
    continueButtonDisabled: {
        opacity: 0.5,
    },
    continueButtonText: {
        color: colors.textLight,
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default OTPVerificationScreen;
