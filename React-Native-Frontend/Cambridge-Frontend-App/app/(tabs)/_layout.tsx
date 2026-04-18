import { Tabs } from "expo-router";

const AppTabs = () => {
  return (
    <Tabs>
      <Tabs.Screen name="home" options={{ headerShown: true, headerTitleAlign: "center" , headerTitle:"Speaking Schedule"}} />
      <Tabs.Screen name="asistence" options={{ headerShown: true, headerTitleAlign: "center" , headerTitle:"Asistence"}} />
    </Tabs>
  );
};

export default AppTabs;