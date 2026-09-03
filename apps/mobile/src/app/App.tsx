import '../global.css'
import { Text, View } from "react-native";
import { useFonts } from 'expo-font'


export default function App() {
  const [fontsLoaded] = useFonts({
    'Roboto-Regular': require('../../assets/fonts/roboto/Roboto-Regular.ttf'),
    'Roboto-Medium': require('../../assets/fonts/roboto/Roboto-Medium.ttf'),
    'Roboto-SemiBold': require('../../assets/fonts/roboto/Roboto-SemiBold.ttf'),
    'Roboto-Bold': require('../../assets/fonts/roboto/Roboto-Bold.ttf')
  })

  if (!fontsLoaded) return null;

  return (
    <View className='h-full items-center justify-center'>
      <Text className='text-indigo-600 text-4xl font-roboto-bold'>Na Régua</Text>
    </View>
  )
}