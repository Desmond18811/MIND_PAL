import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions, StatusBar, FlatList, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
// @ts-ignore
import MaleSvg from '../assets/male.svg';
// @ts-ignore
import FemaleSvg from '../assets/female.svg';
import "../global.css";

const { width, height } = Dimensions.get('window');

type QuestionType = 'list' | 'cards' | 'wheel' | 'ruler';

interface Option {
  id: string;
  label: string;
  svg?: React.FC<any>;
}

interface Question {
  id: number;
  type: QuestionType;
  title: string;
  options?: Option[];
  min?: number;
  max?: number;
  unit?: string;
}

const questions: Question[] = [
  {
    id: 1,
    type: 'list',
    title: "What's your health goal for today?",
    options: [
      { id: 'stress', label: 'I wanna reduce stress' },
      { id: 'ai_therapy', label: 'I wanna try AI Therapy' },
      { id: 'trauma', label: 'I want to cope with trauma' },
      { id: 'better_person', label: 'I want to be a better person' },
      { id: 'try_app', label: 'Just trying out the app, mate!' },
    ],
  },
  {
    id: 2,
    type: 'cards',
    title: "What's your official gender?",
    options: [
      { id: 'male', label: 'I am Male', svg: MaleSvg },
      { id: 'female', label: 'I am Female', svg: FemaleSvg },
    ],
  },
  {
    id: 3,
    type: 'wheel',
    title: "What's your age?",
    min: 16,
    max: 100,
  },
  {
    id: 4,
    type: 'ruler',
    title: "What's your weight?",
    min: 40,
    max: 200,
    unit: 'kg',
  },
  // Placeholders for 5-14
  ...Array.from({ length: 10 }, (_, i) => ({
    id: i + 5,
    type: 'list' as QuestionType,
    title: `Question ${i + 5}`,
    options: [
      { id: 'opt1', label: 'Option 1' },
      { id: 'opt2', label: 'Option 2' },
      { id: 'opt3', label: 'Option 3' },
    ],
  })),
];

const ITEM_HEIGHT = 60;
const RULER_ITEM_WIDTH = 50;

const AssessmentScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});

  const [currentAge, setCurrentAge] = useState(18);
  const [currentWeight, setCurrentWeight] = useState(60);
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');

  const wheelScrollRef = useRef<FlatList>(null);
  const rulerScrollRef = useRef<ScrollView>(null);

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  useEffect(() => {
    if (currentQuestion.type === 'wheel') {
      const saved = answers[currentQuestion.id];
      if (saved) {
        setCurrentAge(parseInt(saved));
      } else {
        setAnswers(prev => ({ ...prev, [currentQuestion.id]: '18' }));
        setCurrentAge(18);
      }
    }
    if (currentQuestion.type === 'ruler') {
      const saved = answers[currentQuestion.id];
      if (!saved) {
        setAnswers(prev => ({ ...prev, [currentQuestion.id]: '60 kg' }));
        setCurrentWeight(60);
      } else {
        // Parse saved weight
        const match = saved.match(/(\d+)/);
        if (match) setCurrentWeight(parseInt(match[1]));
      }
    }
  }, [currentStep, currentQuestion]);

  const handleSelect = (optionId: string) => {
    setAnswers({ ...answers, [currentQuestion.id]: optionId });
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      navigation.goBack();
    }
  };

  // --- Age Wheel Picker ---
  const renderAgeWheel = () => {
    const min = currentQuestion.min || 16;
    const max = currentQuestion.max || 100;
    const range = Array.from({ length: max - min + 1 }, (_, i) => min + i);
    const data = ['', '', ...range, '', ''];

    const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = event.nativeEvent.contentOffset.y;
      const index = Math.round(y / ITEM_HEIGHT);
      const value = range[index];
      if (value) {
        setCurrentAge(value);
        setAnswers(prev => ({ ...prev, [currentQuestion.id]: value.toString() }));
      }
    };

    return (
      <View className="flex-1 items-center justify-center py-10">
        <View className="h-[300px] w-full items-center justify-center relative">
          {/* Selection Green Pill Background - Outline Only */}
          <View
            className="absolute border-[2px] border-[#9BB168] rounded-full z-0 pointer-events-none bg-transparent"
            style={{
              width: 120, // Reduced width for distinct button shape
              height: ITEM_HEIGHT + 10,
              top: '50%',
              marginTop: -(ITEM_HEIGHT + 10) / 2
            }}
          />

          <FlatList
            ref={wheelScrollRef}
            data={data}
            extraData={currentAge} // CRITICAL: Ensures re-render on selection change
            keyExtractor={(item, index) => index.toString()}
            showsVerticalScrollIndicator={false}
            snapToInterval={ITEM_HEIGHT}
            decelerationRate="fast"
            onMomentumScrollEnd={onScroll}
            onScrollEndDrag={onScroll}
            scrollEventThrottle={16}
            getItemLayout={(data, index) => (
              { length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index }
            )}
            initialScrollIndex={0}
            renderItem={({ item, index }) => {
              if (item === '') return <View style={{ height: ITEM_HEIGHT }} />;
              const isSelected = item === currentAge;
              return (
                <View style={{ height: ITEM_HEIGHT, justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                  <Text className={`text-4xl font-[Urbanist-Bold] ${isSelected ? 'text-[#9BB168]' : 'text-[#E0E0E0]'}`}>
                    {item}
                  </Text>
                </View>
              );
            }}
          />
        </View>
      </View>
    );
  };

  // --- Horizontal Ruler (Weight) ---
  const renderWeightRuler = () => {
    const min = 40;
    const max = 200;
    const pixelPerKg = RULER_ITEM_WIDTH;

    const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const x = event.nativeEvent.contentOffset.x;
      const val = Math.round(x / pixelPerKg) + min;
      if (val >= min && val <= max && val !== currentWeight) {
        setCurrentWeight(val);
        setAnswers(prev => ({ ...prev, [currentQuestion.id]: `${val} ${weightUnit}` }));
      }
    };

    return (
      <View className="flex-1 items-center justify-center w-full">
        {/* Unit Toggle */}
        <View className="flex-row bg-white rounded-full p-1 mb-10 w-[200px] shadow-sm border border-gray-100">
          <TouchableOpacity
            className={`flex-1 py-3 rounded-full items-center ${weightUnit === 'kg' ? 'bg-[#E67E22]' : 'bg-transparent'}`}
            onPress={() => setWeightUnit('kg')}
          >
            <Text className={`font-[Urbanist-Bold] ${weightUnit === 'kg' ? 'text-white' : 'text-[#4A3B32]'}`}>kg</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-3 rounded-full items-center ${weightUnit === 'lbs' ? 'bg-[#E67E22]' : 'bg-transparent'}`}
            onPress={() => setWeightUnit('lbs')}
          >
            <Text className={`font-[Urbanist-Bold] ${weightUnit === 'lbs' ? 'text-white' : 'text-[#4A3B32]'}`}>lbs</Text>
          </TouchableOpacity>
        </View>

        {/* Large Value Display */}
        <View className="flex-row items-end mb-10">
          <Text className="text-[80px] font-[Urbanist-Bold] text-[#4A3B32] leading-none">
            {weightUnit === 'lbs' ? Math.round(currentWeight * 2.20462) : currentWeight}
          </Text>
          <Text className="text-3xl font-[Urbanist-Medium] text-gray-400 mb-4 ml-2">
            {weightUnit}
          </Text>
        </View>

        {/* Central Indicator Line - Longer green line */}
        <View
          className="h-[140px] w-[6px] bg-[#9BB168] rounded-full absolute z-10 pointer-events-none"
          style={{
            top: '50%',
            marginTop: -10 // Adjust to vertically align with ruler ticks
          }}
        />

        {/* Scrollable Ruler */}
        <ScrollView
          ref={rulerScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={pixelPerKg}
          decelerationRate="fast"
          onScroll={onScroll}
          scrollEventThrottle={16}
          contentContainerStyle={{ paddingHorizontal: width / 2 }}
        >
          {Array.from({ length: max - min + 1 }).map((_, i) => {
            const val = min + i;
            // Also color the tick itself if selected
            const isSelected = val === currentWeight;
            return (
              <View key={i} style={{ width: pixelPerKg, alignItems: 'center', justifyContent: 'flex-start', height: 120 }}>
                {/* Dynamic styling for the tick itself based on selection */}
                <View
                  className={`w-[3px] rounded-full ${isSelected ? 'bg-[#9BB168] h-[100px] w-[4px]' : 'bg-[#D0C0B0] h-[60px]'}`}
                />
                <Text className={`font-[Urbanist-Medium] mt-4 text-xs ${isSelected ? 'text-[#9BB168] font-bold' : 'text-[#B0A090]'}`}>
                  {val}
                </Text>
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  // --- List Type Question ---
  const renderListQuestion = () => (
    <View className="gap-4">
      {currentQuestion.options?.map((option) => {
        const isSelected = answers[currentQuestion.id] === option.id;
        return (
          <TouchableOpacity
            key={option.id}
            onPress={() => handleSelect(option.id)}
            className={`flex-row items-center p-5 rounded-[20px] shadow-sm ${isSelected ? 'bg-[#9BB168]' : 'bg-white'}`}
          >
            <Text className={`flex-1 text-lg font-[Urbanist-SemiBold] ${isSelected ? 'text-white' : 'text-[#4A3B32]'}`}>
              {option.label}
            </Text>
            <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${isSelected ? 'border-white bg-white' : 'border-[#4A3B32] bg-transparent'}`}>
              {isSelected && <View className="w-3 h-3 bg-[#9BB168] rounded-full" />}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  // --- Cards Type Question ---
  const renderCardsQuestion = () => {
    // Helper to handle skip
    const handleSkip = () => {
      setAnswers({ ...answers, [currentQuestion.id]: 'skipped' });
      // Use setTimeout to ensure state update before moving next
      setTimeout(() => {
        if (currentStep < questions.length - 1) {
          setCurrentStep(currentStep + 1);
        } else {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }],
          });
        }
      }, 50);
    };

    return (
      <View className="gap-6">
        {currentQuestion.options?.map((option) => {
          const isSelected = answers[currentQuestion.id] === option.id;
          const SvgComponent = option.svg;

          return (
            <TouchableOpacity
              key={option.id}
              onPress={() => handleSelect(option.id)}
              className="rounded-[30px] overflow-hidden shadow-sm border-2"
              style={{
                height: 180,
                backgroundColor: isSelected ? '#9BB168' : 'white',
                borderColor: isSelected ? '#9BB168' : '#F3F4F6'
              }}
            >
              <View className="flex-row h-full">
                <View className="flex-1 p-6 justify-between">
                  <Text className={`text-xl font-[Urbanist-Bold] ${isSelected ? 'text-white' : 'text-[#4A3B32]'}`}>
                    {option.label}
                  </Text>
                  <Ionicons
                    name={option.id === 'male' ? 'male' : 'female'}
                    size={24}
                    color={isSelected ? 'white' : '#4A3B32'}
                  />
                </View>
                <View className="w-1/2 h-full justify-end items-end relative">
                  {SvgComponent && (
                    <View style={{ position: 'absolute', bottom: -10, right: -10 }}>
                      <SvgComponent width={140} height={140} />
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity
          onPress={handleSkip}
          className="bg-[#E6E8D6] rounded-full py-4 mt-2 flex-row justify-center items-center"
        >
          <Text className="text-[#9BB168] font-[Urbanist-Bold] mr-2">Prefer to skip, thanks</Text>
          <Ionicons name="close" size={20} color="#9BB168" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-[#FBFBF9]">
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Header */}
      <View style={{ paddingTop: insets.top + 10, paddingHorizontal: 24 }} className="flex-row items-center justify-between mb-2">
        <TouchableOpacity
          onPress={handleBack}
          className="w-12 h-12 rounded-full border border-[#4A3B32] items-center justify-center"
        >
          <Ionicons name="chevron-back" size={24} color="#4A3B32" />
        </TouchableOpacity>

        {/* Right side: Assessment Title + Numbering Badge */}
        <View className="items-end">
          <Text className="text-xl font-[Urbanist-Bold] text-[#4A3B32] mb-1">Assessment</Text>
          <View className="bg-[#EFE5DA] px-2 py-0.5 rounded-full">
            <Text className="text-[#4A3B32] font-[Urbanist-Bold] text-xs">
              {currentStep + 1} of {questions.length}
            </Text>
          </View>
        </View>
      </View>

      {/* Title */}
      <Text className="text-3xl font-[Urbanist-Bold] text-[#4A3B32] text-center mt-6 mb-8 px-6 leading-tight">
        {currentQuestion.title}
      </Text>

      {/* Content Area - Different rendering based on type */}
      {currentQuestion.type === 'wheel' || currentQuestion.type === 'ruler' ? (
        // For wheel and ruler, render directly without ScrollView to avoid nesting
        <View className="flex-1">
          {currentQuestion.type === 'wheel' && renderAgeWheel()}
          {currentQuestion.type === 'ruler' && renderWeightRuler()}
        </View>
      ) : (
        // For list and cards, use ScrollView
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
        >
          {currentQuestion.type === 'list' && renderListQuestion()}
          {currentQuestion.type === 'cards' && renderCardsQuestion()}
        </ScrollView>
      )}

      {/* Footer / Continue Button */}
      <View className="px-6 pb-10 pt-4 bg-[#FBFBF9]" style={{ paddingBottom: insets.bottom + 40 }}>
        <TouchableOpacity
          className={`rounded-full py-5 flex-row justify-center items-center shadow-lg ${answers[currentQuestion.id] ? 'bg-[#4A3B32]' : 'bg-[#E0E0E0]'}`}
          onPress={handleNext}
          disabled={!answers[currentQuestion.id]}
        >
          <Text className={`text-lg font-[Urbanist-Bold] mr-2 ${answers[currentQuestion.id] ? 'text-white' : 'text-gray-500'}`}>
            Continue
          </Text>
          <Ionicons name="arrow-forward" size={20} color={answers[currentQuestion.id] ? 'white' : 'gray'} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AssessmentScreen;