

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

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

// Logo Component
const LogoComponent = () => (
  <View style={styles.logoContainer}>
    <View style={styles.logoSymbol}>
      <View style={styles.logoCenter} />
      <View style={[styles.logoPetal, styles.logoTop]} />
      <View style={[styles.logoPetal, styles.logoRight]} />
      <View style={[styles.logoPetal, styles.logoBottom]} />
      <View style={[styles.logoPetal, styles.logoLeft]} />
    </View>
  </View>
);

// Login Screen
const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignIn = async () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setLoading(true);
    setLoading(true);
    try {
      // Mock API call for testing
      // const response = await axios.post('https://mind-pal-jgpr.onrender.com/api/auth/login', {
      //   email: email.trim().toLowerCase(),
      //   password,
      // });

      // Mock successful response
      setTimeout(async () => {
        const mockUser = {
            id: 'mock-user-id',
            name: 'Test User',
            email: email,
            onboardingCompleted: false // Set to false to test assessment flow, or true to skip
        };
        
        await AsyncStorage.setItem('token', 'mock-token-123');
        await AsyncStorage.setItem('user', JSON.stringify(mockUser));

        setLoading(false);
        
        Alert.alert('Success', 'Welcome back! (Mock Mode)', [
          {
            text: 'Continue',
            onPress: () => {
               // Check if onboarding is "completed" based on our mock logic
               // For testing full flow, we might want to default to not completed
               // or allow toggling. For now, let's assume not completed to show assessment.
               navigation.navigate('Assessment');
            }
          }
        ]);
      }, 1000);

      // if (response.data.status === 'success') {
      //   // Store token
      //   await AsyncStorage.setItem('token', response.data.data.token);
      //   await AsyncStorage.setItem('user', JSON.stringify(response.data.data.user));

      //   Alert.alert('Success', 'Welcome back!', [
      //     {
      //       text: 'Continue',
      //       onPress: () => {
      //         // Navigate based on onboarding status
      //         if (response.data.data.user.onboardingCompleted) {
      //           navigation.reset({
      //             index: 0,
      //             routes: [{ name: 'Home' }],
      //           });
      //         } else {
      //           navigation.navigate('Assessment');
      //         }
      //       }
      //     }
      //   ]);
      // }
    } catch (error) {
      console.error('Sign in error:', error);
      Alert.alert(
        'Sign In Failed',
        // error.response?.data?.message || 'Please check your credentials and try again.'
        'Mock Login Failed'
      );
      setLoading(false);
    } 
    // finally {
    //   setLoading(false);
    // }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.lightBeige} />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <LogoComponent />
          
          <Text style={styles.title}>Sign In To freud.ai</Text>

          <View style={styles.formContainer}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <View style={[styles.inputContainer, errors.email && styles.inputError]}>
              <TextInput
                style={styles.textInput}
                placeholder="princesskaguya@gmail.com"
                placeholderTextColor={colors.placeholderText}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) {
                    setErrors(prev => ({ ...prev, email: null }));
                  }
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

            <Text style={styles.inputLabel}>Password</Text>
            <View style={[styles.inputContainer, errors.password && styles.inputError]}>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your password..."
                placeholderTextColor={colors.placeholderText}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) {
                    setErrors(prev => ({ ...prev, password: null }));
                  }
                }}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

            <TouchableOpacity
              style={styles.signInButton}
              onPress={handleSignIn}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={colors.textLight} />
              ) : (
                <>
                  <Text style={styles.signInButtonText}>Sign In</Text>
                  <Text style={styles.arrowText}>→</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.socialContainer}>
              <TouchableOpacity style={styles.socialButton}>
                <Text style={styles.socialButtonText}>f</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <Text style={styles.socialButtonText}>G</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <Text style={styles.socialButtonText}>📷</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footerContainer}>
              <Text style={styles.footerText}>
                Don't have an account?{' '}
                <Text 
                  style={styles.linkText}
                  onPress={() => navigation.navigate('SignUp')}
                >
                  Sign Up
                </Text>
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                <Text style={styles.linkText}>Forgot Password</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightBeige,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  logoSymbol: {
    width: 60,
    height: 60,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoCenter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.textLight,
    position: 'absolute',
    zIndex: 5,
  },
  logoPetal: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
    backgroundColor: colors.textLight,
    position: 'absolute',
  },
  logoTop: { top: -5 },
  logoRight: { right: -5 },
  logoBottom: { bottom: -5 },
  logoLeft: { left: -5 },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.darkBrown,
    textAlign: 'center',
    marginBottom: 40,
  },
  formContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 16,
    color: colors.darkBrown,
    marginBottom: 8,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.textLight,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: colors.borderColor,
    marginBottom: 5,
    paddingHorizontal: 20,
  },
  inputError: {
    borderColor: colors.errorRed,
  },
  textInput: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
    color: colors.textDark,
  },
  eyeIcon: {
    padding: 5,
  },
  eyeText: {
    fontSize: 18,
  },
  errorText: {
    color: colors.errorRed,
    fontSize: 14,
    marginBottom: 15,
    marginLeft: 5,
  },
  signInButton: {
    backgroundColor: colors.darkBrown,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 25,
    marginTop: 20,
    marginBottom: 30,
  },
  signInButtonText: {
    color: colors.textLight,
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
  arrowText: {
    color: colors.textLight,
    fontSize: 18,
    fontWeight: 'bold',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.textLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  socialButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.darkBrown,
  },
  footerContainer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    color: colors.textDark,
    marginBottom: 10,
  },
  linkText: {
    color: colors.warningOrange,
    fontWeight: '600',
  },
});

