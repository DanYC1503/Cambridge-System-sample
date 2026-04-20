import { Tabs } from "expo-router";
import { Image } from "react-native";

const AppTabs = () => {
  return (
    <Tabs>
      <Tabs.Screen
        name="home"
        options={{
          headerShown: true,
          headerTitleAlign: "center",
          headerTitle: "Speaking Schedule",
          tabBarIcon: ({ color, size }) => (
            <Image
              source={require("../../assets/img_tabs/speak.png")}
              style={{ width: size, height: size, tintColor: color }}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="asistence"
        options={{
          headerShown: true,
          headerTitleAlign: "center",
          headerTitle: "Asistence",
          tabBarIcon: ({ color, size }) => (
            <Image
              source={require("../../assets/img_tabs/asistance.png")}
              style={{ width: size, height: size, tintColor: color }}
            />
          ),
        }}
      />
    </Tabs>
  );
};

export default AppTabs;