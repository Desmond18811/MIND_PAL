import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const { width, height } = Dimensions.get('window');

const colors = {
  primaryGreen: '#8EBA6B',
  darkBrown: '#6D482F',
  lightBeige: '#F3EDE4',
  textDark: '#333333',
  textLight: '#FFFFFF',
  borderColor: '#8DC63F',
  placeholderText: '#A0A0A0',
  errorRed: '#FF0000',
  lightGray: '#E0E0E0',
  successGreen: '#4CAF50',
};

const AssessmentScreen = ({ navigation }) => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    // Animate question appearance
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [currentQuestionIndex]);

  const fetchQuestions = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      // if (!token) {
      //   navigation.navigate('SignIn');
      //   return;
      // }

      // Mock questions data
      const mockQuestions = [
        {
          _id: 'q1',
          questionText: 'How have you been feeling lately?',
          inputType: 'select',
          category: 'mood',
          options: [
            { _id: 'o1', value: 'Great', label: 'Great' },
            { _id: 'o2', value: 'Good', label: 'Good' },
            { _id: 'o3', value: 'Okay', label: 'Okay' },
            { _id: 'o4', value: 'Not so good', label: 'Not so good' }
          ]
        },
        {
          _id: 'q2',
          questionText: 'On a scale of 1-5, how stressed do you feel?',
          inputType: 'scale',
          category: 'stress',
          options: [
            { _id: 's1', value: '1', label: '1' },
            { _id: 's2', value: '2', label: '2' },
            { _id: 's3', value: '3', label: '3' },
            { _id: 's4', value: '4', label: '4' },
            { _id: 's5', value: '5', label: '5' }
          ]
        },
        {
          _id: 'q3',
          questionText: 'What is your age?',
          inputType: 'text',
          category: 'demographics',
          options: []
        }
      ];

      setQuestions(mockQuestions);

      // const response = await axios.get(
      //   'https://mind-pal-jgpr.onrender.com/api/assessment/questions',
      //   {
      //     headers: {
      //       Authorization: `Bearer ${token}`,
      //       'Content-Type': 'application/json',
      //     },
      //   }
      // );

      // if (response.data.status === 'success') {
      //   setQuestions(response.data.data.questions);
      // } else {
      //   throw new Error('Failed to fetch questions');
      // }
    } catch (error) {
      console.error('Error fetching questions:', error);
      // const errorMessage = error.response?.data?.message || 'Failed to load assessment questions';
      // setError(errorMessage);
      // Alert.alert('Error', errorMessage);
      // Fallback for demo if error occurs
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const validateAnswer = (question, answer) => {
    if (!answer || answer.toString().trim() === '') {
      return false;
    }

    // Additional validation for text inputs
    if (question.inputType === 'text') {
      const trimmedAnswer = answer.toString().trim();
      if (question.questionText.toLowerCase().includes('age')) {
        const age = parseInt(trimmedAnswer);
        return age >= 13 && age <= 120; // Reasonable age range
      }
      if (question.questionText.toLowerCase().includes('weight')) {
        const weight = parseFloat(trimmedAnswer);
        return weight > 0 && weight <= 1000; // Reasonable weight range
      }
      return trimmedAnswer.length >= 1;
    }

    return true;
  };

  const handleNext = () => {
    const currentQuestion = questions[currentQuestionIndex];
    const currentAnswer = answers[currentQuestion._id];

    if (!validateAnswer(currentQuestion, currentAnswer)) {
      let errorMessage = 'Please provide a valid answer before continuing.';

      if (currentQuestion.inputType === 'text') {
        if (currentQuestion.questionText.toLowerCase().includes('age')) {
          errorMessage = 'Please enter a valid age (13-120 years).';
        } else if (currentQuestion.questionText.toLowerCase().includes('weight')) {
          errorMessage = 'Please enter a valid weight.';
        }
      }

      Alert.alert('Invalid Input', errorMessage);
      return;
    }

    // Animate out current question
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
      } else {
        submitAssessment();
      }
    });
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setCurrentQuestionIndex((prev) => prev - 1);
      });
    }
  };

  const submitAssessment = async () => {
    setSubmitting(true);
    try {
      // const token = await AsyncStorage.getItem('token');
      // if (!token) {
      //   navigation.navigate('SignIn');
      //   return;
      // }

      // Format data to match backend expectations
      const assessmentData = {
        responses: Object.entries(answers).map(([questionId, answer]) => ({
          questionId,
          answer: answer.toString().trim(),
        })),
      };

      // Mock submission
      setTimeout(() => {
        Alert.alert(
          'Success',
          'Assessment completed successfully! (Mock)',
          [
            {
              text: 'Continue',
              onPress: () => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Home' }],
                });
              }
            }
          ]
        );
      }, 1000);

      // const response = await axios.post(
      //   'https://mind-pal-jgpr.onrender.com/api/assessment/submit',
      //   assessmentData,
      //   {
      //     headers: {
      //       Authorization: `Bearer ${token}`,
      //       'Content-Type': 'application/json',
      //     },
      //   }
      // );

      // if (response.data.status === 'success') {
      //   Alert.alert(
      //     'Success',
      //     'Assessment completed successfully!',
      //     [
      //       {
      //         text: 'Continue',
      //         onPress: () => {
      //           navigation.reset({
      //             index: 0,
      //             routes: [{ name: 'Home' }],
      //           });
      //         }
      //       }
      //     ]
      //   );
      // }
    } catch (error) {
      console.error('Error submitting assessment:', error);
      Alert.alert('Error', 'Failed to submit assessment (Mock)');
    } finally {
      // setSubmitting(false); // Done inside timeout in real app usually, but here fine
    }
  };

  const renderScaleOptions = (question) => {
    return (
      <View style={styles.scaleContainer}>
        <View style={styles.scaleLabels}>
          <Text style={styles.scaleLabel}>Low</Text>
          <Text style={styles.scaleLabel}>High</Text>
        </View>
        <View style={styles.scaleOptions}>
          {question.options.map((option) => (
            <TouchableOpacity
              key={option._id}
              style={[
                styles.scaleOption,
                answers[question._id] === option.value && styles.selectedScaleOption,
              ]}
              onPress={() => handleAnswer(question._id, option.value)}
            >
              <Text
                style={[
                  styles.scaleOptionText,
                  answers[question._id] === option.value && styles.selectedScaleOptionText,
                ]}
              >
                {option.value}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderQuestion = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primaryGreen} />
          <Text style={styles.loadingText}>Loading assessment...</Text>
        </View>
      );
    }

    if (error || !questions.length) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {error || 'No questions available.'}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setError(null);
              setLoading(true);
              fetchQuestions();
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const question = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    const currentAnswer = answers[question._id];

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.questionContainer, { opacity: fadeAnim }]}>
            {/* Progress Section */}
            <View style={styles.progressSection}>
              <View style={styles.progressBarContainer}>
                <Animated.View
                  style={[
                    styles.progressBar,
                    {
                      width: `${progress}%`,
                    }
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {`Question ${currentQuestionIndex + 1} of ${questions.length}`}
              </Text>
            </View>

            {/* Question Section */}
            <View style={styles.questionSection}>
              <Text style={styles.questionTitle}>Health Assessment</Text>
              <Text style={styles.questionText}>{question.questionText}</Text>

              {question.category && (
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>
                    {question.category.replace('-', ' ').toUpperCase()}
                  </Text>
                </View>
              )}
            </View>

            {/* Answer Section */}
            <View style={styles.answerSection}>
              {question.inputType === 'select' && (
                <View style={styles.optionsContainer}>
                  {question.options.map((option) => (
                    <TouchableOpacity
                      key={option._id}
                      style={[
                        styles.optionButton,
                        currentAnswer === option.value && styles.selectedOption,
                      ]}
                      onPress={() => handleAnswer(question._id, option.value)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          currentAnswer === option.value && styles.selectedOptionText,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {question.inputType === 'scale' && renderScaleOptions(question)}

              {question.inputType === 'text' && (
                <View style={styles.textInputContainer}>
                  <TextInput
                    style={styles.textInput}
                    placeholder={
                      question.questionText.toLowerCase().includes('age')
                        ? "Enter your age"
                        : question.questionText.toLowerCase().includes('weight')
                          ? "Enter your weight"
                          : "Type your answer here..."
                    }
                    placeholderTextColor={colors.placeholderText}
                    value={currentAnswer || ''}
                    onChangeText={(text) => handleAnswer(question._id, text)}
                    keyboardType={
                      question.questionText.toLowerCase().includes('age') ||
                        question.questionText.toLowerCase().includes('weight')
                        ? 'numeric'
                        : 'default'
                    }
                    autoCapitalize="sentences"
                    autoCorrect={!question.questionText.toLowerCase().includes('age') &&
                      !question.questionText.toLowerCase().includes('weight')}
                  />
                </View>
              )}
            </View>
          </Animated.View>
        </ScrollView>

        {/* Navigation Buttons */}
        <View style={styles.navigationContainer}>
          <TouchableOpacity
            style={[
              styles.navButton,
              styles.backButton,
              currentQuestionIndex === 0 && styles.disabledButton
            ]}
            onPress={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            <Text style={[
              styles.navButtonText,
              currentQuestionIndex === 0 && styles.disabledButtonText
            ]}>
              ← Back
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.navButton,
              styles.nextButton,
              !validateAnswer(question, currentAnswer) && styles.disabledButton
            ]}
            onPress={handleNext}
            disabled={!validateAnswer(question, currentAnswer) || submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color={colors.textLight} />
            ) : (
              <Text style={styles.nextButtonText}>
                {currentQuestionIndex < questions.length - 1 ? 'Next →' : 'Submit'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.lightBeige} />
      {renderQuestion()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.lightBeige,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: colors.darkBrown,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 18,
    color: colors.errorRed,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: colors.primaryGreen,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.textLight,
    fontSize: 16,
    fontWeight: '600',
  },
  questionContainer: {
    flex: 1,
    minHeight: height * 0.7,
  },
  progressSection: {
    marginBottom: 30,
  },
  progressBarContainer: {
    height: 8,
    width: '100%',
    backgroundColor: colors.lightGray,
    borderRadius: 4,
    marginBottom: 10,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primaryGreen,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: colors.darkBrown,
    fontWeight: '500',
  },
  questionSection: {
    marginBottom: 30,
  },
  questionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.darkBrown,
    marginBottom: 10,
  },
  questionText: {
    fontSize: 20,
    color: colors.textDark,
    lineHeight: 28,
    marginBottom: 15,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryGreen,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: '600',
  },
  answerSection: {
    flex: 1,
    marginBottom: 20,
  },
  optionsContainer: {
    width: '100%',
  },
  optionButton: {
    backgroundColor: colors.textLight,
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: colors.lightGray,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedOption: {
    backgroundColor: colors.primaryGreen,
    borderColor: colors.primaryGreen,
  },
  optionText: {
    fontSize: 16,
    color: colors.textDark,
    textAlign: 'center',
    fontWeight: '500',
  },
  selectedOptionText: {
    color: colors.textLight,
    fontWeight: '600',
  },
  scaleContainer: {
    width: '100%',
  },
  scaleLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  scaleLabel: {
    fontSize: 14,
    color: colors.darkBrown,
    fontWeight: '500',
  },
  scaleOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  scaleOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.textLight,
    borderWidth: 2,
    borderColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedScaleOption: {
    backgroundColor: colors.primaryGreen,
    borderColor: colors.primaryGreen,
  },
  scaleOptionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textDark,
  },
  selectedScaleOptionText: {
    color: colors.textLight,
  },
  textInputContainer: {
    width: '100%',
  },
  textInput: {
    backgroundColor: colors.textLight,
    padding: 18,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.lightGray,
    fontSize: 16,
    color: colors.textDark,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: colors.lightBeige,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  navButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    minWidth: 100,
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: colors.lightGray,
  },
  nextButton: {
    backgroundColor: colors.darkBrown,
  },
  disabledButton: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textDark,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textLight,
  },
  disabledButtonText: {
    color: colors.placeholderText,
  },
});


export default AssessmentScreen

// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   SafeAreaView,
//   StatusBar,
//   Dimensions,
//   ActivityIndicator,
//   Alert,
//   TextInput,
//   KeyboardAvoidingView,
//   Platform,
//   Animated,
// } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import axios from 'axios';

// const { width, height } = Dimensions.get('window');

// const colors = {
//   primaryGreen: '#8EBA6B',
//   darkBrown: '#6D482F',
//   lightBeige: '#F3EDE4',
//   textDark: '#333333',
//   textLight: '#FFFFFF',
//   borderColor: '#8DC63F',
//   placeholderText: '#A0A0A0',
//   errorRed: '#FF0000',
//   lightGray: '#E0E0E0',
//   successGreen: '#4CAF50',
// };

// const AssessmentScreen = ({ navigation }) => {
//   const [questions, setQuestions] = useState([]);
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [answers, setAnswers] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);
//   const [error, setError] = useState(null);
//   const [fadeAnim] = useState(new Animated.Value(0));

//   useEffect(() => {
//     fetchQuestions();
//   }, []);

//   useEffect(() => {
//     // Animate question appearance
//     Animated.timing(fadeAnim, {
//       toValue: 1,
//       duration: 300,
//       useNativeDriver: true,
//     }).start();
//   }, [currentQuestionIndex]);

//   const fetchQuestions = async () => {
//     try {
//       const token = await AsyncStorage.getItem('token');
//       if (!token) {
//         navigation.navigate('SignIn');
//         return;
//       }

//       const response = await axios.get(
//           'https://mind-pal-jgpr.onrender.com/api/assessment/questions',
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//               'Content-Type': 'application/json',
//             },
//           }
//       );

//       if (response.data.status === 'success') {
//         setQuestions(response.data.data.questions);
//       } else {
//         throw new Error('Failed to fetch questions');
//       }
//     } catch (error) {
//       console.error('Error fetching questions:', error);
//       const errorMessage = error.response?.data?.message || 'Failed to load assessment questions';
//       setError(errorMessage);
//       Alert.alert('Error', errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAnswer = (questionId, value) => {
//     setAnswers((prev) => ({
//       ...prev,
//       [questionId]: value,
//     }));
//   };

//   const validateAnswer = (question, answer) => {
//     if (!answer || answer.toString().trim() === '') {
//       return false;
//     }

//     // Additional validation for text inputs
//     if (question.inputType === 'text') {
//       const trimmedAnswer = answer.toString().trim();
//       if (question.questionText.toLowerCase().includes('age')) {
//         const age = parseInt(trimmedAnswer);
//         return age >= 13 && age <= 120; // Reasonable age range
//       }
//       if (question.questionText.toLowerCase().includes('weight')) {
//         const weight = parseFloat(trimmedAnswer);
//         return weight > 0 && weight <= 1000; // Reasonable weight range
//       }
//       return trimmedAnswer.length >= 1;
//     }

//     return true;
//   };

//   const handleNext = () => {
//     const currentQuestion = questions[currentQuestionIndex];
//     const currentAnswer = answers[currentQuestion._id];

//     if (!validateAnswer(currentQuestion, currentAnswer)) {
//       let errorMessage = 'Please provide a valid answer before continuing.';

//       if (currentQuestion.inputType === 'text') {
//         if (currentQuestion.questionText.toLowerCase().includes('age')) {
//           errorMessage = 'Please enter a valid age (13-120 years).';
//         } else if (currentQuestion.questionText.toLowerCase().includes('weight')) {
//           errorMessage = 'Please enter a valid weight.';
//         }
//       }

//       Alert.alert('Invalid Input', errorMessage);
//       return;
//     }

//     // Animate out current question
//     Animated.timing(fadeAnim, {
//       toValue: 0,
//       duration: 200,
//       useNativeDriver: true,
//     }).start(() => {
//       if (currentQuestionIndex < questions.length - 1) {
//         setCurrentQuestionIndex((prev) => prev + 1);
//       } else {
//         submitAssessment();
//       }
//     });
//   };

//   const handlePrevious = () => {
//     if (currentQuestionIndex > 0) {
//       Animated.timing(fadeAnim, {
//         toValue: 0,
//         duration: 200,
//         useNativeDriver: true,
//       }).start(() => {
//         setCurrentQuestionIndex((prev) => prev - 1);
//       });
//     }
//   };

//   const submitAssessment = async () => {
//     setSubmitting(true);
//     try {
//       const token = await AsyncStorage.getItem('token');
//       if (!token) {
//         navigation.navigate('SignIn');
//         return;
//       }

//       const assessmentData = {
//         answers: Object.entries(answers).map(([questionId, answer]) => ({
//           questionId,
//           answer: answer.toString().trim(),
//         })),
//       };

//       const response = await axios.post(
//           'https://mind-pal-jgpr.onrender.com/api/assessment/submit',
//           assessmentData,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//               'Content-Type': 'application/json',
//             },
//           }
//       );

//       if (response.data.status === 'success') {
//         Alert.alert(
//             'Success',
//             'Assessment completed successfully!',
//             [
//               {
//                 text: 'Continue',
//                 onPress: () => {
//                   navigation.reset({
//                     index: 0,
//                     routes: [{ name: 'Home' }],
//                   });
//                 }
//               }
//             ]
//         );
//       }
//     } catch (error) {
//       console.error('Error submitting assessment:', error);
//       Alert.alert('Error', error.response?.data?.message || 'Failed to submit assessment');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const renderScaleOptions = (question) => {
//     return (
//         <View style={styles.scaleContainer}>
//           <View style={styles.scaleLabels}>
//             <Text style={styles.scaleLabel}>Low</Text>
//             <Text style={styles.scaleLabel}>High</Text>
//           </View>
//           <View style={styles.scaleOptions}>
//             {question.options.map((option) => (
//                 <TouchableOpacity
//                     key={option._id}
//                     style={[
//                       styles.scaleOption,
//                       answers[question._id] === option.value && styles.selectedScaleOption,
//                     ]}
//                     onPress={() => handleAnswer(question._id, option.value)}
//                 >
//                   <Text
//                       style={[
//                         styles.scaleOptionText,
//                         answers[question._id] === option.value && styles.selectedScaleOptionText,
//                       ]}
//                   >
//                     {option.value}
//                   </Text>
//                 </TouchableOpacity>
//             ))}
//           </View>
//         </View>
//     );
//   };

//   const renderQuestion = () => {
//     if (loading) {
//       return (
//           <View style={styles.loadingContainer}>
//             <ActivityIndicator size="large" color={colors.primaryGreen} />
//             <Text style={styles.loadingText}>Loading assessment...</Text>
//           </View>
//       );
//     }

//     if (error || !questions.length) {
//       return (
//           <View style={styles.errorContainer}>
//             <Text style={styles.errorText}>
//               {error || 'No questions available.'}
//             </Text>
//             <TouchableOpacity
//                 style={styles.retryButton}
//                 onPress={() => {
//                   setError(null);
//                   setLoading(true);
//                   fetchQuestions();
//                 }}
//             >
//               <Text style={styles.retryButtonText}>Retry</Text>
//             </TouchableOpacity>
//           </View>
//       );
//     }

//     const question = questions[currentQuestionIndex];
//     const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
//     const currentAnswer = answers[question._id];

//     return (
//         <KeyboardAvoidingView
//             behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//             style={styles.keyboardContainer}
//         >
//           <ScrollView
//               contentContainerStyle={styles.scrollContent}
//               showsVerticalScrollIndicator={false}
//           >
//             <Animated.View style={[styles.questionContainer, { opacity: fadeAnim }]}>
//               {/* Progress Section */}
//               <View style={styles.progressSection}>
//                 <View style={styles.progressBarContainer}>
//                   <Animated.View
//                       style={[
//                         styles.progressBar,
//                         {
//                           width: `${progress}%`,
//                         }
//                       ]}
//                   />
//                 </View>
//                 <Text style={styles.progressText}>
//                   {`Question ${currentQuestionIndex + 1} of ${questions.length}`}
//                 </Text>
//               </View>

//               {/* Question Section */}
//               <View style={styles.questionSection}>
//                 <Text style={styles.questionTitle}>Health Assessment</Text>
//                 <Text style={styles.questionText}>{question.questionText}</Text>

//                 {question.category && (
//                     <View style={styles.categoryBadge}>
//                       <Text style={styles.categoryText}>
//                         {question.category.replace('-', ' ').toUpperCase()}
//                       </Text>
//                     </View>
//                 )}
//               </View>

//               {/* Answer Section */}
//               <View style={styles.answerSection}>
//                 {question.inputType === 'select' && (
//                     <View style={styles.optionsContainer}>
//                       {question.options.map((option) => (
//                           <TouchableOpacity
//                               key={option._id}
//                               style={[
//                                 styles.optionButton,
//                                 currentAnswer === option.value && styles.selectedOption,
//                               ]}
//                               onPress={() => handleAnswer(question._id, option.value)}
//                               activeOpacity={0.7}
//                           >
//                             <Text
//                                 style={[
//                                   styles.optionText,
//                                   currentAnswer === option.value && styles.selectedOptionText,
//                                 ]}
//                             >
//                               {option.label}
//                             </Text>
//                           </TouchableOpacity>
//                       ))}
//                     </View>
//                 )}

//                 {question.inputType === 'scale' && renderScaleOptions(question)}

//                 {question.inputType === 'text' && (
//                     <View style={styles.textInputContainer}>
//                       <TextInput
//                           style={styles.textInput}
//                           placeholder={
//                             question.questionText.toLowerCase().includes('age')
//                                 ? "Enter your age"
//                                 : question.questionText.toLowerCase().includes('weight')
//                                     ? "Enter your weight"
//                                     : "Type your answer here..."
//                           }
//                           placeholderTextColor={colors.placeholderText}
//                           value={currentAnswer || ''}
//                           onChangeText={(text) => handleAnswer(question._id, text)}
//                           keyboardType={
//                             question.questionText.toLowerCase().includes('age') ||
//                             question.questionText.toLowerCase().includes('weight')
//                                 ? 'numeric'
//                                 : 'default'
//                           }
//                           autoCapitalize="sentences"
//                           autoCorrect={!question.questionText.toLowerCase().includes('age') &&
//                               !question.questionText.toLowerCase().includes('weight')}
//                       />
//                     </View>
//                 )}
//               </View>
//             </Animated.View>
//           </ScrollView>

//           {/* Navigation Buttons */}
//           <View style={styles.navigationContainer}>
//             <TouchableOpacity
//                 style={[
//                   styles.navButton,
//                   styles.backButton,
//                   currentQuestionIndex === 0 && styles.disabledButton
//                 ]}
//                 onPress={handlePrevious}
//                 disabled={currentQuestionIndex === 0}
//             >
//               <Text style={[
//                 styles.navButtonText,
//                 currentQuestionIndex === 0 && styles.disabledButtonText
//               ]}>
//                 ← Back
//               </Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//                 style={[
//                   styles.navButton,
//                   styles.nextButton,
//                   !validateAnswer(question, currentAnswer) && styles.disabledButton
//                 ]}
//                 onPress={handleNext}
//                 disabled={!validateAnswer(question, currentAnswer) || submitting}
//             >
//               {submitting ? (
//                   <ActivityIndicator size="small" color={colors.textLight} />
//               ) : (
//                   <Text style={styles.nextButtonText}>
//                     {currentQuestionIndex < questions.length - 1 ? 'Next →' : 'Submit'}
//                   </Text>
//               )}
//             </TouchableOpacity>
//           </View>
//         </KeyboardAvoidingView>
//     );
//   };

//   return (
//       <SafeAreaView style={styles.safeArea}>
//         <StatusBar barStyle="dark-content" backgroundColor={colors.lightBeige} />
//         {renderQuestion()}
//       </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: colors.lightBeige,
//   },
//   keyboardContainer: {
//     flex: 1,
//   },
//   scrollContent: {
//     flexGrow: 1,
//     paddingHorizontal: 20,
//     paddingTop: 20,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   loadingText: {
//     marginTop: 15,
//     fontSize: 16,
//     color: colors.darkBrown,
//   },
//   errorContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//   },
//   errorText: {
//     fontSize: 18,
//     color: colors.errorRed,
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   retryButton: {
//     backgroundColor: colors.primaryGreen,
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//     borderRadius: 8,
//   },
//   retryButtonText: {
//     color: colors.textLight,
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   questionContainer: {
//     flex: 1,
//     minHeight: height * 0.7,
//   },
//   progressSection: {
//     marginBottom: 30,
//   },
//   progressBarContainer: {
//     height: 8,
//     width: '100%',
//     backgroundColor: colors.lightGray,
//     borderRadius: 4,
//     marginBottom: 10,
//     overflow: 'hidden',
//   },
//   progressBar: {
//     height: '100%',
//     backgroundColor: colors.primaryGreen,
//     borderRadius: 4,
//   },
//   progressText: {
//     fontSize: 14,
//     color: colors.darkBrown,
//     fontWeight: '500',
//   },
//   questionSection: {
//     marginBottom: 30,
//   },
//   questionTitle: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     color: colors.darkBrown,
//     marginBottom: 10,
//   },
//   questionText: {
//     fontSize: 20,
//     color: colors.textDark,
//     lineHeight: 28,
//     marginBottom: 15,
//   },
//   categoryBadge: {
//     alignSelf: 'flex-start',
//     backgroundColor: colors.primaryGreen,
//     paddingHorizontal: 12,
//     paddingVertical: 4,
//     borderRadius: 12,
//   },
//   categoryText: {
//     fontSize: 12,
//     color: colors.textLight,
//     fontWeight: '600',
//   },
//   answerSection: {
//     flex: 1,
//     marginBottom: 20,
//   },
//   optionsContainer: {
//     width: '100%',
//   },
//   optionButton: {
//     backgroundColor: colors.textLight,
//     padding: 18,
//     borderRadius: 12,
//     marginBottom: 12,
//     borderWidth: 2,
//     borderColor: colors.lightGray,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 1,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 2,
//   },
//   selectedOption: {
//     backgroundColor: colors.primaryGreen,
//     borderColor: colors.primaryGreen,
//   },
//   optionText: {
//     fontSize: 16,
//     color: colors.textDark,
//     textAlign: 'center',
//     fontWeight: '500',
//   },
//   selectedOptionText: {
//     color: colors.textLight,
//     fontWeight: '600',
//   },
//   scaleContainer: {
//     width: '100%',
//   },
//   scaleLabels: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 15,
//     paddingHorizontal: 10,
//   },
//   scaleLabel: {
//     fontSize: 14,
//     color: colors.darkBrown,
//     fontWeight: '500',
//   },
//   scaleOptions: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     paddingHorizontal: 10,
//   },
//   scaleOption: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     backgroundColor: colors.textLight,
//     borderWidth: 2,
//     borderColor: colors.lightGray,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   selectedScaleOption: {
//     backgroundColor: colors.primaryGreen,
//     borderColor: colors.primaryGreen,
//   },
//   scaleOptionText: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: colors.textDark,
//   },
//   selectedScaleOptionText: {
//     color: colors.textLight,
//   },
//   textInputContainer: {
//     width: '100%',
//   },
//   textInput: {
//     backgroundColor: colors.textLight,
//     padding: 18,
//     borderRadius: 12,
//     borderWidth: 2,
//     borderColor: colors.lightGray,
//     fontSize: 16,
//     color: colors.textDark,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 1,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 2,
//   },
//   navigationContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     paddingHorizontal: 20,
//     paddingVertical: 20,
//     backgroundColor: colors.lightBeige,
//     borderTopWidth: 1,
//     borderTopColor: colors.lightGray,
//   },
//   navButton: {
//     paddingHorizontal: 24,
//     paddingVertical: 12,
//     borderRadius: 10,
//     minWidth: 100,
//     alignItems: 'center',
//   },
//   backButton: {
//     backgroundColor: colors.lightGray,
//   },
//   nextButton: {
//     backgroundColor: colors.darkBrown,
//   },
//   disabledButton: {
//     opacity: 0.5,
//   },
//   navButtonText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: colors.textDark,
//   },
//   nextButtonText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: colors.textLight,
//   },
//   disabledButtonText: {
//     color: colors.placeholderText,
//   },
// });


// export default AssessmentScreen