import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@schedule";
const SHEET_ID_KEY = "@sheet_id";

const saveSchedule = async (data) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save schedule:", e);
  }
};

const loadSchedule = async () => {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    return json ? JSON.parse(json) : null;
  } catch (e) {
    console.error("Failed to load schedule:", e);
    return null;
  }
};

const clearSchedule = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error("Failed to clear schedule:", e);
  }
};
const saveSheetId = async (id) => {
  try {
    await AsyncStorage.setItem(SHEET_ID_KEY, id);
  } catch (e) {
    console.error("Failed to save sheet id:", e);
  }
};

const loadSheetId = async () => {
  try {
    return await AsyncStorage.getItem(SHEET_ID_KEY);
  } catch (e) {
    console.error("Failed to load sheet id:", e);
    return null;
  }
};
export { saveSchedule, loadSchedule, clearSchedule, saveSheetId, loadSheetId };