// ComputingScoreScreen.tsx
import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StatusBar,
    Animated,
    Easing,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import "../global.css";

const { width, height } = Dimensions.get('window');

const ComputingScoreScreen = ({ navigation, route }: { navigation: any, route: any }) => {
    const pulse1 = useRef(new Animated.Value(1)).current;
    const pulse2 = useRef(new Animated.Value(1)).current;
    const pulse3 = useRef(new Animated.Value(1)).current;
    const pulse4 = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Top-left circle pulse animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulse1, {
                    toValue: 1.15,
                    duration: 3000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(pulse1, {
                    toValue: 1,
                    duration: 3000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Top-right circle pulse animation
        Animated.loop(
            Animated.sequence([
                Animated.delay(750),
                Animated.timing(pulse2, {
                    toValue: 1.12,
                    duration: 2800,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(pulse2, {
                    toValue: 1,
                    duration: 2800,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Bottom-left circle pulse animation
        Animated.loop(
            Animated.sequence([
                Animated.delay(500),
                Animated.timing(pulse3, {
                    toValue: 1.18,
                    duration: 3200,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(pulse3, {
                    toValue: 1,
                    duration: 3200,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Bottom-right circle pulse animation
        Animated.loop(
            Animated.sequence([
                Animated.delay(1000),
                Animated.timing(pulse4, {
                    toValue: 1.1,
                    duration: 2600,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(pulse4, {
                    toValue: 1,
                    duration: 2600,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Navigate after computing
        const timer = setTimeout(() => {
            const score = Math.floor(Math.random() * 101);
            navigation.replace('FreudScoreResult', {
                ...route.params,
                score,
            });
        }, 6000);

        return () => {
            clearTimeout(timer);
        };
    }, []);

    return (
        <View className="flex-1" style={{ backgroundColor: '#6B4423' }}>
            <StatusBar barStyle="light-content" backgroundColor="#6B4423" />
            <SafeAreaView className="flex-1" edges={['top']}>

                {/* Top-left decorative circle */}
                <Animated.View
                    style={{
                        position: 'absolute',
                        top: -80,
                        left: -80,
                        width: 280,
                        height: 280,
                        borderRadius: 140,
                        backgroundColor: '#5A3A1E',
                        transform: [{ scale: pulse1 }],
                    }}
                />

                {/* Top-right decorative circle */}
                <Animated.View
                    style={{
                        position: 'absolute',
                        top: -60,
                        right: -100,
                        width: 300,
                        height: 300,
                        borderRadius: 150,
                        backgroundColor: '#5A3A1E',
                        transform: [{ scale: pulse2 }],
                    }}
                />

                {/* Bottom-left decorative circle */}
                <Animated.View
                    style={{
                        position: 'absolute',
                        bottom: -100,
                        left: -80,
                        width: 320,
                        height: 320,
                        borderRadius: 160,
                        backgroundColor: '#5A3A1E',
                        transform: [{ scale: pulse3 }],
                    }}
                />

                {/* Bottom-right decorative circle */}
                <Animated.View
                    style={{
                        position: 'absolute',
                        bottom: -80,
                        right: -100,
                        width: 280,
                        height: 280,
                        borderRadius: 140,
                        backgroundColor: '#5A3A1E',
                        transform: [{ scale: pulse4 }],
                    }}
                />

                {/* Content - Centered */}
                <View className="flex-1 justify-center items-center px-8">
                    <Text className="text-4xl font-[Urbanist-Bold] text-white text-center mb-6">
                        Compiling Data...
                    </Text>
                    <Text className="text-base text-white/70 font-[Urbanist-Regular] text-center leading-6 px-4">
                        Please wait... We're calculating the data{'\n'}based on your assessment.
                    </Text>
                </View>

            </SafeAreaView>
        </View>
    );
};

export default ComputingScoreScreen;