import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#64748b',
        tabBarIcon: ({ color, size }) => {
          const iconName =
            route.name === 'dashboard'
              ? 'grid-outline'
              : route.name === 'parcels'
                ? 'cube-outline'
                : route.name === 'drivers'
                  ? 'people-outline'
                  : 'person-outline';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="dashboard" options={{ title: 'Dashboard' }} />
      <Tabs.Screen name="parcels" options={{ title: 'Parcels' }} />
      <Tabs.Screen name="drivers" options={{ title: 'Drivers' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
