import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    ScrollView,
    Dimensions,
    Image,
    Animated,
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
    placeholderText: '#A0A0A0',
    lightGray: '#E0E0E0',
    orange: '#FF8C42',
    purple: '#9B8BB4',
};

const AISuggestionsScreen = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState('all');
    const [sorted, setSorted] = useState(false);
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const slideAnim = React.useRef(new Animated.Value(50)).current;

    React.useEffect(() => {
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

    const suggestions = [
        {
            id: 1,
            category: 'Mindfulness Activities',
            icon: '🧘',
            description: 'Breathing, Body ...',
            time: '~10min',
            color: colors.primaryGreen,
        },
        {
            id: 2,
            category: 'Physical Activities',
            icon: '🏃',
            description: 'Jogging, Running, Swimming',
            time: '~30min',
            color: colors.orange,
        },
        {
            id: 3,
            category: 'Social Connection',
            icon: '👥',
            description: 'Hangout, Shopping',
            time: '~1hr',
            color: colors.purple,
        },
        {
            id: 4,
            category: 'Professional Support',
            icon: '👨‍⚕️',
            description: 'Psychiatrist, Doctor',
            time: '~30min',
            color: colors.darkBrown,
        },
    ];

    const tabs = [
        { id: 'all', label: 'All Suggestions' },
        { id: 'sorted', label: 'Sorted' },
    ];

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
                <View>
                    <Text style={styles.headerTitle}>AI Score Suggestions</Text>
                    <View style={styles.aiLabel}>
                        <Text style={styles.aiLabelEmoji}>🤖</Text>
                        <Text style={styles.aiLabelText}>92 Total</Text>
                        <View style={styles.gptBadge}>
                            <Text style={styles.gptBadgeText}>GPT-5</Text>
                        </View>
                    </View>
                </View>
                <View style={{ width: 40 }} />
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
                {tabs.map((tab) => (
                    <TouchableOpacity
                        key={tab.id}
                        style={[styles.tab, activeTab === tab.id && styles.activeTab]}
                        onPress={() => setActiveTab(tab.id)}
                    >
                        <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Suggestions List */}
                {suggestions.map((suggestion, index) => (
                    <Animated.View
                        key={suggestion.id}
                        style={{
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }}
                    >
                        <TouchableOpacity
                            style={styles.suggestionCard}
                            onPress={() => navigation.navigate('MindfulnessActivities', { suggestion })}
                        >
                            <View style={[styles.suggestionIcon, { backgroundColor: suggestion.color + '20' }]}>
                                <Text style={styles.suggestionEmoji}>{suggestion.icon}</Text>
                            </View>
                            <View style={styles.suggestionContent}>
                                <Text style={styles.suggestionCategory}>{suggestion.category}</Text>
                                <Text style={styles.suggestionDescription}>{suggestion.description}</Text>
                            </View>
                            <View style={styles.suggestionTime}>
                                <Text style={styles.timeText}>{suggestion.time}</Text>
                                <Ionicons name="chevron-forward" size={20} color={colors.placeholderText} />
                            </View>
                        </TouchableOpacity>
                    </Animated.View>
                ))}

                {/* Score Impact Info */}
                <Animated.View style={[styles.infoCard, { opacity: fadeAnim }]}>
                    <Ionicons name="information-circle" size={24} color={colors.primaryGreen} />
                    <Text style={styles.infoText}>
                        Completing AI suggestions can improve your Pal Score by +5 points each!
                    </Text>
                </Animated.View>
            </ScrollView>
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
        justifyContent: 'space-between',
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
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.darkBrown,
        textAlign: 'center',
    },
    aiLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 5,
        gap: 5,
    },
    aiLabelEmoji: {
        fontSize: 12,
    },
    aiLabelText: {
        fontSize: 12,
        color: colors.placeholderText,
    },
    gptBadge: {
        backgroundColor: colors.primaryGreen,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    gptBadgeText: {
        color: colors.textLight,
        fontSize: 10,
        fontWeight: '600',
    },
    tabsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 20,
        gap: 10,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 25,
        backgroundColor: colors.textLight,
        alignItems: 'center',
    },
    activeTab: {
        backgroundColor: colors.darkBrown,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textDark,
    },
    activeTabText: {
        color: colors.textLight,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    suggestionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.textLight,
        borderRadius: 15,
        padding: 15,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    suggestionIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    suggestionEmoji: {
        fontSize: 24,
    },
    suggestionContent: {
        flex: 1,
    },
    suggestionCategory: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.darkBrown,
        marginBottom: 4,
    },
    suggestionDescription: {
        fontSize: 13,
        color: colors.placeholderText,
    },
    suggestionTime: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    timeText: {
        fontSize: 12,
        color: colors.placeholderText,
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E8',
        borderRadius: 15,
        padding: 15,
        marginTop: 10,
        marginBottom: 30,
        gap: 12,
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        color: colors.textDark,
        lineHeight: 20,
    },
});

export default AISuggestionsScreen;
