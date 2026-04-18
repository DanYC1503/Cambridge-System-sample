import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "FORM_LINKS";

export const saveCourse = async (course) => {
  const existing = await loadCourses();

  const updated = [...existing, course];

  await AsyncStorage.setItem(KEY, JSON.stringify(updated));
};

export const loadCourses = async () => {
  const data = await AsyncStorage.getItem(KEY);
  return data ? JSON.parse(data) : [];
};

export const clearCourses = async () => {
  await AsyncStorage.removeItem(KEY);
};