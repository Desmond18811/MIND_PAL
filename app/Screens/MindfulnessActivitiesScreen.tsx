import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    ScrollView,
    Modal,
    Image,
    Dimensions,
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const colors = {
    primaryGreen: '#8EBA6B',
    darkBrown: '#6D482F',
    lightBeige: '#F3EDE4',
    textDark: '#333333',
    textLight: '#FFFFFF',
    placeholderText: '#A0A0A0',
    lightGray: '#E0E0E0',
};

const MindfulnessActivitiesScreen = ({ navigation, route }) => {
    const [showCompletedModal, setShowCompletedModal] = useState(false);
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

    const suggestedActivities = [
        { id: 1, title: 'Daily Meditation', time: 'Routine', icon: '🧘' },
        { id: 2, title: 'Gratefulness Journaling', time: 'Daily', icon: '📝' },
    ];

    const mindfulResources = [
        {
            id: 1,
            title: 'Why should we be mindful?',
            description: 'Mindfulness, the practice of being fully present and engaged in the moment, has become increasingly important in our fast-paced world. It\'s not just a trend; it\'s a vital tool for enhancing overall well-being.',
            image: '🧠',
            tags: ['Reduce Stress', 'Improve Health'],
        },
    ];

    const handleComplete = () => {
        setShowCompletedModal(true);
    };

    const handleCloseModal = () => {
        setShowCompletedModal(false);
        navigation.goBack();
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.primaryGreen} />

            {/* Header with Green Background */}
            <View style={styles.greenHeader}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="chevron-back" size={24} color={colors.textLight} />
                </TouchableOpacity>

                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Mindfulness</Text>
                    <Text style={styles.headerSubtitle}>Activities</Text>
                </View>

                <View style={styles.headerActions}>
                    <TouchableOpacity>
                        <Text style={styles.seeAllText}>See All</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <Animated.ScrollView
                style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Suggested Activity Section */}
                <Text style={styles.sectionTitle}>Suggested Activity</Text>

                <View style={styles.activitiesRow}>
                    {suggestedActivities.map((activity) => (
                        <TouchableOpacity key={activity.id} style={styles.activityCard}>
                            <Text style={styles.activityIcon}>{activity.icon}</Text>
                            <Text style={styles.activityTitle}>{activity.title}</Text>
                            <Text style={styles.activityTime}>{activity.time}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Mindful Resources Section */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Mindful Resources</Text>
                    <TouchableOpacity>
                        <Text style={styles.seeAllLink}>See All</Text>
                    </TouchableOpacity>
                </View>

                {mindfulResources.map((resource) => (
                    <View key={resource.id} style={styles.resourceCard}>
                        <View style={styles.resourceImage}>
                            <Text style={styles.resourceEmoji}>{resource.image}</Text>
                        </View>
                        <Text style={styles.resourceTitle}>{resource.title}</Text>
                        <Text style={styles.resourceDescription} numberOfLines={4}>
                            {resource.description}
                        </Text>
                        <View style={styles.tagsContainer}>
                            {resource.tags.map((tag, index) => (
                                <View key={index} style={styles.tag}>
                                    <Text style={styles.tagText}>✨ {tag}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                ))}

                {/* Complete Button */}
                <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
                    <Text style={styles.completeButtonText}>Mark As Completed</Text>
                    <Ionicons name="checkmark-circle" size={20} color={colors.textLight} />
                </TouchableOpacity>
            </Animated.ScrollView>

            {/* Completion Modal */}
            <Modal
                visible={showCompletedModal}
                transparent
                animationType="fade"
                onRequestClose={handleCloseModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <TouchableOpacity style={styles.closeButton} onPress={handleCloseModal}>
                            <Ionicons name="close" size={24} color={colors.textLight} />
                        </TouchableOpacity>

                        <View style={styles.modalIllustration}>
                            <Text style={styles.modalEmoji}>🎉</Text>
                        </View>

                        <Text style={styles.modalTitle}>AI Suggestion Completed.</Text>
                        <Text style={styles.modalSubtitle}>+5 Pal Score Added!</Text>
                        <Text style={styles.modalDescription}>
                            Your Pal score has increased to 85
                        </Text>

                        <TouchableOpacity style={styles.modalButton} onPress={handleCloseModal}>
                            <Text style={styles.modalButtonText}>Great, Thanks! ✓</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.lightBeige,
    },
    greenHeader: {
        backgroundColor: colors.primaryGreen,
        paddingHorizontal: 20,
        paddingVertical: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerContent: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.textLight,
    },
    headerSubtitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.textLight,
    },
    headerActions: {},
    seeAllText: {
        color: colors.textLight,
        fontSize: 14,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.darkBrown,
        marginBottom: 15,
    },
    activitiesRow: {
        flexDirection: 'row',
        gap: 15,
        marginBottom: 25,
    },
    activityCard: {
        flex: 1,
        backgroundColor: colors.textLight,
        borderRadius: 15,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    activityIcon: {
        fontSize: 40,
        marginBottom: 10,
    },
    activityTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.darkBrown,
        textAlign: 'center',
        marginBottom: 5,
    },
    activityTime: {
        fontSize: 12,
        color: colors.placeholderText,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    seeAllLink: {
        fontSize: 14,
        color: colors.primaryGreen,
    },
    resourceCard: {
        backgroundColor: colors.textLight,
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    resourceImage: {
        height: 100,
        backgroundColor: colors.lightGray,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    resourceEmoji: {
        fontSize: 50,
    },
    resourceTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.darkBrown,
        marginBottom: 10,
    },
    resourceDescription: {
        fontSize: 14,
        color: colors.placeholderText,
        lineHeight: 22,
        marginBottom: 15,
    },
    tagsContainer: {
        flexDirection: 'row',
        gap: 10,
    },
    tag: {
        backgroundColor: colors.lightGray,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
    },
    tagText: {
        fontSize: 12,
        color: colors.textDark,
    },
    completeButton: {
        backgroundColor: colors.darkBrown,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        borderRadius: 25,
        marginBottom: 30,
        gap: 10,
    },
    completeButtonText: {
        color: colors.textLight,
        fontSize: 18,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
    },
    modalContent: {
        backgroundColor: colors.darkBrown,
        borderRadius: 30,
        padding: 30,
        width: '100%',
        alignItems: 'center',
    },
    closeButton: {
        position: 'absolute',
        top: 15,
        right: 15,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalIllustration: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalEmoji: {
        fontSize: 50,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.textLight,
        textAlign: 'center',
        marginBottom: 5,
    },
    modalSubtitle: {
        fontSize: 16,
        color: colors.primaryGreen,
        fontWeight: '600',
        marginBottom: 10,
    },
    modalDescription: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'center',
        marginBottom: 25,
    },
    modalButton: {
        backgroundColor: colors.textLight,
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 25,
    },
    modalButtonText: {
        color: colors.darkBrown,
        fontSize: 16,
        fontWeight: '600',
    },
});

export default MindfulnessActivitiesScreen;
