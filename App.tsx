import { ThemeProvider } from 'react-native-magnus';
import { SafeAreaView, StyleSheet } from 'react-native';
import Home from './screens/Home';
import { useFonts, Righteous_400Regular } from '@expo-google-fonts/righteous';
import AppLoading from 'expo-app-loading';

const theme = {
  colors: {
    primaryBlue: '#6C7BFF',
  },
  fontSize: {
    "7xl": 42,
    "8xl": 80,
  },
  components: {
    Text: {
      fontFamily: 'Righteous_400Regular',
    }
  }
}


export default function App() {
  let [fontsLoaded] = useFonts({
    Righteous_400Regular
  });

  if (!fontsLoaded) {
    return <AppLoading />;
  }

  return (
    <ThemeProvider theme={theme}>
      <SafeAreaView style={styles.container}>
        <Home />
      </SafeAreaView>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2D2D2D',
    height: '100%',
  },
});
