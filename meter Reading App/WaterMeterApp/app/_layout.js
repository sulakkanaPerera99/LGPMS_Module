// app/_layout.js
import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      {/* Login Screen එකේ Header එක පෙන්නන්න එපා */}
      <Stack.Screen 
        name="index" 
        options={{ headerShown: false }} 
      />

      {/* Reading Screen එකේ Header එක සහ පාට */}
      <Stack.Screen 
        name="reading" 
        options={{ 
          title: 'Add Meter Reading',
          headerStyle: { backgroundColor: '#58071b' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }} 
      />

      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
    
  );
}

