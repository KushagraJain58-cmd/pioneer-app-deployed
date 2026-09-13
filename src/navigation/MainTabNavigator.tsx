import React, { useRef, useState } from 'react';
import { Image, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { APP_ICONS } from '../utils/appIcons';
import MoreSheet from '../components/MoreSheet';

import DashboardScreen from '../screens/dashboard/DashboardScreen';
import CareersScreen from '../screens/careers/CareersScreen';
import CareerDetailScreen from '../screens/careers/CareerDetailScreen';
import UniversityScreen from '../screens/university/UniversityScreen';
import UniversityDetailScreen from '../screens/university/UniversityDetailScreen';
import PsychometricHomeScreen from '../screens/psychometric/PsychometricHomeScreen';
import TestInfoScreen from '../screens/psychometric/TestInfoScreen';
import DISHA1AssessmentScreen from '../screens/psychometric/DISHA1AssessmentScreen';
import DISHA2AssessmentScreen from '../screens/psychometric/DISHA2AssessmentScreen';
import DISHA3AssessmentScreen from '../screens/psychometric/DISHA3AssessmentScreen';
import DISHA4AssessmentScreen from '../screens/psychometric/DISHA4AssessmentScreen';
import DISHA5AssessmentScreen from '../screens/psychometric/DISHA5AssessmentScreen';
import DISHA6AssessmentScreen from '../screens/psychometric/DISHA6AssessmentScreen';
import DISHA7AssessmentScreen from '../screens/psychometric/DISHA7AssessmentScreen';
import DISHA8AssessmentScreen from '../screens/psychometric/DISHA8AssessmentScreen';
import DISHAC10AssessmentScreen from '../screens/psychometric/DISHAC10AssessmentScreen';
import DISHAC12AssessmentScreen from '../screens/psychometric/DISHAC12AssessmentScreen';
import DISHA1ResultScreen from '../screens/psychometric/results/DISHA1ResultScreen';
import DISHA2ResultScreen from '../screens/psychometric/results/DISHA2ResultScreen';
import DISHA3ResultScreen from '../screens/psychometric/results/DISHA3ResultScreen';
import DISHA4ResultScreen from '../screens/psychometric/results/DISHA4ResultScreen';
import DISHA5ResultScreen from '../screens/psychometric/results/DISHA5ResultScreen';
import DISHA6ResultScreen from '../screens/psychometric/results/DISHA6ResultScreen';
import DISHA7ResultScreen from '../screens/psychometric/results/DISHA7ResultScreen';
import DISHA8ResultScreen from '../screens/psychometric/results/DISHA8ResultScreen';
import DISHAC10ResultScreen from '../screens/psychometric/results/DISHAC10ResultScreen';
import DISHAC12ResultScreen from '../screens/psychometric/results/DISHAC12ResultScreen';
import AcademicAssessmentScreen from '../screens/psychometric/AcademicAssessmentScreen';
import MBTIAssessmentScreen from '../screens/psychometric/MBTIAssessmentScreen';
import CareerAssessmentScreen from '../screens/psychometric/CareerAssessmentScreen';
import RIASECAssessmentScreen from '../screens/psychometric/RIASECAssessmentScreen';
import AcademicResultScreen from '../screens/psychometric/results/AcademicResultScreen';
import MBTIResultScreen from '../screens/psychometric/results/MBTIResultScreen';
import CareerResultScreen from '../screens/psychometric/results/CareerResultScreen';
import RIASECResultScreen from '../screens/psychometric/results/RIASECResultScreen';
import SkillsScreen from '../screens/skills/SkillsScreen';
import SkillWeekScreen from '../screens/skills/SkillWeekScreen';
import SkillQuizScreen from '../screens/skills/SkillQuizScreen';
import SkillFinalAssessmentScreen from '../screens/skills/SkillFinalAssessmentScreen';
import SkillResultScreen from '../screens/skills/SkillResultScreen';
import CounsellingScreen from '../screens/counselling/CounsellingScreen';
import ResourcesScreen from '../screens/resources/ResourcesScreen';
import ExploreCityScreen from '../screens/exploreCity/ExploreCityScreen';
import BlogScreen from '../screens/blog/BlogScreen';
import BlogDetailScreen from '../screens/blog/BlogDetailScreen';
import CVBuilderScreen from '../screens/cvBuilder/CVBuilderScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import MoreScreen from '../screens/more/MoreScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// PNG line-icons from the web sidebar, tinted to the active/inactive tab color.
const pngTabIcon = (key: keyof typeof APP_ICONS) =>
  ({ color }: { color: string }) => (
    <Image source={APP_ICONS[key]} style={{ width: 25, height: 25, tintColor: color }} resizeMode="contain" />
  );

const HEADER = {
  headerStyle: { backgroundColor: '#004877' },
  headerTintColor: '#fff',
  headerTitleStyle: { fontWeight: 'bold' as const, fontSize: 16 },
};

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={HEADER}>
      <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

function CareersStack() {
  return (
    <Stack.Navigator screenOptions={HEADER}>
      <Stack.Screen name="CareersList" component={CareersScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CareerDetail" component={CareerDetailScreen} options={{ title: 'Career Detail' }} />
    </Stack.Navigator>
  );
}

function UniversityStack() {
  return (
    <Stack.Navigator screenOptions={HEADER}>
      <Stack.Screen name="UniversityList" component={UniversityScreen} options={{ headerShown: false }} />
      <Stack.Screen name="UniversityDetail" component={UniversityDetailScreen} options={{ title: 'University' }} />
    </Stack.Navigator>
  );
}

function PsychometricStack() {
  return (
    <Stack.Navigator screenOptions={HEADER}>
      <Stack.Screen name="PsychometricHome" component={PsychometricHomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TestInfo" component={TestInfoScreen} options={{ title: 'About this test' }} />
      <Stack.Screen name="DISHA1Assessment" component={DISHA1AssessmentScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DISHA2Assessment" component={DISHA2AssessmentScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DISHA3Assessment" component={DISHA3AssessmentScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DISHA4Assessment" component={DISHA4AssessmentScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DISHA5Assessment" component={DISHA5AssessmentScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DISHA6Assessment" component={DISHA6AssessmentScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DISHA7Assessment" component={DISHA7AssessmentScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DISHA8Assessment" component={DISHA8AssessmentScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DISHAC10Assessment" component={DISHAC10AssessmentScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DISHAC12Assessment" component={DISHAC12AssessmentScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DISHA1Result" component={DISHA1ResultScreen} options={{ title: 'DISHA Report' }} />
      <Stack.Screen name="DISHA2Result" component={DISHA2ResultScreen} options={{ title: 'DISHA Test 2 Report' }} />
      <Stack.Screen name="DISHA3Result" component={DISHA3ResultScreen} options={{ title: 'DISHA Test 3 Report' }} />
      <Stack.Screen name="DISHA4Result" component={DISHA4ResultScreen} options={{ title: 'DISHA Test 4 Report' }} />
      <Stack.Screen name="DISHA5Result" component={DISHA5ResultScreen} options={{ title: 'DISHA Test 5 Report' }} />
      <Stack.Screen name="DISHA6Result" component={DISHA6ResultScreen} options={{ title: 'DISHA Test 6 Report' }} />
      <Stack.Screen name="DISHA7Result" component={DISHA7ResultScreen} options={{ title: 'DISHA Test 7 Report' }} />
      <Stack.Screen name="DISHA8Result" component={DISHA8ResultScreen} options={{ title: 'DISHA Test 8 Report' }} />
      <Stack.Screen name="DISHAC10Result" component={DISHAC10ResultScreen} options={{ title: 'Stream Selection Report' }} />
      <Stack.Screen name="DISHAC12Result" component={DISHAC12ResultScreen} options={{ title: 'Career Selection Report' }} />
      <Stack.Screen name="AcademicAssessment" component={AcademicAssessmentScreen} options={{ title: 'Academic Self-Efficacy' }} />
      <Stack.Screen name="MBTIAssessment" component={MBTIAssessmentScreen} options={{ title: 'MBTI Assessment' }} />
      <Stack.Screen name="CareerAssessment" component={CareerAssessmentScreen} options={{ title: 'Career Maturity' }} />
      <Stack.Screen name="RIASECAssessment" component={RIASECAssessmentScreen} options={{ title: 'RIASEC' }} />
      <Stack.Screen name="AcademicResult" component={AcademicResultScreen} options={{ title: 'Academic Result' }} />
      <Stack.Screen name="MBTIResult" component={MBTIResultScreen} options={{ title: 'MBTI Result' }} />
      <Stack.Screen name="CareerResult" component={CareerResultScreen} options={{ title: 'Career Result' }} />
      <Stack.Screen name="RIASECResult" component={RIASECResultScreen} options={{ title: 'RIASEC Result' }} />
    </Stack.Navigator>
  );
}

function MoreStack() {
  return (
    <Stack.Navigator screenOptions={HEADER}>
      <Stack.Screen name="MoreHome" component={MoreScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Skills" component={SkillsScreen} options={{ title: 'Skill Readiness' }} />
      <Stack.Screen name="SkillWeek" component={SkillWeekScreen} options={{ title: 'Weekly Module' }} />
      <Stack.Screen name="SkillQuiz" component={SkillQuizScreen} options={{ title: 'Assessment' }} />
      <Stack.Screen name="SkillFinalAssessment" component={SkillFinalAssessmentScreen} options={{ title: 'Final Assessment' }} />
      <Stack.Screen name="SkillResult" component={SkillResultScreen} options={{ title: 'Result', headerBackVisible: false }} />
      <Stack.Screen name="Counselling" component={CounsellingScreen} options={{ title: 'Counselling' }} />
      <Stack.Screen name="Resources" component={ResourcesScreen} options={{ title: 'Resources' }} />
      <Stack.Screen name="ExploreCity" component={ExploreCityScreen} options={{ title: 'Explore City' }} />
      <Stack.Screen name="Blog" component={BlogScreen} options={{ headerShown: false }} />
      <Stack.Screen name="BlogDetail" component={BlogDetailScreen} options={{ title: 'Blog' }} />
      <Stack.Screen name="CVBuilder" component={CVBuilderScreen} options={{ title: 'CV Builder' }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
    </Stack.Navigator>
  );
}

export default function MainTabNavigator() {
  const [moreVisible, setMoreVisible] = useState(false);
  // Captured from the More tab's press listener so the sheet can navigate into the More stack.
  const moreNavRef = useRef<any>(null);

  const handleSelect = (screen: string) => {
    setMoreVisible(false);
    moreNavRef.current?.navigate('More', { screen });
  };

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopColor: '#E2EAF0',
            borderTopWidth: 1,
            height: 62,
            paddingBottom: 8,
          },
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
          tabBarActiveTintColor: '#004877',
          tabBarInactiveTintColor: '#8B909A',
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeStack}
          options={{ tabBarLabel: 'Home', tabBarIcon: pngTabIcon('dashboard') }}
        />
        <Tab.Screen
          name="Careers"
          component={CareersStack}
          options={{ tabBarLabel: 'Careers', tabBarIcon: pngTabIcon('career') }}
        />
        <Tab.Screen
          name="University"
          component={UniversityStack}
          options={{ tabBarLabel: 'University', tabBarIcon: pngTabIcon('university') }}
        />
        <Tab.Screen
          name="Psychometric"
          component={PsychometricStack}
          options={{ tabBarLabel: 'Tests', tabBarIcon: pngTabIcon('psychometric') }}
        />
        <Tab.Screen
          name="More"
          component={MoreStack}
          options={{
            tabBarLabel: 'More',
            tabBarIcon: ({ color }) => <Ionicons name="grid-outline" size={23} color={color} />,
          }}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              // Don't switch tabs — open the animated sheet over the current screen instead.
              e.preventDefault();
              moreNavRef.current = navigation;
              setMoreVisible(true);
            },
          })}
        />
      </Tab.Navigator>

      <MoreSheet
        visible={moreVisible}
        onClose={() => setMoreVisible(false)}
        onSelect={handleSelect}
      />
    </View>
  );
}
