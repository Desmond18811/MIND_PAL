import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
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
import api from '../services/api';


import { AssessmentQuestion } from '../types/types';

const { height } = Dimensions.get('window');

const AssessmentScreen = ({ navigation }: { navigation: any }) => {
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
      const response = await api.assessment.getQuestions();

      if (response && response.data && response.data.length > 0) {
        setQuestions(response.data);
      } else {
        throw new Error('No questions found');
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      setError('Failed to load assessment questions.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionId: string, value: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const validateAnswer = (question: AssessmentQuestion, answer: any) => {
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
      // Format submission data
      const submissionData = {
        assessmentType: 'initial', // Added required field
        responses: Object.entries(answers).map(([questionId, answer]) => ({
          questionId,
          answer: String(answer), // Ensure string format
        })),
        completedAt: new Date().toISOString()
      };

      const result = await api.assessment.submit(submissionData);

      if (result) {
        Alert.alert(
          'Assessment Complete',
          'Thank you for completing the assessment! Your personalized profile is ready.',
          [
            {
              text: 'Go to Dashboard',
              onPress: () => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Home' }],
                });
              }
            }
          ]
        );
      }
    } catch (error: any) {
      console.error('Error submitting assessment:', error);
      Alert.alert('Submission Failed', error.message || 'Failed to submit assessment.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderScaleOptions = (question: AssessmentQuestion) => {
    return (
      <View className="w-full">
        <View className="flex-row justify-between mb-4 px-2">
          <Text className="text-sm text-dark-brown font-medium">Low</Text>
          <Text className="text-sm text-dark-brown font-medium">High</Text>
        </View>
        <View className="flex-row justify-between px-2">
          {question.options?.map((option) => (
            <TouchableOpacity
              key={option._id}
              className={`w-12 h-12 rounded-full border-2 justify-center items-center ${answers[question._id] === option.value
                ? 'bg-primary-green border-primary-green'
                : 'bg-white border-light-gray'
                }`}
              onPress={() => handleAnswer(question._id, option.value)}
            >
              <Text
                className={`text-lg font-bold ${answers[question._id] === option.value
                  ? 'text-white'
                  : 'text-text-dark'
                  }`}
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
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#8EBA6B" />
          <Text className="mt-4 text-base text-dark-brown">Loading assessment...</Text>
        </View>
      );
    }

    if (error || !questions.length) {
      return (
        <View className="flex-1 justify-center items-center px-5">
          <Text className="text-lg text-[#FF0000] text-center mb-5">
            {error || 'No questions available.'}
          </Text>
          <TouchableOpacity
            className="bg-primary-green px-5 py-2.5 rounded-lg"
            onPress={() => {
              setError(null);
              setLoading(true);
              fetchQuestions();
            }}
          >
            <Text className="text-white text-base font-semibold">Retry</Text>
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
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingTop: 20 }}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ flex: 1, minHeight: height * 0.7, opacity: fadeAnim }}>
            {/* Progress Section */}
            <View className="mb-8">
              <View className="h-2 w-full bg-light-gray rounded overflow-hidden mb-2">
                <Animated.View
                  className="h-full bg-primary-green rounded"
                  style={{ width: `${progress}%` }}
                />
              </View>
              <Text className="text-sm text-dark-brown font-medium">
                {`Question ${currentQuestionIndex + 1} of ${questions.length}`}
              </Text>
            </View>

            {/* Question Section */}
            <View className="mb-8">
              <Text className="text-3xl font-bold text-dark-brown mb-2">Health Assessment</Text>
              <Text className="text-xl text-text-dark leading-7 mb-4">{question.questionText}</Text>

              {question.category && (
                <View className="self-start bg-primary-green px-3 py-1 rounded-xl">
                  <Text className="text-xs text-white font-semibold">
                    {question.category.replace('-', ' ').toUpperCase()}
                  </Text>
                </View>
              )}
            </View>

            {/* Answer Section */}
            <View className="flex-1 mb-5">
              {question.inputType === 'select' && (
                <View className="w-full">
                  {question.options?.map((option) => (
                    <TouchableOpacity
                      key={option._id}
                      className={`bg-white p-5 rounded-xl mb-3 border-2 shadow-sm ${currentAnswer === option.value
                        ? 'bg-primary-green border-primary-green'
                        : 'border-light-gray'
                        }`}
                      onPress={() => handleAnswer(question._id, option.value)}
                      activeOpacity={0.7}
                    >
                      <Text
                        className={`text-base text-center font-medium ${currentAnswer === option.value
                          ? 'text-white font-semibold'
                          : 'text-text-dark'
                          }`}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {question.inputType === 'scale' && renderScaleOptions(question)}

              {question.inputType === 'text' && (
                <View className="w-full">
                  <TextInput
                    className="bg-white p-5 rounded-xl border-2 border-light-gray text-base text-text-dark shadow-sm"
                    placeholder={
                      question.questionText.toLowerCase().includes('age')
                        ? "Enter your age"
                        : question.questionText.toLowerCase().includes('weight')
                          ? "Enter your weight"
                          : "Type your answer here..."
                    }
                    placeholderTextColor="#A0A0A0"
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
        <View className="flex-row justify-between px-5 py-5 bg-light-beige border-t border-light-gray">
          <TouchableOpacity
            className={`px-6 py-3 rounded-xl min-w-[100px] items-center bg-light-gray ${currentQuestionIndex === 0 ? 'opacity-50' : ''
              }`}
            onPress={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            <Text className={`text-base font-semibold ${currentQuestionIndex === 0 ? 'text-placeholder' : 'text-text-dark'
              }`}>
              ← Back
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`px-6 py-3 rounded-xl min-w-[100px] items-center bg-dark-brown ${!validateAnswer(question, currentAnswer) ? 'opacity-50' : ''
              }`}
            onPress={handleNext}
            disabled={!validateAnswer(question, currentAnswer) || submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text className="text-base font-semibold text-white">
                {currentQuestionIndex < questions.length - 1 ? 'Next →' : 'Submit'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F3EDE4' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3EDE4" />
      {renderQuestion()}
    </SafeAreaView>
  );
};

export default AssessmentScreen;