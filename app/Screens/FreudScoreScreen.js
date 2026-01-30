import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    ScrollView,
    Dimensions,
    ActivityIndicator,
    Alert,
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const colors = {
    primaryGreen: '#8EBA6B',
    darkBrown: '#6D482F',
    lightBeige: '#F3EDE4',
    textDark: '#333333',
    textLight: '#FFFFFF',
    placeholderText: '#A0A0A0',
    lightGray: '#E0E0E0',
    orange: '#FF8C42',
};

const FreudScoreScreen = ({ navigation }) => {
    const [score, setScore] = useState(80);
    const [loading, setLoading] = useState(false);
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
        if (score >= 70) return { text: 'Mentally Stable', color: colors.primaryGreen };
        if (score >= 40) return { text: 'Needs Attention', color: colors.orange };
        return { text: 'Seek Help', color: '#9B8BB4' };
    };

    const status = getScoreStatus();

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={colors.darkBrown} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="chevron-back" size={24} color={colors.textLight} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Pal Score</Text>
                <TouchableOpacity style={styles.settingsButton}>
                    <Text style={styles.manageText}>Manage</Text>
                </TouchableOpacity>
            </View>

            {/* Score Display */}
            <Animated.View style={[styles.scoreSection, { opacity: fadeAnim, transform: [{ scale: fadeAnim }] }]}>
                <View style={styles.scoreCircle}>
                    <Text style={styles.scoreNumber}>{score}</Text>
                </View>
                <Text style={styles.scoreStatus}>{status.text}</Text>
                <TouchableOpacity style={styles.insightsButton}>
                    <Ionicons name="bar-chart" size={20} color={colors.textLight} />
                </TouchableOpacity>
            </Animated.View>

            <Animated.ScrollView
                style={[styles.content, { transform: [{ translateY: slideAnim }] }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Score History Section */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Score History</Text>
                    <TouchableOpacity>
                        <Text style={styles.seeAllText}>See All</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.historyContainer}>
                    {scoreHistory.map((item, index) => (
                        <View key={index} style={styles.historyItem}>
                            <Text style={styles.historyScore}>{item.score}</Text>
                            <View style={styles.historyDetails}>
                                <Text style={styles.historyMood}>{item.emoji} {item.mood}</Text>
                                <Text style={styles.historyDate}>{item.date}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Toggle AI Suggestions */}
                <View style={styles.toggleContainer}>
                    <Text style={styles.toggleLabel}>Include AI Suggestions</Text>
                    <TouchableOpacity
                        style={[styles.toggle, includeAISuggestions && styles.toggleActive]}
                        onPress={() => setIncludeAISuggestions(!includeAISuggestions)}
                    >
                        <View style={[styles.toggleKnob, includeAISuggestions && styles.toggleKnobActive]} />
                    </TouchableOpacity>
                </View>

                {/* Filter Button */}
                <TouchableOpacity
                    style={styles.filterButton}
                    onPress={() => Alert.alert('Filter', 'Filter feature coming soon!')}
                >
                    <Text style={styles.filterButtonText}>Filter Pal Score (5)</Text>
                    <Ionicons name="options" size={20} color={colors.textLight} />
                </TouchableOpacity>

                {/* AI Suggestions Button */}
                <TouchableOpacity
                    style={styles.suggestionsButton}
                    onPress={() => navigation.navigate('AISuggestions')}
                >
                    <Ionicons name="sparkles" size={20} color={colors.primaryGreen} />
                    <Text style={styles.suggestionsButtonText}>Scope for AI Suggestions</Text>
                </TouchableOpacity>
            </Animated.ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.darkBrown,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.textLight,
    },
    settingsButton: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 15,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    manageText: {
        color: colors.textLight,
        fontSize: 14,
    },
    scoreSection: {
        alignItems: 'center',
        paddingVertical: 30,
    },
    scoreCircle: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    scoreNumber: {
        fontSize: 56,
        fontWeight: 'bold',
        color: colors.textLight,
    },
    scoreStatus: {
        fontSize: 18,
        color: colors.textLight,
        marginBottom: 15,
    },
    insightsButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        backgroundColor: colors.lightBeige,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: 20,
        paddingTop: 25,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.darkBrown,
    },
    seeAllText: {
        fontSize: 14,
        color: colors.primaryGreen,
    },
    historyContainer: {
        backgroundColor: colors.textLight,
        borderRadius: 15,
        padding: 15,
        marginBottom: 20,
    },
    historyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.lightGray,
    },
    historyScore: {
        width: 40,
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.darkBrown,
    },
    historyDetails: {
        flex: 1,
    },
    historyMood: {
        fontSize: 14,
        color: colors.textDark,
    },
    historyDate: {
        fontSize: 12,
        color: colors.placeholderText,
        marginTop: 2,
    },
    toggleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.textLight,
        borderRadius: 15,
        padding: 15,
        marginBottom: 20,
    },
    toggleLabel: {
        fontSize: 16,
        color: colors.darkBrown,
    },
    toggle: {
        width: 50,
        height: 28,
        borderRadius: 14,
        backgroundColor: colors.lightGray,
        padding: 2,
    },
    toggleActive: {
        backgroundColor: colors.primaryGreen,
    },
    toggleKnob: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.textLight,
    },
    toggleKnobActive: {
        marginLeft: 22,
    },
    filterButton: {
        backgroundColor: colors.darkBrown,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        borderRadius: 25,
        marginBottom: 15,
        gap: 10,
    },
    filterButtonText: {
        color: colors.textLight,
        fontSize: 16,
        fontWeight: '600',
    },
    suggestionsButton: {
        backgroundColor: colors.textLight,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        borderRadius: 25,
        marginBottom: 30,
        gap: 10,
        borderWidth: 2,
        borderColor: colors.primaryGreen,
    },
    suggestionsButtonText: {
        color: colors.primaryGreen,
        fontSize: 16,
        fontWeight: '600',
    },
});

export default FreudScoreScreen;
