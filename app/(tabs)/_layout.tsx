import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import BlockingModal from "@/components/BlockingModal";

export default function TabLayout() {

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#FFA500",
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: "absolute",
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="client-order-ticket"
        options={{
          headerShown: true,
          title: "Seus Pedidos",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="clipboard-text-multiple-outline"
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="form"
        options={{
          headerShown: true,
          title: "Fazer Pedido",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="food" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          headerShown: true,
          title: "Pedidos Feitos",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="clipboard-check"
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          headerShown: true,
          title: "Relatórios",
          tabBarIcon: ({ color }) => (
            <AntDesign name="barschart" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
