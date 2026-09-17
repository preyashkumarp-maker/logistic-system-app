import { Ionicons } from '@expo/vector-icons';
import { Redirect, router } from 'expo-router';
import { BottomTabBarProps, Tabs } from 'expo-router/js-tabs';
import { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Loading } from '@/components/common/Loading';
import { COLORS } from '@/constants/colors';
import { useAuth } from '@/hooks/useAuth';
import { logoutUser } from '@/services/authService';

const TAB_ICONS: Record<string, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
  dashboard: { active: 'grid', inactive: 'grid-outline' },
  parcels: { active: 'cube', inactive: 'cube-outline' },
  drivers: { active: 'people', inactive: 'people-outline' },
  profile: { active: 'person', inactive: 'person-outline' },
};

// Routes shown directly in the bottom bar; everything else lives behind "More".
const PRIMARY_ROUTES = ['dashboard', 'parcels', 'drivers'];

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);

  const primaryRoutes = state.routes.filter((route) => PRIMARY_ROUTES.includes(route.name));
  const moreRoutes = state.routes.filter((route) => !PRIMARY_ROUTES.includes(route.name));
  const isMoreActive = moreRoutes.some((route) => state.routes[state.index].key === route.key);

  const navigateTo = (routeName: string) => {
    setMenuVisible(false);
    navigation.navigate(routeName);
  };

  const handleLogout = async () => {
    setMenuVisible(false);
    await logoutUser();
    router.replace('/login');
  };

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 12) }]} pointerEvents="box-none">
      <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <Pressable style={styles.overlay} onPress={() => setMenuVisible(false)}>
          <View style={[styles.menu, { marginBottom: Math.max(insets.bottom, 12) + 78 }]}>
            <View style={styles.menuHeader}>
              <View style={styles.menuAvatar}>
                <Text style={styles.menuAvatarText}>{(profile?.name ?? 'U').charAt(0).toUpperCase()}</Text>
              </View>
              <View>
                <Text style={styles.menuName}>{profile?.name ?? 'User'}</Text>
                <Text style={styles.menuEmail}>{profile?.email ?? ''}</Text>
              </View>
            </View>
            <View style={styles.menuDivider} />
            {moreRoutes.map((route) => {
              const { options } = descriptors[route.key];
              const label = (options.title ?? route.name) as string;
              const icons = TAB_ICONS[route.name] ?? TAB_ICONS.profile;
              return (
                <Pressable key={route.key} style={styles.menuItem} onPress={() => navigateTo(route.name)}>
                  <Ionicons name={icons.inactive} size={19} color={COLORS.text} />
                  <Text style={styles.menuItemText}>{label}</Text>
                </Pressable>
              );
            })}
            <Pressable style={styles.menuItem} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={19} color={COLORS.error} />
              <Text style={[styles.menuItemText, { color: COLORS.error }]}>Logout</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      <View style={styles.bar}>
        {primaryRoutes.map((route) => {
          const { options } = descriptors[route.key];
          const label = (options.title ?? route.name) as string;
          const routeIndex = state.routes.findIndex((r) => r.key === route.key);
          const isFocused = state.index === routeIndex;
          const icons = TAB_ICONS[route.name] ?? TAB_ICONS.dashboard;

          const handlePress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={handlePress}
              style={styles.tabItem}
              android_ripple={{ color: COLORS.primaryLight, borderless: true, radius: 32 }}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
            >
              <View style={[styles.iconPill, isFocused && styles.iconPillActive]}>
                <Ionicons name={isFocused ? icons.active : icons.inactive} size={20} color={isFocused ? '#fff' : COLORS.textSubtle} />
              </View>
              <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]} numberOfLines={1}>
                {label}
              </Text>
            </Pressable>
          );
        })}

        <Pressable
          onPress={() => setMenuVisible(true)}
          style={styles.tabItem}
          android_ripple={{ color: COLORS.primaryLight, borderless: true, radius: 32 }}
          accessibilityRole="button"
        >
          <View style={[styles.iconPill, isMoreActive && styles.iconPillActive]}>
            <Ionicons name="ellipsis-horizontal" size={20} color={isMoreActive ? '#fff' : COLORS.textSubtle} />
          </View>
          <Text style={[styles.tabLabel, isMoreActive && styles.tabLabelActive]}>More</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function AppLayout() {
  const { user, loading } = useAuth();

  if (loading) return <Loading label="Checking session" />;
  if (!user) return <Redirect href="/login" />;

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="dashboard" options={{ title: 'Dashboard' }} />
      <Tabs.Screen name="parcels" options={{ title: 'Parcels' }} />
      <Tabs.Screen name="drivers" options={{ title: 'Drivers' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
  },
  bar: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 1,
        shadowRadius: 20,
      },
      android: { elevation: 10 },
    }),
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    gap: 3,
  },
  iconPill: {
    width: 40,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPillActive: {
    backgroundColor: COLORS.primary,
  },
  tabLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    color: COLORS.textSubtle,
  },
  tabLabelActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  menu: {
    width: '90%',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 10,
    ...Platform.select({
      ios: { shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 1, shadowRadius: 20 },
      android: { elevation: 12 },
    }),
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
  },
  menuAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuAvatarText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  menuName: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  menuEmail: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  menuDivider: { height: 1, backgroundColor: COLORS.border, marginVertical: 4 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  menuItemText: { fontSize: 14.5, fontWeight: '600', color: COLORS.text },
});



