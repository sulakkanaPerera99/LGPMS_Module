import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons'; // අයිකන් සඳහා

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#58071b', // Active වෙලා තියෙනකොට පාට (ඔයාගේ තීම් කලර් එක)
      tabBarInactiveTintColor: 'gray',  // Inactive පාට
      headerShown: false, // උඩින් එන Header එක අයින් කරනවා (අපිට Custom Header තියෙන නිසා)
      tabBarStyle: {
        height: 60,
        paddingBottom: 10,
        paddingTop: 10,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
      }
    }}>

       {/* 1. Progress Screen Tab */}
      <Tabs.Screen
        name="progress"
        options={{
          title: "History / Progress",
          tabBarIcon: ({ color }) => <FontAwesome name="list-alt" size={24} color={color} />,
        }}
      /> 
      
      {/* 2. Reading Screen Tab */}
      <Tabs.Screen
        name="reading"
        options={{
          title: "Add Reading",
          tabBarIcon: ({ color }) => <FontAwesome name="plus-square" size={24} color={color} />,
        }}
      />

    </Tabs>
  );
}