import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StatusBar,
    Animated,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import "../global.css";

const { height } = Dimensions.get('window');

const FingerprintSetupScreen = ({ navigation }: { navigation: any }) => {
    const scanLinePosition = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Continuous scanning animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(scanLinePosition, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(scanLinePosition, {
                    toValue: 0,
                    duration: 2000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const translateY = scanLinePosition.interpolate({
        inputRange: [0, 1],
        outputRange: [-100, 100],
    });

    return (
        <View className="flex-1 bg-[#FBFBF9]">
            <StatusBar barStyle="dark-content" backgroundColor="#FBFBF9" />
            <SafeAreaView className="flex-1" edges={['top']}>

                {/* Header */}
                <View className="flex-row items-center px-6 py-4">
                    <TouchableOpacity
                        className="w-10 h-10 rounded-full border border-[#E8D5B7] justify-center items-center"
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="chevron-back" size={24} color="#4A3B32" />
                    </TouchableOpacity>
                    <Text className="text-xl font-[Urbanist-Bold] text-[#4A3B32] ml-4">Fingerprint Setup</Text>
                </View>

                {/* Spacer to push content down */}
                <View style={{ height: height * 0.1 }} />

                {/* Fingerprint Container - Centered */}
                <View className="items-center px-6">

                    {/* Fingerprint Scanning Animation */}
                    <View className="w-72 h-72 justify-center items-center relative">
                        {/* Corner brackets */}
                        <View className="absolute top-0 left-0 w-12 h-12 border-t-[3px] border-l-[3px] border-[#D3C1B0] rounded-tl-2xl" />
                        <View className="absolute top-0 right-0 w-12 h-12 border-t-[3px] border-r-[3px] border-[#D3C1B0] rounded-tr-2xl" />
                        <View className="absolute bottom-0 left-0 w-12 h-12 border-b-[3px] border-l-[3px] border-[#D3C1B0] rounded-bl-2xl" />
                        <View className="absolute bottom-0 right-0 w-12 h-12 border-b-[3px] border-r-[3px] border-[#D3C1B0] rounded-br-2xl" />

                        {/* Fingerprint Icon */}
                        <Ionicons name="finger-print" size={220} color="#4A3B32" />

                        {/* Animated scan line */}
                        <Animated.View
                            style={{
                                position: 'absolute',
                                width: '100%',
                                height: 3,
                                backgroundColor: '#9BB168',
                                shadowColor: '#9BB168',
                                shadowOffset: { width: 0, height: 0 },
                                shadowOpacity: 0.8,
                                shadowRadius: 15,
                                elevation: 8,
                                transform: [{ translateY }],
                            }}
                        />

                        {/* Scan line glow effect */}
                        <Animated.View
                            style={{
                                position: 'absolute',
                                width: '100%',
                                height: 40,
                                backgroundColor: '#9BB168',
                                opacity: 0.15,
                                transform: [{ translateY }],
                            }}
                        />
                    </View>

                    {/* Text Content */}
                    <View className="items-center px-4 mt-10">
                        <Text className="text-2xl font-[Urbanist-Bold] text-[#4A3B32] mb-3 text-center">
                            Fingerprint Setup
                        </Text>
                        <Text className="text-center text-[#8B7B6B] font-[Urbanist-Medium] text-base leading-6 px-2">
                            Scan your biometric fingerprint to make your account more secure. 🔑
                        </Text>
                    </View>
                </View>

                {/* Spacer to push button to bottom */}
                <View className="flex-1" />

                {/* Continue Button - Fixed at bottom */}
                <View className="px-6 pb-12">
                    <TouchableOpacity
                        className="bg-[#4A3B32] flex-row items-center justify-center py-4 rounded-full"
                        activeOpacity={0.8}
                        onPress={() => {
                            navigation.navigate("NotificationSetup")
                        }}
                    >
                        <Text className="text-white text-lg font-[Urbanist-Bold] mr-2">Continue</Text>
                        <Ionicons name="arrow-forward" size={20} color="white" />
                    </TouchableOpacity>
                </View>

            </SafeAreaView>
        </View>
    );
};

export default FingerprintSetupScreen;