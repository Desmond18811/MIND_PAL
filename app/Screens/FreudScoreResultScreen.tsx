import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Animated,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const FreudScoreResultScreen = ({ navigation, route }) => {
    const score = route.params?.score || 80;
    const animatedScore = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    // Determine color based on score
    const getScoreColor = () => {
        if (score >= 70) return '#8EBA6B'; // Green - healthy
        if (score >= 40) return '#FF8C42'; // Orange - moderate
        return '#9B8BB4'; // Purple - needs attention
    };

    const getScoreMessage = () => {
        if (score >= 70) return { title: "You're mentally healthy", subtitle: 'Keep up the good work! 💚', emoji: '😊' };
        if (score >= 40) return { title: "You're mentally unstable", subtitle: 'We can help you improve! 🧡', emoji: '😔' };
        return { title: "You're troubled. Please see a professional", subtitle: 'Seek immediate support 💜', emoji: '😢' };
    };

    const scoreInfo = getScoreMessage();
    const scoreColor = getScoreColor();

    useEffect(() => {
        // Fade in animation
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();

        // Score count-up animation
        Animated.timing(animatedScore, {
            toValue: score,
            duration: 1500,
            useNativeDriver: false,
        }).start();
    }, []);

    const displayScore = animatedScore.interpolate({
        inputRange: [0, 100],
        outputRange: [0, 100],
    });

    const handleContinue = () => {
        navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }],
        });
    };

    const handleAIAssistance = () => {
        // Navigate to AI chat or suggestions
        navigation.navigate('Home');
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: scoreColor }]}>
            <StatusBar barStyle="light-content" backgroundColor={scoreColor} />

            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                {/* Score Circle */}
                <View style={styles.scoreContainer}>
                    <Text style={styles.scoreLabel}>Your Freud Score</Text>

                    <View style={styles.scoreCircleOuter}>
                        <View style={styles.scoreCircleMiddle}>
                            <View style={styles.scoreCircleInner}>
                                <AnimatedScore value={animatedScore} />
                            </View>
                        </View>
                    </View>
                </View>

                {/* Message */}
                <View style={styles.messageContainer}>
                    <Text style={styles.emoji}>{scoreInfo.emoji}</Text>
                    <Text style={styles.messageTitle}>{scoreInfo.title}</Text>
                    <Text style={styles.messageSubtitle}>{scoreInfo.subtitle}</Text>
                </View>

                {/* Action Buttons */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.primaryButton} onPress={handleAIAssistance}>
                        <Ionicons name="sparkles" size={20} color={scoreColor} />
                        <Text style={[styles.primaryButtonText, { color: scoreColor }]}>AI Assistance</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.secondaryButton} onPress={handleContinue}>
                        <Text style={styles.secondaryButtonText}>Improve Wellbeing</Text>
                        <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </SafeAreaView>
    );
};

// Animated score component
const AnimatedScore = ({ value }) => {
    const [displayValue, setDisplayValue] = React.useState(0);

    React.useEffect(() => {
        const listener = value.addListener(({ value: v }) => {
            setDisplayValue(Math.round(v));
        });
        return () => value.removeListener(listener);
    }, [value]);

    return <Text style={styles.scoreText}>{displayValue}</Text>;
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'space-between',
        paddingHorizontal: 30,
        paddingVertical: 40,
    },
    scoreContainer: {
        alignItems: 'center',
        paddingTop: 40,
    },
    scoreLabel: {
        fontSize: 18,
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 30,
    },
    scoreCircleOuter: {
        width: 220,
        height: 220,
        borderRadius: 110,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scoreCircleMiddle: {
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scoreCircleInner: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scoreText: {
        fontSize: 56,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    messageContainer: {
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    emoji: {
        fontSize: 48,
        marginBottom: 15,
    },
    messageTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 10,
    },
    messageSubtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
    },
    buttonContainer: {
        gap: 15,
    },
    primaryButton: {
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        borderRadius: 30,
        gap: 10,
    },
    primaryButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    secondaryButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        borderRadius: 30,
        gap: 10,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    secondaryButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
});

export default FreudScoreResultScreen;
