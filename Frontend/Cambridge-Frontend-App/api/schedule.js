import { API_URL } from "../config";

export const fetchSchedule = async (teacherName) => {
  try {
    const response = await fetch(
      `${API_URL}/download-speaking-sheet?course_teacher_name=${encodeURIComponent(teacherName)}`
    );

    console.log("STATUS:", response.status);

    const data = await response.json();

    console.log("RESPONSE:", data);

    if (!response.ok) {
      throw new Error(
        data.error || "Failed to retrieve speaking schedule."
      );
    }

    return data.df;
  } catch (err) {
    console.error("FETCH ERROR:", err);
    throw err;
  }
};