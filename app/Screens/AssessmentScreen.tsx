import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions, StatusBar, FlatList, NativeSyntheticEvent, NativeScrollEvent, PanResponder, TextInput } from 'react-native';
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
// @ts-ignore
import IllustrationSvg from '../assets/symptoms .svg';

import VerticalSlider from './VerticalSlider';

import "../global.css";

const { width, height } = Dimensions.get('window');

type QuestionType = 'list' | 'cards' | 'wheel' | 'ruler' | 'mood' | 'binary_image' | 'radio_cards' | 'vertical_slider' | 'grid' | 'search_list' | 'symptoms' | 'stress_scale' | 'voice_analysis' | 'expression_analysis';

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
  description?: string; // For adding extra text
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
  {
    id: 10,
    type: 'search_list',
    title: "Please specify your medications!",
    options: [
      { id: 'abilify', label: 'Abilify' },
      { id: 'abilify_maintena', label: 'Abilify Maintena' },
      { id: 'abiraterone', label: 'Abiraterone' },
      { id: 'acetaminophen', label: 'Acetaminophen' },
      { id: 'axpelliarmus', label: 'Axpelliarmus' },
      { id: 'aspirin', label: 'Aspirin' },
      { id: 'ibuprofen', label: 'Ibuprofen' },
    ]
  },
  {
    id: 11,
    type: 'symptoms',
    title: "Do you have other mental health symptoms?",
    options: [
      { id: 'social_withdrawal', label: 'Social Withdrawal' },
      { id: 'feeling_numbness', label: 'Feeling Numbness' },
      { id: 'feeling_sad', label: 'Feeling Sad' },
      { id: 'depressed', label: 'Depressed' },
      { id: 'angry', label: 'Angry' },
      { id: 'anxious', label: 'Anxious' },
      { id: 'hopeless', label: 'Hopeless' },
      { id: 'irritable', label: 'Irritable' },
    ]
  },
  {
    id: 12,
    type: 'stress_scale',
    title: "How would you rate your stress level?",
    min: 1,
    max: 5,
  },
  {
    id: 13,
    type: 'voice_analysis',
    title: "AI Sound Analysis",
    description: "Please say the following words below. Don’t worry, we don’t steal your voice data."
  },
  {
    id: 14,
    type: 'expression_analysis',
    title: "Expression Analysis",
    description: "Freely write down anything that's on your mind. Dr Freud.ai is here to listen..."
  },
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

  // Medications Search State
  const [searchText, setSearchText] = useState('');
  const [selectedMedications, setSelectedMedications] = useState<string[]>([]);

  // Stress Level State
  const [stressLevel, setStressLevel] = useState(3);

  // Expression Analysis State
  const [expressionText, setExpressionText] = useState('');

  // Symptoms State
  const [symptomInput, setSymptomInput] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);

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
    if (currentQuestion.type === 'stress_scale') {
      setStressLevel(3);
      setAnswers(prev => ({ ...prev, [currentQuestion.id]: '3' }));
    }
    if (currentQuestion.type === 'search_list') {
      setSelectedMedications([]);
    }
  }, [currentStep, currentQuestion]);

  const handleSelect = (optionId: string) => {
    setAnswers({ ...answers, [currentQuestion.id]: optionId });
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Navigate to Avatar Selection after assessment completion
      navigation.navigate('AvatarSelection', { assessmentAnswers: answers });
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



  // --- Search List (Medications) ---
  const renderSearchList = () => {
    const filteredOptions = currentQuestion.options?.filter(opt =>
      opt.label.toLowerCase().includes(searchText.toLowerCase())
    ) || [];

    const toggleMedication = (id: string) => {
      const newSelection = selectedMedications.includes(id)
        ? selectedMedications.filter(m => m !== id)
        : [...selectedMedications, id];

      setSelectedMedications(newSelection);
      setAnswers({ ...answers, [currentQuestion.id]: newSelection });
    };

    return (
      <View className="flex-1">
        {/* Search Bar */}
        <View className="flex-row items-center bg-[#EDE8E4] rounded-full px-4 py-3 mb-6">
          <View className="w-8 h-8 rounded-full bg-[#E67E22] items-center justify-center mr-2">
            <Text className="text-white font-bold">A</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-1 mr-2">
            {['B', 'C', '...', 'X', 'Y', 'Z'].map(char => (
              <Text key={char} className="text-[#4A3B32] font-[Urbanist-Bold] mx-2 opacity-50">{char}</Text>
            ))}
          </ScrollView>
          <TextInput
            placeholder=""
            value={searchText}
            onChangeText={setSearchText}
            className="flex-1 h-full"
          />
          <Ionicons name="search" size={20} color="#4A3B32" />
        </View>

        <View className="flex-1">
          {filteredOptions.map(option => {
            const isSelected = selectedMedications.includes(option.id);
            return (
              <TouchableOpacity
                key={option.id}
                onPress={() => toggleMedication(option.id)}
                className={`flex-row items-center justify-between p-5 mb-3 rounded-[24px] ${isSelected ? 'bg-[#9BB168]' : 'bg-white shadow-sm'}`}
              >
                <Text className={`text-lg font-[Urbanist-Bold] ${isSelected ? 'text-white' : 'text-[#4A3B32]'}`}>
                  {option.label}
                </Text>
                <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${isSelected ? 'border-white' : 'border-[#4A3B32]'}`}>
                  {isSelected && <View className="w-3 h-3 bg-white rounded-full" />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Selected Pills */}
        <View className="flex-row flex-wrap mt-4 gap-2 justify-center">
          <Text className="text-[#4A3B32] mr-2 self-center">Selected:</Text>
          {selectedMedications.map(id => {
            const label = currentQuestion.options?.find(o => o.id === id)?.label;
            return (
              <TouchableOpacity key={id} onPress={() => toggleMedication(id)} className="bg-[#EFE5DA] rounded-full px-3 py-1 flex-row items-center">
                <Text className="text-[#4A3B32] text-xs font-bold mr-1">{label}</Text>
                <Ionicons name="close" size={14} color="#4A3B32" />
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  // --- Symptoms ---
  const renderSymptoms = () => {
    const mostCommon = ['depressed', 'angry'];

    const toggleSymptom = (id: string) => {
      const newSelection = selectedSymptoms.includes(id)
        ? selectedSymptoms.filter(s => s !== id)
        : [...selectedSymptoms, id];
      setSelectedSymptoms(newSelection);
      setAnswers({ ...answers, [currentQuestion.id]: newSelection });
    };

    const addSymptomFromInput = () => {
      if (symptomInput.trim()) {
        const newSymptom = symptomInput.trim().toLowerCase().replace(/\s+/g, '_');
        if (!selectedSymptoms.includes(newSymptom)) {
          const newSelection = [...selectedSymptoms, newSymptom];
          setSelectedSymptoms(newSelection);
          setAnswers({ ...answers, [currentQuestion.id]: newSelection });
        }
        setSymptomInput('');
      }
    };

    return (
      <View className="flex-1">
        {/* Illustration */}
        <View className="items-center mb-6">
          <IllustrationSvg width={200} height={180} />
        </View>

        {/* Symptom Input Box */}
        <View className="bg-[#F5F3EF] rounded-[24px] p-4 mb-6 min-h-[150px]">
          {/* Selected Chips */}
          <View className="flex-row flex-wrap gap-2 mb-4">
            {selectedSymptoms.map(id => {
              const option = currentQuestion.options?.find(o => o.id === id);
              const label = option?.label || id.replace(/_/g, ' ');
              return (
                <TouchableOpacity
                  key={id}
                  onPress={() => toggleSymptom(id)}
                  className="bg-[#EDE8E4] rounded-full px-4 py-2 flex-row items-center"
                >
                  <Text className="text-[#4A3B32] font-[Urbanist-Medium] mr-1">{label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Text Input */}
          <TextInput
            placeholder="Type a symptom..."
            placeholderTextColor="#B0A090"
            className="text-lg font-[Urbanist-Medium] text-[#4A3B32]"
            value={symptomInput}
            onChangeText={setSymptomInput}
            onSubmitEditing={addSymptomFromInput}
            returnKeyType="done"
          />

          {/* Counter */}
          <View className="flex-row justify-end items-center mt-4">
            <Ionicons name="copy-outline" size={16} color="#B0A090" style={{ marginRight: 4 }} />
            <Text className="text-[#B0A090] font-[Urbanist-Medium]">{selectedSymptoms.length}/10</Text>
          </View>
        </View>

        {/* Most Common */}
        <View className="flex-row items-center gap-2">
          <Text className="text-[#4A3B32] font-[Urbanist-Medium]">Most Common:</Text>
          {mostCommon.map(id => {
            const option = currentQuestion.options?.find(o => o.id === id);
            const label = option?.label || id;
            const isSelected = selectedSymptoms.includes(id);
            return (
              <TouchableOpacity
                key={id}
                onPress={() => toggleSymptom(id)}
                className={`rounded-full px-4 py-2 flex-row items-center ${isSelected ? 'bg-[#E67E22]' : 'bg-[#E67E22]'}`}
              >
                <Text className="text-white font-[Urbanist-Medium] mr-1">{label}</Text>
                <Ionicons name="close" size={14} color="white" />
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  // --- Stress Scale (1-5) ---
  const renderStressScale = () => {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-[140px] font-[Urbanist-Bold] text-[#4A3B32] mb-10">
          {stressLevel}
        </Text>

        <View className="flex-row w-full justify-between px-4 bg-white rounded-full p-2 mb-10">
          {[1, 2, 3, 4, 5].map(num => (
            <TouchableOpacity
              key={num}
              onPress={() => {
                setStressLevel(num);
                setAnswers({ ...answers, [currentQuestion.id]: num.toString() });
              }}
              className={`w-14 h-14 rounded-full items-center justify-center ${stressLevel === num ? 'bg-[#E67E22]' : 'bg-transparent'}`}
            >
              <Text className={`text-xl font-[Urbanist-Bold] ${stressLevel === num ? 'text-white' : 'text-[#4A3B32]'}`}>
                {num}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text className="text-xl text-[#4A3B32] font-[Urbanist-Medium] text-center">
          {stressLevel === 1 ? 'Not Stressed At All' :
            stressLevel === 5 ? 'You Are Extremely Stressed Out.' :
              'Moderately Stressed'}
        </Text>
      </View>
    );
  };

  // --- Voice Analysis ---
  const renderVoiceAnalysis = () => (
    <View className="flex-1 items-center justify-start pt-4">
      <Text className="text-gray-500 text-center px-10 mb-8 leading-6 font-[Urbanist-Medium]">
        {currentQuestion.description}
      </Text>

      {/* Sound Waves Visualization - Concentric Green Circles */}
      <View className="items-center justify-center mb-12" style={{ height: 280 }}>
        {/* Outermost ring */}
        <View className="w-[280px] h-[280px] rounded-full bg-[#E8EDD8] absolute" />
        {/* Second ring */}
        <View className="w-[220px] h-[220px] rounded-full bg-[#D4DFC4] absolute" />
        {/* Third ring */}
        <View className="w-[160px] h-[160px] rounded-full bg-[#B8C9A0] absolute" />
        {/* Fourth ring */}
        <View className="w-[100px] h-[100px] rounded-full bg-[#9BB168] absolute" />
        {/* Center dot */}
        <View className="w-[50px] h-[50px] rounded-full bg-[#4A3B32]" />
      </View>

      {/* Prompt Text */}
      <View className="px-6">
        <View className="flex-row flex-wrap justify-center items-baseline">
          <View className="bg-[#FDF0E8] rounded-lg px-2 py-1 mr-2">
            <Text className="text-2xl font-[Urbanist-Bold] text-[#E67E22]">I believe in</Text>
          </View>
          <Text className="text-2xl font-[Urbanist-Bold] text-[#4A3B32] italic">Dr. Freud,</Text>
        </View>
        <Text className="text-2xl font-[Urbanist-Bold] text-[#4A3B32] text-center mt-2 italic">with all my heart.</Text>
      </View>
    </View>
  );

  // --- Expression Analysis (Text Input) ---
  const renderExpressionAnalysis = () => (
    <View className="flex-1">
      <Text className="text-gray-500 text-center px-6 mb-8 font-[Urbanist-Medium]">
        {currentQuestion.description}
      </Text>

      <View className="bg-white rounded-[30px] p-6 border-2 border-[#EFE5DA] mb-8 min-h-[200px] relative shadow-sm">
        <TextInput
          multiline
          placeholder="I don't want to be alive anymore..."
          placeholderTextColor="#C0B8A8"
          className="text-2xl font-[Urbanist-Bold] leading-10"
          style={{ color: expressionText.length > 0 ? '#4A3B32' : '#C0B8A8' }}
          value={expressionText}
          onChangeText={text => {
            setExpressionText(text);
            setAnswers({ ...answers, [currentQuestion.id]: text });
          }}
          maxLength={250}
        />
        <View className="absolute bottom-6 right-6 flex-row items-center">
          <Ionicons name="copy-outline" size={16} color="#B0A090" style={{ marginRight: 4 }} />
          <Text className="text-gray-400 font-[Urbanist-Bold]">{expressionText.length}/250</Text>
        </View>
      </View>

      <View className="items-center">
        <TouchableOpacity className="bg-[#9BB168] flex-row items-center px-6 py-4 rounded-full">
          <Ionicons name="mic" size={20} color="white" style={{ marginRight: 8 }} />
          <Text className="text-white font-[Urbanist-Bold]">Use voice Instead</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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
          {currentQuestion.type === 'vertical_slider' && (
            <VerticalSlider
              currentQuestion={currentQuestion}
              answers={answers}
              setAnswers={setAnswers}
              sleepValue={sleepValue}
              setSleepValue={setSleepValue}
            />
          )}
          {currentQuestion.type === 'grid' && renderGrid()}
          {currentQuestion.type === 'search_list' && renderSearchList()}
          {currentQuestion.type === 'symptoms' && renderSymptoms()}
          {currentQuestion.type === 'stress_scale' && renderStressScale()}
          {currentQuestion.type === 'voice_analysis' && renderVoiceAnalysis()}
          {currentQuestion.type === 'expression_analysis' && renderExpressionAnalysis()}
        </ScrollView>
      )}

      {/* Footer / Continue Button (Conditional for some types) */}
      <View className="px-6 pb-10 pt-4 bg-[#FBFBF9]" style={{ paddingBottom: insets.bottom + 40 }}>
        {(() => {
          // Screens that can always proceed (optional or have defaults)
          const alwaysEnabled = ['symptoms', 'stress_scale', 'voice_analysis', 'expression_analysis', 'vertical_slider'];
          const canProceed = alwaysEnabled.includes(currentQuestion.type) || !!answers[currentQuestion.id];

          return (
            <TouchableOpacity
              className={`rounded-full py-5 flex-row justify-center items-center shadow-lg ${canProceed ? 'bg-[#4A3B32]' : 'bg-[#E0E0E0]'}`}
              onPress={handleNext}
              disabled={!canProceed}
            >
              <Text className={`text-lg font-[Urbanist-Bold] mr-2 ${canProceed ? 'text-white' : 'text-gray-500'}`}>
                Continue
              </Text>
              <Ionicons name="arrow-forward" size={20} color={canProceed ? 'white' : 'gray'} />
            </TouchableOpacity>
          );
        })()}
      </View>
    </View>
  );
};

export default AssessmentScreen;