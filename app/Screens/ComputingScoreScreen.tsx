import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    Animated,
    Easing,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const colors = {
    darkBrown: '#6D482F',
    lightBeige: '#F3EDE4',
    textDark: '#333333',
    placeholderText: '#A0A0A0',
    primaryGreen: '#8EBA6B',
};

const ComputingScoreScreen = ({ navigation, route }) => {
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
                score: Math.floor(Math.random() * 50) + 50, // Random score 50-100 for demo
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
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.lightBeige} />

            <View style={styles.content}>
                {/* Computing Animation */}
                <Animated.View
                    style={[
                        styles.computingCircle,
                        { transform: [{ scale: pulseValue }] }
                    ]}
                >
                    <Animated.View
                        style={[
                            styles.spinnerOuter,
                            { transform: [{ rotate: spin }] }
                        ]}
                    >
                        <View style={styles.spinnerDot} />
                    </Animated.View>

                    <View style={styles.innerCircle}>
                        <View style={styles.brainContainer}>
                            <Text style={styles.brainEmoji}>🧠</Text>
                        </View>
                    </View>
                </Animated.View>

                {/* Title */}
                <Text style={styles.title}>Computing Data...</Text>
                <Text style={styles.subtitle}>{currentMessage}</Text>

                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${progress}%` }]} />
                    </View>
                    <Text style={styles.progressText}>{progress}%</Text>
                </View>

                {/* Decorative Elements */}
                <View style={styles.decorativeContainer}>
                    <View style={[styles.decorDot, styles.decorDot1]} />
                    <View style={[styles.decorDot, styles.decorDot2]} />
                    <View style={[styles.decorDot, styles.decorDot3]} />
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.lightBeige,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    computingCircle: {
        width: 200,
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
    },
    spinnerOuter: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        borderWidth: 4,
        borderColor: 'transparent',
        borderTopColor: colors.darkBrown,
        borderRightColor: colors.darkBrown,
    },
    spinnerDot: {
        position: 'absolute',
        top: 0,
        left: '50%',
        marginLeft: -8,
        marginTop: -8,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: colors.darkBrown,
    },
    innerCircle: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: colors.darkBrown,
        justifyContent: 'center',
        alignItems: 'center',
    },
    brainContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    brainEmoji: {
        fontSize: 50,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.darkBrown,
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: colors.placeholderText,
        textAlign: 'center',
        marginBottom: 30,
    },
    progressContainer: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    progressBar: {
        flex: 1,
        height: 10,
        backgroundColor: '#E0E0E0',
        borderRadius: 5,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: colors.primaryGreen,
        borderRadius: 5,
    },
    progressText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.darkBrown,
        minWidth: 45,
        textAlign: 'right',
    },
    decorativeContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    decorDot: {
        position: 'absolute',
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: colors.darkBrown,
        opacity: 0.2,
    },
    decorDot1: {
        top: height * 0.15,
        left: width * 0.15,
    },
    decorDot2: {
        top: height * 0.25,
        right: width * 0.1,
    },
    decorDot3: {
        bottom: height * 0.2,
        left: width * 0.2,
    },
});

export default ComputingScoreScreen;
