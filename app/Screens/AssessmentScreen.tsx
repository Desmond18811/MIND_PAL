import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions, StatusBar, FlatList, NativeSyntheticEvent, NativeScrollEvent, PanResponder } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path, Circle, G, Defs, LinearGradient, Stop } from 'react-native-svg';
// @ts-ignore
import MaleSvg from '../assets/male.svg';
// @ts-ignore
import FemaleSvg from '../assets/female.svg';
// @ts-ignore
import ProfessionalSvg from '../assets/professional.svg';
// @ts-ignore
import DeadSvg from '../assets/dead.svg';
// @ts-ignore
import SadSvg from '../assets/sad.svg';
// @ts-ignore
import FairSvg from '../assets/fair.svg';
// @ts-ignore
import GoodSvg from '../assets/good.svg';
// @ts-ignore
import ExcellentSvg from '../assets/excellent .svg'; // Note the space in filename

import "../global.css";

const { width, height } = Dimensions.get('window');

type QuestionType = 'list' | 'cards' | 'wheel' | 'ruler' | 'mood' | 'binary_image' | 'radio_cards' | 'vertical_slider' | 'grid';

interface Option {
  id: string;
  label: string;
  subLabel?: string;
  svg?: React.FC<any> | any;
  icon?: string; // For ionicons
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
  {
    id: 5,
    type: 'mood',
    title: "How would you describe your mood?",
    options: [
      { id: 'worst', label: 'I Feel Worst', svg: DeadSvg },
      { id: 'poor', label: 'I Feel Poor', svg: SadSvg },
      { id: 'neutral', label: 'I Feel Neutral', svg: FairSvg },
      { id: 'good', label: 'I Feel Good', svg: GoodSvg },
      { id: 'excellent', label: 'I Feel Excellent', svg: ExcellentSvg },
    ]
  },
  {
    id: 6,
    type: 'binary_image',
    title: "Have you sought professional help before?",
    options: [
      { id: 'yes', label: 'Yes' },
      { id: 'no', label: 'No' },
    ]
  },
  {
    id: 7,
    type: 'radio_cards',
    title: "Are you experiencing any physical distress?",
    options: [
      { id: 'yes', label: 'Yes, one or multiple', subLabel: 'I’m experiencing physical pain in different place over my body.' },
      { id: 'no', label: 'No Physical Pain At All', subLabel: 'I’m not experiencing any physical pain in my body at all :)' },
    ]
  },
  {
    id: 8,
    type: 'vertical_slider',
    title: "How would you rate your sleep quality?",
    // Using options to map ranges to labels/emojis
    options: [
      { id: 'excellent', label: 'Excellent', subLabel: '7-9 HOURS', svg: ExcellentSvg },
      { id: 'good', label: 'Good', subLabel: '6-7 HOURS', svg: GoodSvg },
      { id: 'fair', label: 'Fair', subLabel: '5 HOURS', svg: FairSvg },
      { id: 'poor', label: 'Poor', subLabel: '3-4 HOURS', svg: SadSvg },
      { id: 'worst', label: 'Worst', subLabel: '<3 HOURS', svg: DeadSvg },
    ]
  },
  {
    id: 9,
    type: 'grid',
    title: "Are you taking any medications?",
    options: [
      { id: 'prescribed', label: 'Prescribed Medications', icon: 'flask-outline' },
      { id: 'supplements', label: 'Over the Counter Supplements', icon: 'nutrition-outline' }, // closest match
      { id: 'none', label: 'I’m not taking any', icon: 'ban-outline' },
      { id: 'skip', label: 'Prefer not to say', icon: 'close-outline' },
    ]
  },
  // Placeholders for 10-14
  ...Array.from({ length: 5 }, (_, i) => ({
    id: i + 10,
    type: 'list' as QuestionType,
    title: `Question ${i + 10}`,
    options: [
      { id: 'opt1', label: 'Option 1' },
      { id: 'opt2', label: 'Option 2' },
      { id: 'opt3', label: 'Option 3' },
    ],
  })),
];

const ITEM_HEIGHT = 60;
const RULER_ITEM_WIDTH = 50;

