import React, { useState } from "react";
import { ActivityIndicator, Alert, Button, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { fetchSchedule } from "../../api/schedule";
import { saveSchedule } from "../../storage/saveInStorage";

type ScheduleItem = {
  TEACHER: string;
  CLASS: string;
  "SPEAKING DATE": string;
  "SPEAKING HOURS": string;
  PERIOD: string;
  SPEAKING_TEACHER: string;
  "START TIME": string;
  "END TIME": string;
};

const Home = () => {
  const [teacherName, setTeacherName] = useState("");
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hidePast, setHidePast] = useState(true);
  const [teacherFilter, setTeacherFilter] = useState("");
  const [periodFilter, setPeriodFilter] = useState("");
  const today = new Date().setHours(0, 0, 0, 0);
  

  const searchSchedule = async () => {
    if (loading) return; 

    if (!teacherName.trim()) {
      Alert.alert("Error", "Please enter a teacher name.");
      return;
    }

    setLoading(true);

    try {
      const data = await fetchSchedule(teacherName);
      console.log(data);

      setSchedule(data.df);
      saveSchedule(data.df);

      Alert.alert("Schedule fetched!", `Found ${data.df.length} entries.`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        Alert.alert("Error", err.message);
      } else {
        Alert.alert("Error", "Unknown error");
      }
    } finally {
      setLoading(false);
    }
  };

  const teacherOptions = Array.from(
    new Set(schedule.map((s) => s["SPEAKING_TEACHER"]))
  ).filter(Boolean);

  const safeLower = (value: unknown) =>
  typeof value === "string" ? value.toLowerCase() : "";

  const parseDate = (d: { ["SPEAKING DATE"]: string }): number => {
        const [day, month] = d["SPEAKING DATE"].split("/").map(Number);
        return new Date(2026, month - 1, day).getTime(); // convert Date to number
    };

  const processedSchedule = schedule
    .map((item) => ({
      ...item,
      _date: parseDate(item),
      _teacher: safeLower(item["SPEAKING_TEACHER"]),
      _period: safeLower(item["PERIOD"]),
    }))
    .filter((item) => {
      if (hidePast && item._date < today) return false;

      if (
        teacherFilter &&
        !item._teacher.includes(teacherFilter.toLowerCase())
      )
        return false;

      if (
        periodFilter &&
        !item._period.includes(periodFilter.toLowerCase())
      )
        return false;

      return true;
    })
  .sort((a, b) => a._date - b._date);
  return (
    <View style={styles.container}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <TextInput
          style={[
            styles.input,
            { flex: 1, marginBottom: 0, marginRight: 10 },
          ]}
          placeholder="Teacher Name"
          value={teacherName}
          onChangeText={setTeacherName}
          onSubmitEditing={searchSchedule}
          returnKeyType="search"
        />

        <TouchableOpacity
          onPress={searchSchedule}
          disabled={loading}
          style={{
            backgroundColor: loading ? "#9ca3af" : "#3b82f6",
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 8,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={{ color: "white", fontWeight: "bold" }}>
              Search
            </Text>
          )}
        </TouchableOpacity>
      </View>
      {schedule.length > 0 && (
        <View>
          {/* FILTERS */}

          <Text style={{ marginTop: 10, fontWeight: "bold" }}>
            Filters
          </Text>

          <TouchableOpacity
            onPress={() => setHidePast((prev) => !prev)}
            style={{
              alignSelf: "flex-start",
              marginTop: 8,
              paddingVertical: 6,
              paddingHorizontal: 10,
              backgroundColor: hidePast ? "#3b82f6" : "#e5e7eb",
              borderRadius: 6,
            }}
          >
            <Text style={{ fontSize: 12, color: hidePast ? "white" : "black" }}>
              {hidePast ? "Hide past: ON" : "Hide past: OFF"}
            </Text>
          </TouchableOpacity>

          {/* Teacher filter */}
          <Text style={{ marginTop: 10, fontWeight: "bold" }}>
            Speaking Teacher
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginTop: 5 }}
          >
            {teacherOptions.map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() =>
                  setTeacherFilter((prev) => (prev === t ? "" : t))
                }
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 10,
                  borderRadius: 20,
                  marginRight: 8,
                  backgroundColor: teacherFilter === t ? "#3b82f6" : "#e5e7eb",
                }}
              >
                <Text style={{ color: teacherFilter === t ? "white" : "black" }}>
                  {t}
                </Text>
              </TouchableOpacity>
            ))}

            
          </ScrollView>

          {/* Period filter */}
          <Text style={{ marginTop: 10, fontWeight: "bold" }}>
            Period
          </Text>

          <View style={{ flexDirection: "row", marginTop: 5 }}>
            {["AM", "PM"].map((p) => (
              <TouchableOpacity
                key={p}
                onPress={() =>
                  setPeriodFilter((prev) => (prev === p ? "" : p))
                }
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  marginRight: 8,
                  borderRadius: 6,
                  backgroundColor: periodFilter === p ? "#3b82f6" : "#e5e7eb",
                }}
              >
                <Text style={{ color: periodFilter === p ? "white" : "black" }}>
                  {p}
                </Text>
              </TouchableOpacity>
            ))}

          </View>
        </View>
      )}
      
      

      {/* Display table below */}
      <ScrollView style={{ marginTop: 20 }}>
      {schedule.length === 0 ? (
        <Text>No schedule loaded.</Text>
      ) : processedSchedule.length === 0 ? (
        <Text>No results match filters.</Text>
      ) : (
        processedSchedule.map((item, index) => (
          <View key={index} style={styles.row}>
            <Text style={{ fontWeight: "bold" }}>
              {item["CLASS"]} - {item["TEACHER"]}
            </Text>

            <Text style={{ color: "#666", marginTop: 2 }}>
              {item["SPEAKING DATE"]}/2026 • {item["PERIOD"]}
            </Text>

            <Text style={{ marginTop: 4, fontSize: 13, fontWeight: "600" }}>
              {item["START TIME"]} → {item["END TIME"]}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  row: {
    marginBottom: 10,
    padding: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
});

export default Home;