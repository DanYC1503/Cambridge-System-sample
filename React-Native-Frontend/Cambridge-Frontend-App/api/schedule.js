
export const fetchSchedule = async (teacherName) => {
  try {
    const response = await fetch(
      `http://192.168.1.34:8000/download-speaking-sheet?course_teacher_name=${teacherName}`
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