// Extracted MoodWheel Component to solve Hook rules violation
const MoodWheel = ({ currentQuestion, moodValue, setMoodValue, onSelect }: any) => {
  const moods = currentQuestion.options || [];
  const radius = 120;
  const colors = ['#FF8A65', '#FFB74D', '#FFD54F', '#AED581', '#81C784'];

  // PanResponder needs to be at the top level of the component function, not conditionally called
  const PanResponderInstance = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt, gestureState) => {
        handleTouch(evt.nativeEvent.locationX, evt.nativeEvent.locationY);
      },
      onPanResponderMove: (evt, gestureState) => {
        handleTouch(evt.nativeEvent.locationX, evt.nativeEvent.locationY);
      },
    })
  ).current;

  const handleTouch = (x: number, y: number) => {
    const centerX = width / 2;
    const centerY = 200;
    const dx = x - centerX;
    const dy = y - centerY;
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);

    if (angle < 0 && angle > -180) {
      let index = Math.floor((angle + 180) / 36);
      if (index < 0) index = 0;
      if (index > 4) index = 4;
      if (index !== moodValue) {
        setMoodValue(index);
        onSelect(moods[index].id);
      }
    }
  };

  const currentMood = moods[moodValue];
  const SvgIcon = currentMood.svg;

  return (
    <View className="flex-1 items-center justify-between py-10">
      <View className="items-center z-10">
        <Text className="text-xl font-[Urbanist-Bold] text-[#4A3B32] mb-6">
          {currentMood.label}
        </Text>
        <View className="bg-[#FFEB99] rounded-full p-8 shadow-sm">
          {SvgIcon && <SvgIcon width={80} height={80} />}
        </View>
        <View className="mt-4">
          <Ionicons name="chevron-down" size={30} color="#E0E0E0" />
        </View>
      </View>

      {/* Wheel Arc */}
      <View
        className="items-center justify-center mt-10"
        {...PanResponderInstance.panHandlers}
      >
        <Svg height="220" width={width} viewBox={`0 0 ${width} 220`}>
          <Defs>
            {/* Gradients if needed */}
          </Defs>

          {/* Render Segments */}
          {colors.map((color, i) => {
            // Arc start/end angles
            const startAngle = (i * 36) + 180;
            const endAngle = ((i + 1) * 36) + 180;

            // Convert polar to cartesian
            const cx = width / 2;
            const cy = 200;
            const r = radius;

            const rad = (deg: number) => (deg * Math.PI) / 180;

            const x1 = cx + r * Math.cos(rad(startAngle));
            const y1 = cy + r * Math.sin(rad(startAngle));

            const x2 = cx + r * Math.cos(rad(endAngle));
            const y2 = cy + r * Math.sin(rad(endAngle));

            // Path
            const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`;

            const isActive = moodValue === i;

            return (
              <Path
                key={i}
                d={d}
                fill={color}
                opacity={isActive ? 1 : 0.3}
                stroke="white"
                strokeWidth="2"
              />
            );
          })}

          {/* Overlay to hide center to make it an arc/donut */}
          <Path
            d={`M ${width / 2 + radius * 0.6} 200 A ${radius * 0.6} ${radius * 0.6} 0 0 0 ${width / 2 - radius * 0.6} 200`}
            fill="#FBFBF9" // Background color
          />

          {/* Needle/Indicator */}
          <G
            rotation={(moodValue * 36) + 180 + 18} // Center of the segment
            origin={`${width / 2}, 200`}
          >
            <Circle cx={width / 2} cy={200} r={10} fill="#4A3B32" />
            <Path d={`M ${width / 2} 200 L ${width / 2} ${200 - radius + 10} L ${width / 2 + 5} 200 Z`} fill="#4A3B32" />
          </G>
        </Svg>
      </View>
    </View>
  );
};

const AssessmentScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});

  const [currentAge, setCurrentAge] = useState(18);
  const [currentWeight, setCurrentWeight] = useState(60);
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');

  // Mood State
  const [moodValue, setMoodValue] = useState(2); // 0 to 4 (5 states)

  // Sleep State
  const [sleepValue, setSleepValue] = useState(2); // 0 to 4 (5 states)

  const wheelScrollRef = useRef<FlatList>(null);
  const rulerScrollRef = useRef<ScrollView>(null);

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  useEffect(() => {
    // Reset or load state based on step
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
    if (currentQuestion.type === 'mood') {
      setAnswers(prev => ({ ...prev, [currentQuestion.id]: 'neutral' }));
    }
    if (currentQuestion.type === 'vertical_slider') {
      setAnswers(prev => ({ ...prev, [currentQuestion.id]: 'fair' }));
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
            className="absolute border-2 border-[#9BB168] rounded-full z-0 pointer-events-none bg-transparent"
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

  // --- Binary Image Question (Professional Help) ---
  const renderBinaryImage = () => {
    return (
      <View className="flex-1 items-center justify-between pb-10">
        <View className="flex-1 items-center justify-center">
          <ProfessionalSvg width={300} height={300} />
        </View>

        <View className="flex-row gap-4 w-full px-0">
          {currentQuestion.options?.map((option) => {
            const isSelected = answers[currentQuestion.id] === option.id;
            return (
              <TouchableOpacity
                key={option.id}
                onPress={() => handleSelect(option.id)}
                className={`flex-1 py-4 rounded-full border-2 items-center justify-center ${isSelected ? 'bg-[#9BB168] border-[#9BB168]' : 'bg-white border-gray-200'}`}
              >
                <Text className={`text-lg font-[Urbanist-Bold] ${isSelected ? 'text-white' : 'text-[#4A3B32]'}`}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  // --- Radio Cards Question (Physical Distress) ---
  const renderRadioCards = () => {
    return (
      <View className="gap-4">
        {currentQuestion.options?.map((option) => {
          const isSelected = answers[currentQuestion.id] === option.id;
          return (
            <TouchableOpacity
              key={option.id}
              onPress={() => handleSelect(option.id)}
              className={`p-6 rounded-[24px] border-2 relative overflow-hidden ${isSelected ? 'bg-[#9BB168] border-[#9BB168]' : 'bg-white border-gray-100'}`}
            >
              <View className="flex-row justify-between items-start mb-2">
                {/* Custom Checkbox */}
                <View className={`w-8 h-8 rounded-full border-2 items-center justify-center ${isSelected ? 'border-white bg-white/20' : 'border-gray-300 bg-gray-50'}`}>
                  {isSelected && <Ionicons name="checkmark" size={16} color="white" />}
                </View>
              </View>

              <Text className={`text-xl font-[Urbanist-Bold] mb-2 ${isSelected ? 'text-white' : 'text-[#4A3B32]'}`}>
                {option.label}
              </Text>
              <Text className={`text-base font-[Urbanist-Medium] ${isSelected ? 'text-white/90' : 'text-gray-500'}`}>
                {option.subLabel}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  // --- Vertical Slider (Sleep Quality) ---
  const renderVerticalSlider = () => {
    // 5 levels: Excellent(0), Good(1), Fair(2), Poor(3), Worst(4)
    // Note: In vertical sliders, usually top is value 0 or max.
    // Let's visualize it: Top = Excellent, Bottom = Worst.

    const options = currentQuestion.options || [];
    // const currentLevel = options[sleepValue]; // index maps to options array

    return (
      <View className="flex-1 flex-row items-center justify-between px-4">
        {/* Left Labels */}
        <View className="h-[400px] justify-between items-start py-4">
          {options.map((opt, i) => (
            <View key={i} className="h-12 justify-center">
              <Text className={`font-[Urbanist-Bold] text-lg ${sleepValue === i ? 'text-[#4A3B32]' : 'text-gray-300'}`}>
                {opt.label}
              </Text>
              <Text className={`font-[Urbanist-Medium] text-xs ${sleepValue === i ? 'text-gray-600' : 'text-gray-300'}`}>
                {opt.subLabel}
              </Text>
            </View>
          ))}
        </View>

        {/* Slider Track */}
        <View className="h-[400px] items-center justify-center relative w-12">
          {/* Track Line */}
          <View className="w-4 h-full bg-[#F0EAE2] rounded-full absolute" />
          {/* Active Line (from bottom/top depending on logic, let's just use thumb) */}

          {/* Ticks/Touch Targets */}
          {/* We overlay a transparent touchable area or use buttons */}
          <View className="h-full justify-between absolute py-4">
            {options.map((_, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => {
                  setSleepValue(i);
                  setAnswers({ ...answers, [currentQuestion.id]: options[i].id });
                }}
                className="w-12 h-12 items-center justify-center"
              >
                {/* Invisible touch target mostly, maybe a small dot */}
                <View className={`w-2 h-2 rounded-full ${sleepValue === i ? 'bg-transparent' : 'bg-[#D0C0B0]'}`} />
              </TouchableOpacity>
            ))}
          </View>

          {/* The Thumb - Absolute positioned based on value */}
          <View
            className="w-12 h-12 bg-[#E67E22] rounded-full absolute border-4 border-[#FDF6F0] shadow-lg items-center justify-center"
            style={{
              top: (sleepValue / 4) * 352 + 24 - 24 // approximate math: height is 400. 5 steps. 
              // 0 -> 0%, 4 -> 100%
            }}
          >
            <Ionicons name="resize" size={16} color="white" style={{ transform: [{ rotate: '90deg' }] }} />
          </View>
        </View>

        {/* Right Icons */}
        <View className="h-[400px] justify-between items-end py-4">
          {options.map((opt, i) => {
            const Icon = opt.svg;
            return (
              <View
                key={i}
                className={`h-12 w-12 items-center justify-center rounded-full transition-all ${sleepValue === i ? 'bg-opacity-100' : 'opacity-40'}`}
                style={{ transform: [{ scale: sleepValue === i ? 1.1 : 1 }] }}
              >
                {Icon && <Icon width={48} height={48} />}
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  // --- Grid Question (Medications) ---
  const renderGrid = () => {
    return (
      <View className="flex-row flex-wrap justify-between gap-y-4">
        {currentQuestion.options?.map((option) => {
          const isSelected = answers[currentQuestion.id] === option.id;

          // Special check for "none" option logic if needed, but simple select for now
          // If Grid is 2x2, width approx 48%
          return (
            <TouchableOpacity
              key={option.id}
              onPress={() => handleSelect(option.id)}
              className={`w-[48%] aspect-square p-4 rounded-[24px] justify-between border-2 ${isSelected ? 'bg-[#FDF6F0] border-[#4A3B32]' : 'bg-white border-white shadow-sm'}`}
            >
              <View className="items-start">
                {option.icon === 'flask-outline' && <Ionicons name="flask-outline" size={32} color={isSelected ? '#4A3B32' : '#4A3B32'} />}
                {option.icon === 'nutrition-outline' && <Ionicons name="nutrition-outline" size={32} color={isSelected ? '#4A3B32' : '#4A3B32'} />}
                {option.icon === 'ban-outline' && <Ionicons name="ban-outline" size={32} color={isSelected ? '#4A3B32' : '#4A3B32'} />}
                {option.icon === 'close-outline' && <Ionicons name="close-outline" size={32} color={isSelected ? '#4A3B32' : '#4A3B32'} />}
              </View>

              <Text className="text-lg font-[Urbanist-Bold] text-[#4A3B32] leading-tight">
                {option.label}
              </Text>

              {/* Selection Indicator */}
              <View className="absolute top-4 right-4">
                {isSelected ? (
                  <Ionicons name="checkbox" size={24} color="#4A3B32" />
                ) : (
                  <Ionicons name="square-outline" size={24} color="#E0E0E0" />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
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
          {currentQuestion.type === 'mood' && (
            <MoodWheel
              currentQuestion={currentQuestion}
              moodValue={moodValue}
              setMoodValue={setMoodValue}
              onSelect={(val: string) => setAnswers({ ...answers, [currentQuestion.id]: val })}
            />
          )}
          {currentQuestion.type === 'binary_image' && renderBinaryImage()}
          {currentQuestion.type === 'radio_cards' && renderRadioCards()}
          {currentQuestion.type === 'vertical_slider' && renderVerticalSlider()}
          {currentQuestion.type === 'grid' && renderGrid()}
        </ScrollView>
      )}

      {/* Footer / Continue Button (Conditional for some types) */}
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