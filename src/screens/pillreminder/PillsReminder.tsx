import React, {useEffect} from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import PillReminderCalendarScreen from './PillReminderCalendar';
import PillReminderDetails from './PillReminderDetails';
import {themeColors} from '../../theme/colors';

const Tab = createMaterialTopTabNavigator();

const PillsReminderScreen = ({navigation, route}) => {
  // When using deep linking, route.params will include initialTab (parsed from URL)
  const {initialTab} = route.params || {};

  console.log('PillsReminder screen mounted with params:', route.params);

  useEffect(() => {
    if (initialTab === 'Details') {
      // Ensure navigation happens after component is mounted with a slightly longer delay
      console.log('Will navigate to Details tab');

      // Use multiple attempts with increasing timeouts to ensure tab selection works
      const attemptNavigation = (attempt = 1) => {
        if (attempt > 3) return;

        setTimeout(() => {
          console.log(`Attempt ${attempt}: Navigating to Details tab`);
          navigation.navigate('Details');

          // Try again with longer timeout if needed
          if (attempt < 3) {
            attemptNavigation(attempt + 1);
          }
        }, attempt * 200);
      };

      attemptNavigation();
    }
  }, [initialTab, navigation]);

  return (
    <Tab.Navigator
      // Default to Details tab when coming from notification
      initialRouteName={initialTab === 'Details' ? 'Details' : 'Calendar'}
      screenOptions={{
        tabBarActiveTintColor: themeColors.primary,
        tabBarLabelStyle: {fontWeight: 'bold', fontSize: 15},
        tabBarIndicatorStyle: {backgroundColor: themeColors.primary, height: 5},
      }}>
      <Tab.Screen
        name="Calendar"
        component={PillReminderCalendarScreen}
        options={{tabBarLabel: 'Calendar'}}
      />
      <Tab.Screen
        name="Details"
        component={PillReminderDetails}
        options={{tabBarLabel: 'Meds Reminders'}}
      />
    </Tab.Navigator>
  );
};

export default PillsReminderScreen;
