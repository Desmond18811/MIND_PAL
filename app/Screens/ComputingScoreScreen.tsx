import React, { useEffect, useState, useRef } from 'react';
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
    const [progress, setProgress] = useState(0);
    const spinValue = useRef(new Animated.Value(0)).current;
    const pulseValue = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Spin animation
        Animated.loop(
            Animated.timing(spinValue, {
                toValue: 1,
                duration: 2000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();

        // Pulse animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseValue, {
                    toValue: 1.1,
                    duration: 1000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(pulseValue, {
                    toValue: 1,
                    duration: 1000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Progress simulation
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + 2;
            });
        }, 100);

        // Navigate after computing
        const timer = setTimeout(() => {
            navigation.replace('FreudScoreResult', {
                ...route.params,
                score: Math.floor(Math.random() * 50) + 50,
            });
        }, 5500);

        return () => {
            clearInterval(interval);
            clearTimeout(timer);
        };
    }, []);

    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const progressMessages = [
        'Analyzing your responses...',
        'Computing your mental health score...',
        'Generating personalized insights...',
        'Almost there...',
    ];

    const currentMessage = progressMessages[Math.floor(progress / 25)];

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F3EDE4' }}>
            <StatusBar barStyle="dark-content" backgroundColor="#F3EDE4" />

            <View className="flex-1 justify-center items-center px-10">
                {/* Computing Animation */}
                <Animated.View
                    className="w-[200px] h-[200px] justify-center items-center mb-10"
                    style={{ transform: [{ scale: pulseValue }] }}
                >
                    <Animated.View
                        className="absolute w-[200px] h-[200px] rounded-full border-4 border-transparent border-t-dark-brown border-r-dark-brown"
                        style={{ transform: [{ rotate: spin }] }}
                    >
                        <View className="absolute top-0 left-1/2 -ml-2 -mt-2 w-4 h-4 rounded-full bg-dark-brown" />
                    </Animated.View>

                    <View className="w-[150px] h-[150px] rounded-full bg-dark-brown justify-center items-center">
                        <View className="w-20 h-20 rounded-full bg-white/20 justify-center items-center">
                            <Text className="text-5xl">🧠</Text>
                        </View>
                    </View>
                </Animated.View>

                {/* Title */}
                <Text className="text-2xl font-bold text-dark-brown mb-2 text-center">Computing Data...</Text>
                <Text className="text-sm text-placeholder text-center mb-8">{currentMessage}</Text>

                {/* Progress Bar */}
                <View className="w-full flex-row items-center gap-4">
                    <View className="flex-1 h-2.5 bg-light-gray rounded-md overflow-hidden">
                        <View
                            className="h-full bg-primary-green rounded-md"
                            style={{ width: `${progress}%` }}
                        />
                    </View>
                    <Text className="text-sm font-semibold text-dark-brown min-w-[45px] text-right">{progress}%</Text>
                </View>

                {/* Decorative Elements */}
                <View className="absolute inset-0">
                    <View
                        className="absolute w-3 h-3 rounded-full bg-dark-brown opacity-20"
                        style={{ top: height * 0.15, left: width * 0.15 }}
                    />
                    <View
                        className="absolute w-3 h-3 rounded-full bg-dark-brown opacity-20"
                        style={{ top: height * 0.25, right: width * 0.1 }}
                    />
                    <View
                        className="absolute w-3 h-3 rounded-full bg-dark-brown opacity-20"
                        style={{ bottom: height * 0.2, left: width * 0.2 }}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
};

export default ComputingScoreScreen;