export default LoginScreen;


// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   SafeAreaView,
//   StatusBar,
//   Dimensions,
//   ActivityIndicator,
//   Alert,
// } from 'react-native';
// // Import icons. Make sure react-native-vector-icons is installed.

// import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // For the logo and social icons
// import FeatherIcon from 'react-native-vector-icons/Feather'; // For mail, lock, eye, and arrow icons
// import { useNavigation } from '@react-navigation/native';
// import axios from 'axios';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const { width, height } = Dimensions.get('window');

// // Define colors based on the image
// const colors = {
//   primaryGreen: '#8EBA6B', // The main green color
//   darkBrown: '#6D482F',    // The dark brown for titles, buttons, icons
//   lightBeige: '#F3EDE4',   // The background color for the main content
//   textDark: '#333333',     // General dark text color
//   textLight: '#FFFFFF',    // White text for buttons
//   borderColor: '#8DC63F',  // Border color for text inputs (a slightly different green)
//   socialButtonBorder: '#DEDEDE', // Light grey border for social buttons
//   orangeLink: '#FF6600',   // Orange color for "Sign Up" and "Forgot Password"
//   placeholderText: '#A0A0A0', // Color for input placeholders
// };

// const SignInScreen = () => {
//   const navigation = useNavigation();
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [emailError, setEmailError] = useState(false); // State for email error
//   const [loading, setLoading] = useState(false);
 
//   const handleSignIn = async () => {
//     if (!email.includes('@') || !email.includes('.')) {
//       setEmailError(true);
//       return;
//     }
//     setEmailError(false);
//     setLoading(true);
//     try {
//       const response = await axios.post('https://mind-pal-jgpr.onrender.com/api/auth/login', {
//         email,
//         password,
//       });
//       const { token, data } = response.data;
//       await AsyncStorage.setItem('authToken', token);
//       await AsyncStorage.setItem('userData', JSON.stringify(data.user));
//       Alert.alert('Success', 'Login successful!');
//       navigation.navigate('Home');
//     } catch (error) {
//       console.error('Login error:', error);
//       Alert.alert('Error', error.response?.data?.message || 'Network error. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };
//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <StatusBar barStyle="light-content" backgroundColor={colors.primaryGreen} />

//       {/* Top Green Background Area */}
//       <View style={styles.topBackground}>
//         {/* Logo - approximated with an icon */}
//         <View style={styles.logoContainer}>
//            <Text style={styles.logo}>🍃</Text>
//         </View>
//       </View>

//       {/* Main Content Section - This creates the 'wave' effect */}
//       <View style={styles.contentSection}>
//         <Text style={styles.signInTitle}>Sign In To MindPal</Text>

//         {/* Email Input */}
//         <Text style={styles.inputLabel}>Email Address</Text>
//         <View style={styles.inputContainer}>
//           <FeatherIcon name="mail" size={20} color={colors.darkBrown} style={styles.inputIcon} />
//           <TextInput
//             style={styles.textInput}
//             placeholder="princesskaguya@gmail.co"
//             placeholderTextColor={colors.placeholderText}
//             keyboardType="email-address"
//             autoCapitalize="none"
//             value={email}
//             onChangeText={setEmail}
//             editable={!loading}
//           />
//         </View>

//         {/* Password Input */}
//         <Text style={styles.inputLabel}>Password</Text>
//         <View style={styles.inputContainer}>
//           <FeatherIcon name="lock" size={20} color={colors.darkBrown} style={styles.inputIcon} />
//           <TextInput
//             style={styles.textInput}
//             placeholder="Enter your password..."
//             placeholderTextColor={colors.placeholderText}
//             secureTextEntry={!showPassword}
//             value={password}
//             onChangeText={setPassword}
//             editable={!loading}
//           />
//           <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
//             <FeatherIcon name={showPassword ? "eye" : "eye-off"} size={20} color={colors.placeholderText} />
//           </TouchableOpacity>
//         </View>

