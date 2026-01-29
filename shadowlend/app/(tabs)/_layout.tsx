import { Tabs } from 'expo-router'
import { colors, fonts, fontSize, spacing } from '@/constants/theme'
import { View, StyleSheet, Platform } from 'react-native'
import { useTheme } from '@/features/theme'
import { TabIcon } from '@/components/ui'

export default function TabLayout() {
  const { isDark } = useTheme()

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: isDark ? '#00d4ff' : colors.primary,
        tabBarInactiveTintColor: isDark ? colors.dark.textSecondary : colors.textSecondary,
        tabBarStyle: [styles.tabBar, isDark && styles.tabBarDark],
        tabBarLabelStyle: [styles.tabBarLabel, isDark && styles.tabBarLabelDark],
        tabBarItemStyle: styles.tabBarItem,
        tabBarShowLabel: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="home-filled" focused={focused} isDark={isDark} />
          ),
        }}
      />
      <Tabs.Screen
        name="lend"
        options={{
          title: 'Lend',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="savings" focused={focused} isDark={isDark} />
          ),
        }}
      />
      <Tabs.Screen
        name="borrow"
        options={{
          title: 'Borrow',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="account-balance-wallet" focused={focused} isDark={isDark} />
          ),
        }}
      />
      <Tabs.Screen
        name="market"
        options={{
          title: 'History',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="history" focused={focused} isDark={isDark} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="person" focused={focused} isDark={isDark} />
          ),
        }}
      />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.white,
    borderTopWidth: 0,
    paddingTop: spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? spacing.lg : spacing.md,
    height: Platform.OS === 'ios' ? 88 : 72,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 12,
  },
  tabBarDark: {
    backgroundColor: colors.dark.card,
    shadowColor: '#00d4ff',
    shadowOpacity: 0.1,
  },
  tabBarLabel: {
    fontSize: fontSize.xs,
    fontFamily: fonts.semiBold,
    marginTop: 2,
  },
  tabBarLabelDark: {
    color: colors.dark.textSecondary,
  },
  tabBarItem: {
    paddingTop: 6,
  },
})
