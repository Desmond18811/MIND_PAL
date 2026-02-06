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

const FreudScoreResultScreen = ({ navigation, route }: { navigation: any, route: any }) => {
    const score = route.params?.score || 80;
    const animatedScore = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const getScoreColor = () => {
        if (score >= 70) return '#8EBA6B';
        if (score >= 40) return '#FF8C42';
        return '#9B8BB4';
    };

    const getScoreMessage = () => {
        if (score >= 70) return { title: "You're mentally healthy", subtitle: 'Keep up the good work! 💚', emoji: '😊' };
        if (score >= 40) return { title: "You're mentally unstable", subtitle: 'We can help you improve! 🧡', emoji: '😔' };
        return { title: "You're troubled. Please see a professional", subtitle: 'Seek immediate support 💜', emoji: '😢' };
    };

    const scoreInfo = getScoreMessage();
    const scoreColor = getScoreColor();

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();

        Animated.timing(animatedScore, {
            toValue: score,
            duration: 1500,
            useNativeDriver: false,
        }).start();
    }, []);

    const handleContinue = () => {
        navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }],
        });
    };

    const handleAIAssistance = () => {
        navigation.navigate('Home');
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: scoreColor }}>
            <StatusBar barStyle="light-content" backgroundColor={scoreColor} />

            <Animated.View className="flex-1 justify-between px-8 py-10" style={{ opacity: fadeAnim }}>
                {/* Score Circle */}
                <View className="items-center pt-10">
                    <Text className="text-lg text-white/80 mb-8">Your Freud Score</Text>

                    <View className="w-[220px] h-[220px] rounded-full bg-white/10 justify-center items-center">
                        <View className="w-[180px] h-[180px] rounded-full bg-white/15 justify-center items-center">
                            <View className="w-[140px] h-[140px] rounded-full bg-white/30 justify-center items-center">
                                <AnimatedScore value={animatedScore} />
                            </View>
                        </View>
                    </View>
                </View>

                {/* Message */}
                <View className="items-center px-5">
                    <Text className="text-5xl mb-4">{scoreInfo.emoji}</Text>
                    <Text className="text-2xl font-bold text-white text-center mb-2">{scoreInfo.title}</Text>
                    <Text className="text-base text-white/80 text-center">{scoreInfo.subtitle}</Text>
                </View>

                {/* Action Buttons */}
                <View className="gap-4">
                    <TouchableOpacity
                        className="bg-white flex-row items-center justify-center py-5 rounded-full gap-2.5"
                        onPress={handleAIAssistance}
                    >
                        <Ionicons name="sparkles" size={20} color={scoreColor} />
                        <Text className="text-lg font-bold" style={{ color: scoreColor }}>AI Assistance</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="bg-white/20 flex-row items-center justify-center py-5 rounded-full gap-2.5 border border-white/30"
                        onPress={handleContinue}
                    >
                        <Text className="text-white text-lg font-semibold">Improve Wellbeing</Text>
                        <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </SafeAreaView>
    );
};

const AnimatedScore = ({ value }: { value: Animated.Value }) => {
    const [displayValue, setDisplayValue] = React.useState(0);

    React.useEffect(() => {
        const listener = value.addListener(({ value: v }: { value: number }) => {
            setDisplayValue(Math.round(v));
        });
        return () => value.removeListener(listener);
    }, [value]);

    return <Text className="text-6xl font-bold text-white">{displayValue}</Text>;
};

export default FreudScoreResultScreen;
