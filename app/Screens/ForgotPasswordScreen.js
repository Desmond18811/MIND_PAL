import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

const colors = {
  primaryGreen: '#8EBA6B',
  darkBrown: '#6D482F',
  lightBeige: '#F3EDE4',
  textDark: '#333333',
  textLight: '#FFFFFF',
  borderColor: '#8DC63F',
  placeholderText: '#A0A0A0',
  errorRed: '#FF0000',
  warningOrange: '#FF8C00',
  lightGray: '#E0E0E0',
};

// Forgot Password Screen
const ForgotPasswordScreen = ({ navigation }) => {
  const [resetMethod, setResetMethod] = useState('password'); // 'password' or '2fa'
  const [loading, setLoading] = useState(false);

  const handleSendPassword = async () => {
    setLoading(true);
    try {
      // Add your forgot password logic here
      setTimeout(() => {
        navigation.navigate('VerificationCode');
        setLoading(false);
      }, 2000);
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Failed to send reset instructions');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.lightBeige} />
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.forgotPasswordContainer}>
        <Text style={styles.forgotPasswordTitle}>Forgot Password</Text>
        <Text style={styles.forgotPasswordSubtitle}>
          Select contact details where you want to reset your password.
        </Text>

        <View style={styles.resetOptionsContainer}>
          <TouchableOpacity
            style={[
              styles.resetOption,
              resetMethod === '2fa' && styles.selectedResetOption
            ]}
            onPress={() => setResetMethod('2fa')}
          >
            <View style={styles.resetOptionIcon}>
              <Text style={styles.lockIcon}>🔒</Text>
            </View>
            <Text style={styles.resetOptionText}>Use 2FA</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.resetOption,
              resetMethod === 'password' && styles.selectedResetOption
            ]}
            onPress={() => setResetMethod('password')}
          >
            <View style={styles.resetOptionIcon}>
              <Text style={styles.passwordIcon}>🔑</Text>
            </View>
            <Text style={styles.resetOptionText}>Password</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.resetOption]}
            onPress={() => setResetMethod('google')}
          >
            <View style={styles.resetOptionIcon}>
              <Text style={styles.googleIcon}>🔍</Text>
            </View>
            <Text style={styles.resetOptionText}>Google Authenticator</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.sendPasswordButton}
          onPress={handleSendPassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.textLight} />
          ) : (
            <>
              <Text style={styles.sendPasswordButtonText}>Send Password</Text>
              <Text style={styles.sendPasswordIcon}>🔒</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightBeige,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.textLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  backButtonText: {
    fontSize: 24,
    color: colors.textDark,
    fontWeight: 'bold',
  },
  forgotPasswordContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  forgotPasswordTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.darkBrown,
    marginBottom: 15,
  },
  forgotPasswordSubtitle: {
    fontSize: 16,
    color: colors.textDark,
    lineHeight: 24,
    marginBottom: 40,
  },
  resetOptionsContainer: {
    marginBottom: 40,
  },
  resetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.textLight,
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: colors.lightGray,
  },
  selectedResetOption: {
    borderColor: colors.primaryGreen,
    backgroundColor: '#f0f8ff',
  },
  resetOptionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  lockIcon: {
    fontSize: 24,
  },
  passwordIcon: {
    fontSize: 24,
  },
  googleIcon: {
    fontSize: 24,
  },
  resetOptionText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.darkBrown,
  },
  sendPasswordButton: {
    backgroundColor: colors.darkBrown,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 25,
  },
  sendPasswordButtonText: {
    color: colors.textLight,
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
  sendPasswordIcon: {
    fontSize: 18,
  },
});

export default ForgotPasswordScreen;



// import React, { useState } from 'react';
// import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import FeatherIcon from 'react-native-vector-icons/Feather';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import axios from 'axios';

// const ForgotPasswordScreen = () => {
//   const navigation = useNavigation();
//   const [email, setEmail] = useState('');

//   const handleResetPassword = async () => {
//     try {
//       const response = await axios.post('https://mind-pal-jgpr.onrender.com/api/auth/forgot-password', {
//         email,
//       });
//       // Store userId in AsyncStorage
//       await AsyncStorage.setItem('resetUserId', response.data.userId);
//       Alert.alert('Success', 'OTP sent to your email');
//       // Navigate to ResetPasswordScreen
//       navigation.navigate('ResetPassword');
//     } catch (error) {
//       Alert.alert('Error', error.response?.data?.error || 'Something went wrong');
//     }
//   };

//   return (
//     <SafeAreaView style={styles.container}>
   
//       <View style={styles.content}>
//         <Text style={styles.title}>Forgot Password</Text>
//         <Text style={styles.subtitle}>Enter your email to receive a reset link</Text>
        
//         <TextInput
//           style={styles.input}
//           placeholder="Enter your email"
//           value={email}
//           onChangeText={setEmail}
//           keyboardType="email-address"
//           autoCapitalize="none"
//         />
        
//         <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
//           <Text style={styles.buttonText}>Send Reset Link</Text>
//           <FeatherIcon name="arrow-right" size={20} color="white" style={styles.icon} />
//         </TouchableOpacity>
        
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Text style={styles.backLink}>Back to Sign In</Text>
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F3EDE4',
//   },
//   content: {
//     flex: 1,
//     padding: 30,
//     justifyContent: 'center',
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     color: '#6D482F',
//     marginBottom: 10,
//   },
//   subtitle: {
//     fontSize: 16,
//     color: '#666',
//     marginBottom: 30,
//   },
//   input: {
//     height: 50,
//     borderWidth: 1,
//     borderColor: '#8DC63F',
//     borderRadius: 15,
//     paddingHorizontal: 15,
//     marginBottom: 20,
//     backgroundColor: 'white',
//   },
//   button: {
//     flexDirection: 'row',
//     backgroundColor: '#6D482F',
//     borderRadius: 15,
//     padding: 15,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   buttonText: {
//     color: 'white',
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginRight: 10,
//   },
//   backLink: {
//     color: '#FF6600',
//     textAlign: 'center',
//     fontWeight: 'bold',
//   },
//   icon: {
//     marginLeft: 5,
//   },
// });

// export default ForgotPasswordScreen;