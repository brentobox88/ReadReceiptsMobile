// App.tsx - ReadReceipts with Authentication
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { SubscriptionProvider } from './src/context/SubscriptionContext';
import {
  CameraScreen,
  ReceiptsListScreen,
  ProfileScreen,
  SplashScreen,
  ConfirmationScreen,
  DashboardScreen,
  SubscriptionScreen,
  AuthScreen,
  ExportScreen,
  ReportsScreen,
  BatchConfirmationScreen,
} from './src/screens';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;
          if (route.name === 'Dashboard') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Scan') {
            iconName = focused ? 'camera' : 'camera-outline';
          } else if (route.name === 'Receipts') {
            iconName = focused ? 'receipt' : 'receipt-outline';
          } else if (route.name === 'Export') {
            iconName = focused ? 'download' : 'download-outline';
          } else if (route.name === 'Subscription') {
            iconName = focused ? 'star' : 'star-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Reports') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else {
            iconName = 'circle';
          }
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          height: 70,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: '#4CAF50',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: 'Summary', tabBarLabel: 'Summary' }}
      />
      <Tab.Screen
        name="Scan"
        component={CameraScreen}
        options={{ title: 'Scan Receipt', tabBarLabel: 'Scan' }}
      />
      <Tab.Screen
        name="Receipts"
        component={ReceiptsListScreen}
        options={{ title: 'My Receipts', tabBarLabel: 'Receipts' }}
      />
      <Tab.Screen
        name="Export"
        component={ExportScreen}
        options={{ title: 'Export', tabBarLabel: 'Export' }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportsScreen}
        options={{ title: 'Reports', tabBarLabel: 'Reports' }}
      />
      <Tab.Screen
        name="Subscription"
        component={SubscriptionScreen}
        options={{ title: 'Subscription', tabBarLabel: 'Upgrade' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profile', tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleAuthSuccess = (userData: any) => {
    console.log('Auth Success:', userData);
    setIsAuthenticated(true);
  };

  if (isLoading) {
    return <SplashScreen onFinish={() => setIsLoading(false)} />;
  }

  if (!isAuthenticated) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <SubscriptionProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: '#4CAF50',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen
            name="MainTabs"
            component={MainTabs}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Confirmation"
            component={ConfirmationScreen}
            options={{
              title: 'Review Receipt',
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            name="BatchConfirmation"
            component={BatchConfirmationScreen}
            options={{ title: "Batch Upload", presentation: "modal" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SubscriptionProvider>
  );
}



