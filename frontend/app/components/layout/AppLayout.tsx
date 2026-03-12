import React, { ReactNode } from 'react';
import { StyleSheet, View, SafeAreaView, StatusBar, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';
import colors from '../../constants/colors';

interface AppLayoutProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, style }) => {
  const theme = useTheme();
  const isDarkMode = theme.dark;

  return (
    <SafeAreaView 
      style={[
        styles.container, 
        { backgroundColor: isDarkMode ? colors.darkBackground : colors.background },
        style
      ]}
    >
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
        backgroundColor={isDarkMode ? colors.darkBackground : colors.background}
      />
      <View style={styles.content}>
        {children}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
});

export default AppLayout; 