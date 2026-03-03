import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

// Imports cho các màn hình
import HomeScreen from "../screens/HomeScreen";
import DetailScreen from "../screens/DetailScreen";
import FavoritesScreen from "../screens/FavoritesScreen";
import AIChatScreen from "../screens/AIChatScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator(); // Dùng chung 1 biến Stack
const FavStack = createNativeStackNavigator(); // Tạo 1 Stack riêng cho Favorites

// Stack này chứa các màn hình cho tab Home
function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "Art Tools Store" }}
      />
      <Stack.Screen
        name="Detail"
        component={DetailScreen}
        options={{ title: "Tool Details" }}
      />
      {/* Tôi đã xóa màn hình "Favorite" khỏi HomeStack
        vì bạn đã có một tab Favorites riêng. 
        Điều này giúp tránh nhầm lẫn.
      */}
    </Stack.Navigator>
  );
}

// ----- MỚI: Tạo một Stack riêng cho tab Favorites -----
// Đây là "khung" sẽ cung cấp header cho FavoritesScreen
function FavoritesStack() {
  return (
    <FavStack.Navigator>
      <FavStack.Screen
        name="FavoritesList" // Tên màn hình bên trong Stack
        component={FavoritesScreen}
        options={{ title: "My Favorites" }} // Nút "Xóa tất cả" sẽ xuất hiện ở đây
      />
    </FavStack.Navigator>
  );
}
// ---------------------------------------------------

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "HomeStack") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "FavoritesTab") {
            iconName = focused ? "heart" : "heart-outline";
          } else if (route.name === "AI Chat") {
            iconName = focused
              ? "chatbubble-ellipses"
              : "chatbubble-ellipses-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "tomato",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="HomeStack"
        component={HomeStack} // Dùng HomeStack
        options={{ title: "Home" }}
      />
      <Tab.Screen
        name="FavoritesTab" // <-- CẬP NHẬT: Đổi tên tab
        component={FavoritesStack} // <-- CẬP NHẬT: Dùng FavoritesStack
        options={{ title: "Favorites" }}
      />
      <Tab.Screen
        name="AI Chat"
        component={AIChatScreen}
        options={{ title: "AI Chat" }}
      />
    </Tab.Navigator>
  );
}
