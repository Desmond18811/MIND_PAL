import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StatusBar,
    ScrollView,
    Alert,
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import "../global.css";

const FreudScoreScreen = ({ navigation }) => {
    const [score, setScore] = useState(80);
    const [includeAISuggestions, setIncludeAISuggestions] = useState(true);
    const [fadeAnim] = useState(new Animated.Value(0));
    const [slideAnim] = useState(new Animated.Value(50));

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const scoreHistory = [
        { date: '2025/8/16', mood: 'Anxious, Depressed', emoji: '😟', score: 12 },
        { date: '2025/8/14', mood: 'Ok, Cannot breathe', emoji: '😐', score: 9 },
        { date: '2025/8/11', mood: 'Very Happy', emoji: '😊', score: 11 },
        { date: '2025/8/10', mood: 'My Mom mentioned me', emoji: '😊', score: 10 },
        { date: '2025/8/8', mood: 'Neutral', emoji: '😐', score: 8 },
    ];

    const getScoreStatus = () => {
        if (score >= 70) return { text: 'Mentally Stable', color: '#8EBA6B' };
        if (score >= 40) return { text: 'Needs Attention', color: '#FF8C42' };
        return { text: 'Seek Help', color: '#9B8BB4' };
    };

    const status = getScoreStatus();

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#6D482F' }}>
            <StatusBar barStyle="light-content" backgroundColor="#6D482F" />

            {/* Header */}
            <View className="flex-row items-center justify-between px-5 py-4">
                <TouchableOpacity
                    className="w-10 h-10 rounded-full bg-white/20 justify-center items-center"
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text className="text-lg font-semibold text-white">Pal Score</Text>
                <TouchableOpacity className="px-4 py-2 rounded-2xl bg-white/20">
                    <Text className="text-white text-sm">Manage</Text>
                </TouchableOpacity>
            </View>

            {/* Score Display */}
            <Animated.View
                className="items-center py-8"
                style={{ opacity: fadeAnim, transform: [{ scale: fadeAnim }] }}
            >
                <View className="w-[150px] h-[150px] rounded-full bg-white/20 justify-center items-center mb-4">
                    <Text className="text-6xl font-bold text-white">{score}</Text>
                </View>
                <Text className="text-lg text-white mb-4">{status.text}</Text>
                <TouchableOpacity className="w-12 h-12 rounded-full bg-white/20 justify-center items-center">
                    <Ionicons name="bar-chart" size={20} color="#FFFFFF" />
                </TouchableOpacity>
            </Animated.View>

            <Animated.ScrollView
                className="flex-1 bg-light-beige rounded-t-3xl px-5 pt-6"
                style={{ transform: [{ translateY: slideAnim }] }}
                showsVerticalScrollIndicator={false}
            >
                {/* Score History Section */}
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-lg font-semibold text-dark-brown">Score History</Text>
                    <TouchableOpacity>
                        <Text className="text-sm text-primary-green">See All</Text>
                    </TouchableOpacity>
                </View>

                <View className="bg-white rounded-2xl p-4 mb-5">
                    {scoreHistory.map((item, index) => (
                        <View
                            key={index}
                            className={`flex-row items-center py-3 ${index < scoreHistory.length - 1 ? 'border-b border-light-gray' : ''
                                }`}
                        >
                            <Text className="w-10 text-lg font-bold text-dark-brown">{item.score}</Text>
                            <View className="flex-1">
                                <Text className="text-sm text-text-dark">{item.emoji} {item.mood}</Text>
                                <Text className="text-xs text-placeholder mt-0.5">{item.date}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Toggle AI Suggestions */}
                <View className="flex-row justify-between items-center bg-white rounded-2xl p-4 mb-5">
                    <Text className="text-base text-dark-brown">Include AI Suggestions</Text>
                    <TouchableOpacity
                        className={`w-12 h-7 rounded-full p-0.5 ${includeAISuggestions ? 'bg-primary-green' : 'bg-light-gray'
                            }`}
                        onPress={() => setIncludeAISuggestions(!includeAISuggestions)}
                    >
                        <View className={`w-6 h-6 rounded-full bg-white ${includeAISuggestions ? 'ml-5' : ''
                            }`} />
                    </TouchableOpacity>
                </View>

                {/* Filter Button */}
                <TouchableOpacity
                    className="bg-dark-brown flex-row items-center justify-center py-4 rounded-3xl mb-4 gap-2.5"
                    onPress={() => Alert.alert('Filter', 'Filter feature coming soon!')}
                >
                    <Text className="text-white text-base font-semibold">Filter Pal Score (5)</Text>
                    <Ionicons name="options" size={20} color="#FFFFFF" />
                </TouchableOpacity>

                {/* AI Suggestions Button */}
                <TouchableOpacity
                    className="bg-white flex-row items-center justify-center py-4 rounded-3xl mb-8 gap-2.5 border-2 border-primary-green"
                    onPress={() => navigation.navigate('AISuggestions')}
                >
                    <Ionicons name="sparkles" size={20} color="#8EBA6B" />
                    <Text className="text-primary-green text-base font-semibold">Scope for AI Suggestions</Text>
                </TouchableOpacity>
            </Animated.ScrollView>
        </SafeAreaView>
    );
};

export default FreudScoreScreen;
