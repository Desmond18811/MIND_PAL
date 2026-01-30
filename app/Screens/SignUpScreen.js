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

// API Configuration
const api = axios.create({
  baseURL: 'https://mind-pal-jgpr.onrender.com',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

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

// Sign Up Screen
const SignUpScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignUp = async () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Invalid Email Address!!!';
    }

    if (!username.trim()) {
      newErrors.username = 'Username is required';
    } else if (username.trim().length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/api/auth/register', {
        email: email.trim().toLowerCase(),
        username: username.trim(),
        password,
      });

      if (response.data.status === 'success') {
        Alert.alert(
          'Success',
          'Account created successfully! Please sign in.',
          [
            {
              text: 'Sign In',
              onPress: () => navigation.navigate('SignIn')
            }
          ]
        );
      }
    } catch (error) {
      console.error('Sign up error:', error);
      Alert.alert(
        'Registration Failed',
        error.response?.data?.message || 'Failed to create account. Please try again.'
      );
    } finally {
      setLoading(false);
    }
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
          
          <Text style={styles.title}>Sign Up For Free</Text>

          <View style={styles.formContainer}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <View style={[styles.inputContainer, errors.email && styles.inputError]}>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your email..."
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
            {errors.email && (
              <View style={styles.errorContainer}>
                <Text style={styles.warningIcon}>⚠️</Text>
                <Text style={styles.errorTextWarning}>{errors.email}</Text>
              </View>
            )}

            <Text style={styles.inputLabel}>Username</Text>
            <View style={[styles.inputContainer, errors.username && styles.inputError]}>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your username..."
                placeholderTextColor={colors.placeholderText}
                value={username}
                onChangeText={(text) => {
                  setUsername(text);
                  if (errors.username) {
                    setErrors(prev => ({ ...prev, username: null }));
                  }
                }}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}

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

            <Text style={styles.inputLabel}>Password Confirmation</Text>
            <View style={[styles.inputContainer, errors.confirmPassword && styles.inputError]}>
              <TextInput
                style={styles.textInput}
                placeholder="Confirm your password..."
                placeholderTextColor={colors.placeholderText}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (errors.confirmPassword) {
                    setErrors(prev => ({ ...prev, confirmPassword: null }));
                  }
                }}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Text style={styles.eyeText}>{showConfirmPassword ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
            {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}

            <TouchableOpacity
              style={styles.signInButton}
              onPress={handleSignUp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={colors.textLight} />
              ) : (
                <>
                  <Text style={styles.signInButtonText}>Sign Up</Text>
                  <Text style={styles.arrowText}>→</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.footerContainer}>
              <Text style={styles.footerText}>
                Already have an account?{' '}
                <Text 
                  style={styles.linkText}
                  onPress={() => navigation.navigate('SignIn')}
                >
                  Sign In
                </Text>
              </Text>
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
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningOrange,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 15,
  },
  warningIcon: {
    marginRight: 8,
    fontSize: 16,
  },
  errorTextWarning: {
    color: colors.textLight,
    fontSize: 14,
    fontWeight: '500',
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

export default SignUpScreen;





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
// import FeatherIcon from 'react-native-vector-icons/Feather';
// import { useNavigation } from '@react-navigation/native';
// import axios from 'axios';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const colors = {
//   primaryGreen: '#8EBA6B',
//   darkBrown: '#6D482F',
//   lightBeige: '#F3EDE4',
//   textDark: '#333333',
//   textLight: '#FFFFFF',
//   borderColor: '#8DC63F',
//   socialButtonBorder: '#DEDEDE',
//   orangeLink: '#FF6600',
//   placeholderText: '#A0A0A0',
//   errorRed: '#FF0000',
//   darkBackground: '#4A4A4A',
// };

// const { height } = Dimensions.get('window');

// const SignUpScreen = () => {
//   const navigation = useNavigation();
//   const [email, setEmail] = useState('');
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [emailError, setEmailError] = useState('');
//   const [usernameError, setUsernameError] = useState('');
//   const [passwordError, setPasswordError] = useState('');
//   const [loading, setLoading] = useState(false);

//   const validateEmail = (email) => {
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return emailRegex.test(email);
//   };

//   const validateUsername = (username) => {
//     return username.length >= 3;
//   };

//   const validatePassword = (password) => {
//     return password.length >= 6;
//   };

//   const handleSignUp = async () => {
//     let hasError = false;

//     // Validate email
//     if (!validateEmail(email)) {
//       setEmailError('Please enter a valid email address');
//       hasError = true;
//     } else {
//       setEmailError('');
//     }

//     // Validate username
//     if (!validateUsername(username)) {
//       setUsernameError('Username must be at least 3 characters long');
//       hasError = true;
//     } else {
//       setUsernameError('');
//     }

//     // Validate password
//     if (!validatePassword(password)) {
//       setPasswordError('Password must be at least 6 characters long');
//       hasError = true;
//     } else if (password !== confirmPassword) {
//       setPasswordError('Passwords do not match');
//       hasError = true;
//     } else {
//       setPasswordError('');
//     }

//     if (hasError) return;

//     setLoading(true);
    
//     try {
//       console.log('Attempting sign up with:', { email, username, password });
      
//       const api = axios.create({
//         baseURL: 'https://mind-pal-jgpr.onrender.com',
//         headers: {
//           'Content-Type': 'application/json',
//           'Accept': 'application/json'
//         }
//       });

//       const response = await api.post('/api/auth/register', {
//         email,
//         username,
//         password,
//       });
      
//       console.log('Sign up response:', response.data);
      
//       const { token, data } = response.data;
//       await AsyncStorage.setItem('token', token);
//       await AsyncStorage.setItem('user', JSON.stringify(data));
      
//       Alert.alert('Success', 'Sign-up successful!');
//       navigation.navigate('Assessment');
      
//     } catch (error) {
//       console.error('Full error:', {
//         message: error.message,
//         response: error.response?.data,
//         request: error.request,
//         config: error.config
//       });
      
//       let errorMessage = 'An error occurred. Please try again.';
      
//       if (error.response) {
//         if (error.response.status === 400) {
//           errorMessage = error.response.data?.error || 
//                         error.response.data?.message || 
//                         'Validation failed. Please check your inputs.';
//         } else {
//           errorMessage = `Server error: ${error.response.status}`;
//         }
//       } else if (error.request) {
//         errorMessage = 'No response from server. Check your connection.';
//       }
      
//       Alert.alert('Sign Up Failed', errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <StatusBar barStyle="light-content" backgroundColor={colors.primaryGreen} />

//       {/* Top Green Background Area */}
//       <View style={styles.topBackground}>
//         <View style={styles.logoContainer}>
//           <Text style={styles.logo}>🍃</Text>
//         </View>
//       </View>

//       {/* Main Content Section */}
//       <View style={styles.contentSection}>
//         <Text style={styles.signUpTitle}>Sign Up For Free</Text>

//         {/* Email Input */}
//         <Text style={styles.inputLabel}>Email Address</Text>
//         <View style={[styles.inputContainer, emailError && styles.inputErrorBorder]}>
//           <FeatherIcon name="mail" size={20} color={colors.darkBrown} style={styles.inputIcon} />
//           <TextInput
//             style={styles.textInput}
//             placeholder="Enter your email..."
//             placeholderTextColor={colors.placeholderText}
//             keyboardType="email-address"
//             autoCapitalize="none"
//             value={email}
//             onChangeText={(text) => {
//               setEmail(text);
//               setEmailError('');
//             }}
//             editable={!loading}
//           />
//         </View>
//         {emailError ? <Text style={styles.errorMessage}>{emailError}</Text> : null}

//         {/* Username Input */}
//         <Text style={styles.inputLabel}>Username</Text>
//         <View style={[styles.inputContainer, usernameError && styles.inputErrorBorder]}>
//           <FeatherIcon name="user" size={20} color={colors.darkBrown} style={styles.inputIcon} />
//           <TextInput
//             style={styles.textInput}
//             placeholder="Enter your username..."
//             placeholderTextColor={colors.placeholderText}
//             autoCapitalize="none"
//             value={username}
//             onChangeText={(text) => {
//               setUsername(text);
//               setUsernameError('');
//             }}
//             editable={!loading}
//           />
//         </View>
//         {usernameError ? <Text style={styles.errorMessage}>{usernameError}</Text> : null}

//         {/* Password Input */}
//         <Text style={styles.inputLabel}>Password</Text>
//         <View style={[styles.inputContainer, passwordError && styles.inputErrorBorder]}>
//           <FeatherIcon name="lock" size={20} color={colors.darkBrown} style={styles.inputIcon} />
//           <TextInput
//             style={styles.textInput}
//             placeholder="Enter your password..."
//             placeholderTextColor={colors.placeholderText}
//             secureTextEntry={!showPassword}
//             value={password}
//             onChangeText={(text) => {
//               setPassword(text);
//               setPasswordError('');
//             }}
//             editable={!loading}
//           />
//           <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
//             <FeatherIcon name={showPassword ? 'eye' : 'eye-off'} size={20} color={colors.placeholderText} />
//           </TouchableOpacity>
//         </View>

//         {/* Password Confirmation Input */}
//         <Text style={styles.inputLabel}>Password Confirmation</Text>
//         <View style={[styles.inputContainer, passwordError && styles.inputErrorBorder]}>
//           <FeatherIcon name="lock" size={20} color={colors.darkBrown} style={styles.inputIcon} />
//           <TextInput
//             style={styles.textInput}
//             placeholder="Confirm your password..."
//             placeholderTextColor={colors.placeholderText}
//             secureTextEntry={!showConfirmPassword}
//             value={confirmPassword}
//             onChangeText={(text) => {
//               setConfirmPassword(text);
//               setPasswordError('');
//             }}
//             editable={!loading}
//           />
//           <TouchableOpacity
//             onPress={() => setShowConfirmPassword(!showConfirmPassword)}
//             style={styles.eyeIcon}
//           >
//             <FeatherIcon name={showConfirmPassword ? 'eye' : 'eye-off'} size={20} color={colors.placeholderText} />
//           </TouchableOpacity>
//         </View>
//         {passwordError ? <Text style={styles.errorMessage}>{passwordError}</Text> : null}

//         {/* Sign Up Button */}
//         <TouchableOpacity
//           style={[styles.signUpButton, loading && styles.signUpButtonDisabled]}
//           onPress={handleSignUp}
//           disabled={loading}
//         >
//           {loading ? (
//             <ActivityIndicator color={colors.textLight} />
//           ) : (
//             <>
//               <Text style={styles.signUpButtonText}>Sign Up</Text>
//               <FeatherIcon name="arrow-right" size={20} color={colors.textLight} style={styles.buttonArrow} />
//             </>
//           )}
//         </TouchableOpacity>

//         {/* Already have an account? Sign In. */}
//         <View style={styles.bottomLinkContainer}>
//           <Text style={styles.alreadyAccountText}>
//             Already have an account?{' '}
//             <Text
//               style={styles.signInLink}
//               onPress={() => navigation.navigate('SignIn')}
//             >
//               Sign In.
//             </Text>
//           </Text>
//         </View>
//       </View>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: colors.primaryGreen,
//   },
//   topBackground: {
//     height: height * 0.25,
//     backgroundColor: colors.primaryGreen,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingTop: 20,
//   },
// logoContainer: {
//     // Logo is centered within the topBackground View
//   },
//   logo: {
//     fontSize: 64, // Adjusted size to match 64x64 visual
//     color: '#8B6A56',
//   },
//   contentSection: {
//     flex: 1,
//     backgroundColor: colors.lightBeige,
//     borderTopLeftRadius: 60,
//     borderTopRightRadius: 60,
//     marginTop: -20,
//     paddingHorizontal: 30,
//     paddingTop: 20,
//   },
//   signUpTitle: {
//     fontSize: 30,
//     fontWeight: 'bold',
//     color: colors.darkBrown,
//     textAlign: 'left',
//     marginBottom: 20,
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
//     height: 50,
//   },
//   inputErrorBorder: {
//     borderColor: colors.errorRed,
//   },
//   inputIcon: {
//     marginRight: 10,
//   },
//   textInput: {
//     flex: 1,
//     fontSize: 16,
//     color: colors.textDark,
//   },
//   eyeIcon: {
//     paddingLeft: 10,
//   },
//   errorMessage: {
//     color: colors.errorRed,
//     fontSize: 13,
//     marginBottom: 10,
//     marginLeft: 5,
//     marginTop: -15,
//   },
//   signUpButton: {
//     flexDirection: 'row',
//     backgroundColor: colors.darkBrown,
//     borderRadius: 15,
//     paddingVertical: 15,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: 20,
//     marginBottom: 30,
//   },
//   signUpButtonDisabled: {
//     opacity: 0.6,
//   },
//   signUpButtonText: {
//     color: colors.textLight,
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginRight: 10,
//   },
//   buttonArrow: {
//     marginLeft: 5,
//   },
//   bottomLinkContainer: {
//     alignItems: 'center',
//     marginTop: 20,
//     marginBottom: 10,
//   },
//   alreadyAccountText: {
//     fontSize: 15,
//     color: colors.darkBrown,
//   },
//   signInLink: {
//     color: colors.orangeLink,
//     fontWeight: 'bold',
//   },
// });

// export default SignUpScreen;
