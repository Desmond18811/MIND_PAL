// FreudScoreResultScreen.tsx
import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StatusBar,
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import "../global.css";

interface RouteParams {
    score: number;
}

const FreudScoreResultScreen = ({ navigation, route }: { navigation: any, route: any }) => {
    const { score } = route.params as RouteParams;
    const scaleValue = useRef(new Animated.Value(0)).current;
    const fadeValue = useRef(new Animated.Value(0)).current;
    const circle1 = useRef(new Animated.Value(1)).current;
    const circle2 = useRef(new Animated.Value(1)).current;
    const circle3 = useRef(new Animated.Value(1)).current;

    // Determine mental health status based on score ranges from design
    const getScoreData = (score: number) => {
        if (score >= 71) {
            // Green state - Healthy
            return {
                status: "You're mentally healthy.",
                subStatus: "Are you ready?",
                backgroundColor: '#8BAA56',
                circleColor: 'rgba(255, 255, 255, 0.15)',
                suggestion: '8 AI suggestions',
                mood: 'Overjoyed',
                moodIcon: 'happy-outline' as const,
                buttonText: "I'm Ready",
                buttonIcon: 'bulb' as const,
                showEmergency: false,
            };
        } else if (score >= 41) {
            // Orange state - Unstable
            return {
                status: "You're mentally unstable.",
                subStatus: "Consult psychiatrist.",
                backgroundColor: '#F08C4A',
                circleColor: 'rgba(255, 255, 255, 0.12)',
                suggestion: '16 AI suggestions',
                mood: 'Sad',
                moodIcon: 'sad-outline' as const,
                buttonText: "Schedule Appointment",
                buttonIcon: 'call-outline' as const,
                showEmergency: false,
            };
        } else {
            // Purple state - Critical
            return {
                status: "You're suicidal. Please call",
                subStatus: "hotline or loved ones!",
                backgroundColor: '#9B8BB8',
                circleColor: 'rgba(255, 255, 255, 0.12)',
                suggestion: '255 AI suggestions',
                mood: 'Depressive',
                moodIcon: 'sad' as const,
                buttonText: "Call Emergency Contact",
                buttonIcon: 'call-outline' as const,
                showEmergency: true,
            };
        }
    };

    const scoreData = getScoreData(score);

    useEffect(() => {
        // Score reveal animation
        Animated.spring(scaleValue, {
            toValue: 1,
            tension: 10,
            friction: 4,
            useNativeDriver: true,
        }).start();

        // Fade in
        Animated.timing(fadeValue, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();

        // Background circles animations
        Animated.loop(
            Animated.sequence([
                Animated.timing(circle1, {
                    toValue: 1.15,
                    duration: 3000,
                    useNativeDriver: true,
                }),
                Animated.timing(circle1, {
                    toValue: 1,
                    duration: 3000,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        Animated.loop(
            Animated.sequence([
                Animated.delay(1000),
                Animated.timing(circle2, {
                    toValue: 1.2,
                    duration: 4000,
                    useNativeDriver: true,
                }),
                Animated.timing(circle2, {
                    toValue: 1,
                    duration: 4000,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        Animated.loop(
            Animated.sequence([
                Animated.delay(500),
                Animated.timing(circle3, {
                    toValue: 1.1,
                    duration: 3500,
                    useNativeDriver: true,
                }),
                Animated.timing(circle3, {
                    toValue: 1,
                    duration: 3500,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const handleReady = () => {
        navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }],
        });
    };

    const handleEmergencyContact = () => {
        console.log('Emergency contact triggered');
    };

    const handleScheduleAppointment = () => {
        console.log('Schedule appointment triggered');
    };

    return (
        <View className="flex-1" style={{ backgroundColor: scoreData.backgroundColor }}>
            <StatusBar barStyle="light-content" backgroundColor={scoreData.backgroundColor} />
            <SafeAreaView className="flex-1" edges={['top']}>

                {/* Background decorative circles */}
                <Animated.View
                    style={{
                        position: 'absolute',
                        top: -100,
                        right: -80,
                        width: 300,
                        height: 300,
                        borderRadius: 150,
                        backgroundColor: scoreData.circleColor,
                        transform: [{ scale: circle1 }],
                    }}
                />
                <Animated.View
                    style={{
                        position: 'absolute',
                        bottom: -120,
                        left: -100,
                        width: 350,
                        height: 350,
                        borderRadius: 175,
                        backgroundColor: scoreData.circleColor,
                        transform: [{ scale: circle2 }],
                    }}
                />
                <Animated.View
                    style={{
                        position: 'absolute',
                        top: '35%',
                        left: -60,
                        width: 220,
                        height: 220,
                        borderRadius: 110,
                        backgroundColor: scoreData.circleColor,
                        transform: [{ scale: circle3 }],
                    }}
                />
                {/* Additional decorative circle for visual balance */}
                <View
                    style={{
                        position: 'absolute',
                        bottom: '25%',
                        right: -40,
                        width: 180,
                        height: 180,
                        borderRadius: 90,
                        backgroundColor: scoreData.circleColor,
                    }}
                />

                {/* Main Content */}
                <View className="flex-1 justify-center items-center px-6">

                    {/* Title */}
                    <Animated.Text
                        className="text-3xl font-[Urbanist-Bold] text-white mb-16 text-center"
                        style={{ opacity: fadeValue }}
                    >
                        Your Freud Score
                    </Animated.Text>

                    {/* Score Circle - 3 concentric circles like the image */}
                    <Animated.View
                        className="mb-16"
                        style={{ transform: [{ scale: scaleValue }], opacity: fadeValue }}
                    >
                        {/* Outer circle */}
                        <View
                            style={{
                                width: 280,
                                height: 280,
                                borderRadius: 140,
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            {/* Middle circle */}
                            <View
                                style={{
                                    width: 240,
                                    height: 240,
                                    borderRadius: 120,
                                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                {/* Inner white circle with score */}
                                <View
                                    style={{
                                        width: 200,
                                        height: 200,
                                        borderRadius: 100,
                                        backgroundColor: '#FFFFFF',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 4 },
                                        shadowOpacity: 0.2,
                                        shadowRadius: 10,
                                        elevation: 8,
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontSize: 80,
                                            fontFamily: 'Urbanist-Bold',
                                            color: scoreData.backgroundColor,
                                        }}
                                    >
                                        {score}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </Animated.View>

                    {/* Status Text */}
                    <Animated.View
                        className="items-center mb-8"
                        style={{ opacity: fadeValue }}
                    >
                        <Text className="text-2xl font-[Urbanist-Bold] text-white mb-1 text-center">
                            {scoreData.status}
                        </Text>
                        <Text className="text-2xl font-[Urbanist-Bold] text-white text-center">
                            {scoreData.subStatus}
                        </Text>
                    </Animated.View>

                    {/* Info Pills */}
                    <Animated.View
                        className="flex-row items-center justify-center gap-3 mb-12"
                        style={{ opacity: fadeValue }}
                    >
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: 'transparent',
                                paddingHorizontal: 8,
                                paddingVertical: 6,
                            }}
                        >
                            <Ionicons name="bulb-outline" size={18} color="white" />
                            <Text className="text-white font-[Urbanist-SemiBold] ml-2 text-sm">
                                {scoreData.suggestion}
                            </Text>
                        </View>
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: 'transparent',
                                paddingHorizontal: 8,
                                paddingVertical: 6,
                            }}
                        >
                            <Ionicons name={scoreData.moodIcon} size={18} color="white" />
                            <Text className="text-white font-[Urbanist-SemiBold] ml-2 text-sm">
                                {scoreData.mood}
                            </Text>
                        </View>
                    </Animated.View>

                    {/* Action Button */}
                    <Animated.View
                        className="w-full px-6"
                        style={{ opacity: fadeValue }}
                    >
                        <TouchableOpacity
                            style={{
                                backgroundColor: 'transparent',
                                borderWidth: 2,
                                borderColor: '#FFFFFF',
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                paddingVertical: 16,
                                borderRadius: 30,
                            }}
                            activeOpacity={0.8}
                            onPress={
                                scoreData.showEmergency
                                    ? handleEmergencyContact
                                    : score >= 71
                                        ? handleReady
                                        : handleScheduleAppointment
                            }
                        >
                            <Text className="text-white text-lg font-[Urbanist-Bold] mr-2">
                                {scoreData.buttonText}
                            </Text>
                            <Ionicons name={scoreData.buttonIcon} size={22} color="white" />
                        </TouchableOpacity>
                    </Animated.View>

                </View>

            </SafeAreaView>
        </View>
    );
};

export default FreudScoreResultScreen;