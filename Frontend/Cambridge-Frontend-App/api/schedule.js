import { API_URL } from "../config";

export const fetchSchedule = async (teacherName) => {
  try {
    const response = await fetch(
      `${API_URL}/download-speaking-sheet?course_teacher_name=${teacherName}`
    );

    console.log("STATUS:", response.status);

    const text = await response.text();
    console.log("RAW RESPONSE:", text);

    return JSON.parse(text);
  } catch (err) {
    console.error("FETCH ERROR:", err);
    throw err;
  }
};