//         {/* Sign In Button */}
//         <TouchableOpacity 
//         style={[styles.signInButton, loading && styles.signInButtonDisabled]} 
//         onPress={handleSignIn}
//         disabled={loading}>
//         {loading ? (
//           <ActivityIndicator color={'#fff'} />
//         ) : (
//           <>
//             <Text style={styles.signInButtonText}>Sign In</Text>
//             <FeatherIcon name="arrow-right" size={20} color={colors.textLight} style={styles.buttonArrow} />
//           </>
//         )}
//         </TouchableOpacity>

//         {/* Social Login Buttons */}
//         <View style={styles.socialButtonsContainer}>
//           <TouchableOpacity style={styles.socialButton}>
//             <Icon name="facebook" size={30} color={colors.darkBrown} />
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.socialButton}>
//             <Icon name="google" size={30} color={colors.darkBrown} />
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.socialButton}>
//             <Icon name="instagram" size={30} color={colors.darkBrown} />
//           </TouchableOpacity>
//         </View>

//         {/* Sign Up / Forgot Password Links */}
//         <View style={styles.bottomLinksContainer}>
//           <Text style={styles.dontHaveAccountText}>
//             Don't have an account?{' '}
//             <Text style={styles.signUpText} onPress={() => navigation.navigate('SignUp')} >Sign Up.</Text>
//           </Text>
//           <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
//             <Text style={styles.forgotPasswordText}>Forgot Password</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: colors.primaryGreen, // Ensures top status bar area is green
//   },
//   topBackground: {
//     height: height * 0.25, // Adjust this height as needed to control the green area
//     backgroundColor: colors.primaryGreen,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingTop: 20, // Small padding to push content down from the very top
//   },
//   logoContainer: {
//     // Logo is centered within the topBackground View
//   },
//   logo: {
//     fontSize: 64, // Adjusted size to match 64x64 visual
//     color: '#8B6A56',
//   },
//   contentSection: {
//     flex: 1,
//     backgroundColor: colors.lightBeige,
//     borderTopLeftRadius: 60, // Large radius for the wave effect
//     borderTopRightRadius: 60, // Large radius for the wave effect
//     marginTop: -20, // Pulls this section up to overlap the green background, creating the wave
//     paddingHorizontal: 30, // Horizontal padding for content
//     paddingTop: 20, // Padding at the top of the content area
//   },
//   signInTitle: {
//     fontSize: 30,
//     fontWeight: 'bold',
//     color: colors.darkBrown,
//     textAlign: 'left',
//     marginBottom: 40, // Space after title
//   },
//   inputLabel: {
//     fontSize: 16,
//     color: colors.darkBrown,
//     marginBottom: 8,
//     fontWeight: '500',
//   },
//   inputContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: colors.textLight,
//     borderRadius: 15,
//     borderWidth: 1,
//     borderColor: colors.borderColor,
//     marginBottom: 20,
//     paddingHorizontal: 15,
//     height: 50, // Fixed height for input fields
//   },
//   inputIcon: {
//     marginRight: 10,
//   },
//   textInput: {
//     flex: 1, // Takes up remaining space
//     fontSize: 16,
//     color: colors.textDark,
//   },
//   eyeIcon: {
//     paddingLeft: 10, // Space for the eye icon
//   },
//   signInButton: {
//     flexDirection: 'row',
//     backgroundColor: colors.darkBrown,
//     borderRadius: 15,
//     paddingVertical: 15,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: 20,
//     marginBottom: 30,
//   },
//   signInButtonText: {
//     color: colors.textLight,
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginRight: 10,
//   },
//   buttonArrow: {
//     marginLeft: 5,
//   },
//   socialButtonsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-around', // Distributes social buttons evenly
//     marginBottom: 40,
//   },
//   socialButton: {
//     width: 60,
//     height: 60,
//     borderRadius: 30, // Half of width/height to make it a circle
//     backgroundColor: colors.textLight,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: colors.socialButtonBorder,
//   },
//   bottomLinksContainer: {
//     alignItems: 'center', // Centers the links horizontally
//     marginTop: 20, // Pushes this container to the bottom
//     marginBottom: 10, // Space from the bottom edge
//   },
//   dontHaveAccountText: {
//     fontSize: 15,
//     color: colors.darkBrown,
//     marginBottom: 10,
//   },
//   signUpText: {
//     color: colors.orangeLink,
//     fontWeight: 'bold',
    
//     marginBottom:20
//   },
//   forgotPasswordText: {
//     fontSize: 15,
//     color: colors.orangeLink,
//     fontWeight: 'bold',
//   },

  
// });

// export default SignInScreen;
