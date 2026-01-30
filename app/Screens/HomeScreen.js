import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

// Define metricCardBase outside of StyleSheet.create
const metricCardBase = {
  width: 150,
  borderRadius: 15,
  padding: 15,
  marginRight: 15,
  alignItems: 'center',
};

const HomeScreen = () => {
  const navigation = useNavigation();
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#8B7355" />

      {/* Header */}
      <View style={styles.headerContainer}>


        <View style={styles.headerContent}>
          <View style={styles.profileSection}>
            <Image
              source={require('../assets/profile1.png')}
              style={styles.profileImage}
            />
            <View style={styles.profileText}>
              <Text style={styles.greeting}>Hi, Shinomiya!</Text>
              <View style={styles.profileBadges}>
                <Text style={styles.badgePro}>Pro</Text>
                <Text style={styles.badgeScore}>80%</Text>
                <Text style={styles.badgeEmotion}>😊 Happy</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.notificationIcon}>
            <Ionicons name="notifications-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <Text style={styles.searchPlaceholder}>Search anything...</Text>
        </View>
      </View>

      <Animated.ScrollView
        style={[styles.scrollContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Mental Health Metrics */}
        <Text style={styles.sectionTitle}>Mental Health Metrics</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.metricsScrollView}
        >
          {/* Pal Score Card */}
          <TouchableOpacity
            style={styles.metricCardGreen}
            onPress={() => navigation.navigate('FreudScore')}
          >
            <View style={styles.metricHeader}>
              <Ionicons name="analytics" size={20} color="white" />
              <Text style={styles.metricCardTitle}>Pal Score</Text>
            </View>
            <View style={styles.circularProgressContainer}>
              <View style={styles.circularProgress}>
                <Text style={styles.circularProgressText}>80</Text>
              </View>
            </View>
            <View style={styles.metricBottomText}>
              <Text style={styles.metricCardSubtitle}>Healthy Mind</Text>
              <Text style={styles.metricCardDescription}>Above average</Text>
            </View>
          </TouchableOpacity>

          {/* Mood Card */}
          <TouchableOpacity
            style={styles.metricCardOrange}
            onPress={() => navigation.navigate('FreudScore')}
          >
            <View style={styles.metricHeader}>
              <Ionicons name="happy" size={20} color="white" />
              <Text style={styles.metricCardTitle}>Mood</Text>
            </View>
            <Ionicons name="sad" size={40} color="white" style={styles.moodIcon} />
            <View style={styles.metricBottomText}>
              <Text style={styles.metricCardSubtitle}>Currently Sad</Text>
              <Text style={styles.metricCardDescription}>Improving</Text>
            </View>
          </TouchableOpacity>

          {/* Goals Card */}
          <View style={styles.metricCardBlue}>
            <View style={styles.metricHeader}>
              <Ionicons name="flag" size={20} color="white" />
              <Text style={styles.metricCardTitle}>Goals</Text>
            </View>
            <View style={styles.goalsContainer}>
              <Ionicons name="checkmark-circle" size={24} color="white" />
              <Ionicons name="checkmark-circle" size={24} color="white" />
              <Ionicons name="checkmark-circle" size={24} color="white" />
            </View>
            <View style={styles.metricBottomText}>
              <Text style={styles.metricCardSubtitle}>3 Completed</Text>
              <Text style={styles.metricCardDescription}>2 remaining</Text>
            </View>
          </View>

          {/* Meditate Card */}
          <View style={styles.metricCardPurple}>
            <View style={styles.metricHeader}>
              <Ionicons name="time" size={20} color="white" />
              <Text style={styles.metricCardTitle}>Meditate</Text>
            </View>
            <Ionicons name="timer" size={40} color="white" style={styles.meditateIcon} />
            <View style={styles.metricBottomText}>
              <Text style={styles.metricCardSubtitle}>20 mins</Text>
              <Text style={styles.metricCardDescription}>Daily streak: 7</Text>
            </View>
          </View>

          {/* Journal Card */}
          <View style={styles.metricCardYellow}>
            <View style={styles.metricHeader}>
              <Ionicons name="book" size={20} color="white" />
              <Text style={styles.metricCardTitle}>Journal</Text>
            </View>
            <View style={styles.streakContainer}>
              <Ionicons name="flame" size={30} color="white" />
              <Text style={styles.streakText}>64</Text>
            </View>
            <View style={styles.metricBottomText}>
              <Text style={styles.metricCardSubtitle}>Day Streak</Text>
              <Text style={styles.metricCardDescription}>Keep going!</Text>
            </View>
          </View>
        </ScrollView>
        {/* Mindful Tracker */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Mindful Tracker</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.trackerContainer}>
          {/* Mindful Hours */}
          <View style={styles.trackerItem}>
            <View style={[styles.trackerIcon, { backgroundColor: '#A8D5A8' }]}>
              <Ionicons name="time-outline" size={20} color="white" />
            </View>
            <View style={styles.trackerItemContent}>
              <Text style={styles.trackerItemTitle}>Mindful Hours</Text>
              <Text style={styles.trackerItemSubtitle}>2.5h/8h Today</Text>
            </View>
          </View>

          {/* Sleep Quality */}
          <View style={styles.trackerItem}>
            <View style={[styles.trackerIcon, { backgroundColor: '#87CEEB' }]}>
              <Ionicons name="bed-outline" size={20} color="white" />
            </View>
            <View style={styles.trackerItemContent}>
              <Text style={styles.trackerItemTitle}>Sleep Quality</Text>
              <Text style={styles.trackerItemSubtitle}>Incomplete (-2h Avg)</Text>
            </View>
          </View>

          {/* Mindful Journal */}
          <View style={styles.trackerItem}>
            <View style={[styles.trackerIcon, { backgroundColor: '#FFB347' }]}>
              <Ionicons name="journal-outline" size={20} color="white" />
            </View>
            <View style={styles.trackerItemContent}>
              <Text style={styles.trackerItemTitle}>Mindful Journal</Text>
              <Text style={styles.trackerItemSubtitle}>64 Day Streak</Text>
            </View>
          </View>

          {/* Stress Level */}
          <View style={styles.trackerItem}>
            <View style={[styles.trackerIcon, { backgroundColor: '#FFA07A' }]}>
              <Ionicons name="speedometer-outline" size={20} color="white" />
            </View>
            <View style={styles.trackerItemContent}>
              <Text style={styles.trackerItemTitle}>Stress Level</Text>
              <Text style={styles.trackerItemSubtitle}>Level 3 (Normal)</Text>
            </View>
          </View>

          {/* Mood Tracker */}
          <View style={styles.trackerItem}>
            <View style={[styles.trackerIcon, { backgroundColor: '#DDA0DD' }]}>
              <Ionicons name="analytics-outline" size={20} color="white" />
            </View>
            <View style={styles.trackerItemContent}>
              <Text style={styles.trackerItemTitle}>Mood Tracker</Text>
              <Text style={styles.trackerItemSubtitle}>Sad → Happy → Neutral</Text>
            </View>
          </View>
        </View>

        {/* AI Therapy Chatbot */}
        <View style={styles.chatbotContainer}>
          <View style={styles.chatbotHeader}>
            <Ionicons name="chatbubble-outline" size={24} color="#8B7355" />
            <Text style={styles.chatbotTitle}>AI Therapy Chatbot</Text>
            <TouchableOpacity style={styles.chatbotSettings}>
              <Ionicons name="settings-outline" size={20} color="#8B7355" />
            </TouchableOpacity>
          </View>

          <Text style={styles.chatbotNumber}>2,541</Text>
          <Text style={styles.chatbotSubtext}>Conversations</Text>
          <Text style={styles.chatbotDetails}>💬 83 left this month</Text>

          <View style={styles.chatbotButtons}>
            <TouchableOpacity
              style={styles.chatbotButton}
              onPress={() => navigation.navigate('AISuggestions')}
            >
              <Text style={styles.chatbotButtonText}>Go Pro Now!</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.chatbotButtonOrange}
              onPress={() => navigation.navigate('AISuggestions')}
            >
              <Ionicons name="add" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Mindful Resources */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Mindful Resources</Text>
          <TouchableOpacity onPress={() => navigation.navigate('MindfulnessActivities')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.resourcesContainer}
        >
          <TouchableOpacity
            style={styles.resourceCard}
            onPress={() => navigation.navigate('MindfulnessActivities')}
          >
            <View style={styles.resourceIconContainer}>
              <Ionicons name="leaf" size={30} color="#A8D5A8" />
            </View>
            <Text style={styles.resourceTitle}>Mental Health</Text>
            <Text style={styles.resourceSubtitle}>Will meditation help you get out from the rat race?</Text>
            <View style={styles.resourceStats}>
              <Text style={styles.resourceStat}>👍 5,241</Text>
              <Text style={styles.resourceStat}>💬 987</Text>
              <Text style={styles.resourceStat}>🔗 22</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.resourceCard}>
            <View style={styles.resourceIconContainer}>
              <Ionicons name="leaf" size={30} color="#A8D5A8" />
            </View>
            <Text style={styles.resourceTitle}>Mental Health</Text>
            <Text style={styles.resourceSubtitle}>Will meditation help you get out from it?</Text>
            <View style={styles.resourceStats}>
              <Text style={styles.resourceStat}>👍 5,241</Text>
              <Text style={styles.resourceStat}>💬 9</Text>
              <Text style={styles.resourceStat}>🔗 9</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </Animated.ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home')}>
          <Ionicons name="home" size={24} color="#A8D5A8" />
          <Text style={styles.navTextActive}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('AISuggestions')}>
          <Ionicons name="chatbubbles-outline" size={24} color="#8B7355" />
          <Text style={styles.navText}>Chat</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItemCenter} onPress={() => navigation.navigate('Assessment')}>
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('FreudScore')}>
          <Ionicons name="analytics-outline" size={24} color="#8B7355" />
          <Text style={styles.navText}>Analytics</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('ProfileSetup')}>
          <Ionicons name="person-outline" size={24} color="#8B7355" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3EDE4',
  },
  // Header Styles
  headerContainer: {
    backgroundColor: '#8B7355',
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  greeting: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  badgePro: {
    color: 'white',
    fontSize: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeScore: {
    color: 'white',
    fontSize: 12,
  },
  badgeEmotion: {
    color: 'white',
    fontSize: 12,
  },
  notificationIcon: {
    padding: 5,
  },
  searchContainer: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginTop: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchPlaceholder: {
    color: '#666',
  },

  // Mental Health Metrics Styles
  scrollContent: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'normal',
    color: '#503623',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 15,
  },
  metricsScrollView: {
    paddingHorizontal: 20,
  },
  metricCardGreen: {
    ...metricCardBase,
    backgroundColor: '#A8D5A8',
    justifyContent: 'space-between', // Add this
    paddingBottom: 15, // Add this
  },
  metricCardOrange: {
    ...metricCardBase,
    backgroundColor: '#FF8C42',
    justifyContent: 'space-between', // Add this
    paddingBottom: 15, // Add this
  },
  metricCardBlue: {
    ...metricCardBase,
    backgroundColor: '#87CEEB',
    justifyContent: 'space-between', // Add this
    paddingBottom: 15, // Add this
  },
  metricCardPurple: {
    ...metricCardBase,
    backgroundColor: '#DDA0DD',
    justifyContent: 'space-between', // Add this
    paddingBottom: 15, // Add this
  },
  metricCardYellow: {
    ...metricCardBase,
    backgroundColor: '#FFB347',
    justifyContent: 'space-between', // Add this
    paddingBottom: 15, // Add this
  },
  metricBottomText: {
    alignSelf: 'stretch', // Add this
    marginTop: 'auto', // This pushes the text to the bottom
  },
  metricCardTitle: {
    color: 'white',
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  metricCardSubtitle: {
    color: 'white',
    fontSize: 16,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  circularProgressContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  circularProgress: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circularProgressText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  moodBarGraph: {
    width: 80,
    height: 40,
    backgroundColor: 'rgba(255,255,255,(reverse=True)0.2)',
    marginVertical: 10,
  },
  goalsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  goalDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'white',
    marginHorizontal: 5,
  },
  meditateWaveGraph: {
    width: 80,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 10,
  },
  journalStreakContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
  journalStreak: {
    width: 15,
    height: 15,
    backgroundColor: 'white',
    marginHorizontal: 2,
  },

  // Tracker Styles
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  seeAllText: {
    color: '#A8D5A8',
    fontSize: 14,
  },
  trackerContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    marginHorizontal: 20,
    padding: 15,
  },
  trackerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    borderRadius: 5
  },
  trackerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  trackerItemContent: {
    flex: 1,
  },
  trackerItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  trackerItemSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  trackerItemValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },

  // Chatbot Styles
  chatbotContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    alignItems: 'center',
  },
  chatbotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 15,
  },
  chatbotTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginLeft: 10,
  },
  chatbotSettings: {
    padding: 5,
  },
  chatbotNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  chatbotSubtext: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  chatbotDetails: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  chatbotButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  chatbotButton: {
    backgroundColor: '#A8D5A8',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginRight: 10,
  },
  chatbotButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  chatbotButtonOrange: {
    backgroundColor: '#FF8C42',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Resources Styles
  resourcesContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  resourceCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginRight: 15,
    width: 250,
  },
  resourceIconContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  resourceTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  resourceSubtitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  resourceStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  resourceStat: {
    fontSize: 10,
    color: '#666',
  },

  // Bottom Navigation Styles
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  navItem: {
    alignItems: 'center',
  },
  navItemCenter: {
    backgroundColor: '#A8D5A8',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navText: {
    fontSize: 10,
    color: '#8B7355',
    marginTop: 4,
  },
  navTextActive: {
    fontSize: 10,
    color: '#A8D5A8',
    marginTop: 4,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  metricCardTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  metricCardSubtitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  metricCardDescription: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 4,
  },
  moodIcon: {
    marginVertical: 10,
    alignSelf: 'center',
  },
  meditateIcon: {
    marginVertical: 10,
    alignSelf: 'center',
  },
  goalsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginVertical: 10,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  streakText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  trackerContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    marginHorizontal: 20,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trackerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  trackerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  trackerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  trackerItemContent: {
    flex: 1,
  },
  trackerItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  trackerItemSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  trackerItemValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
});

export default HomeScreen;
