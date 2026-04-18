import React, { useState } from "react";
import { Alert, Button, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { fetchSchedule } from "../../api/schedule";
import { saveSchedule } from "../../storage/saveInStorage";

const Home = () => {
  const [teacherName, setTeacherName] = useState("");
  const [schedule, setSchedule] = useState([]); // store schedule

  const searchSchedule = async () => {
    if (!teacherName.trim()) {
      Alert.alert("Error", "Please enter a teacher name.");
      return;
    }

    try {
      const data = await fetchSchedule(teacherName);
      console.log(data);
      setSchedule(data.df); // store results
      saveSchedule(data.df);
      Alert.alert("Schedule fetched!", `Found ${data.df.length} entries.`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        Alert.alert("Error", err.message);
      } else {
        Alert.alert("Error", "Unknown error");
      }
    }
  };
  // inside your component
    const sortedSchedule = [...schedule].sort((a, b) => {
    const parseDate = (d: { ["SPEAKING DATE"]: string }): number => {
        const [day, month] = d["SPEAKING DATE"].split("/").map(Number);
        return new Date(2026, month - 1, day).getTime(); // convert Date to number
    };
    return parseDate(a) - parseDate(b);
    });

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Enter Teacher Name:</Text>
      <TextInput
        style={styles.input}
        placeholder="Teacher Name"
        value={teacherName}
        onChangeText={setTeacherName}
      />
      <Button title="Search Schedule" onPress={searchSchedule} />

      {/* Display table below */}
      <ScrollView style={{ marginTop: 20 }}>
        {sortedSchedule.length === 0 ? (
            <Text>No schedule loaded.</Text>
        ) : (
            sortedSchedule.map((item, index) => (
            <View key={index} style={styles.row}>
                <Text>
                {item["TEACHER"]} - {item["CLASS"]} - {item["SPEAKING DATE"]}/2026 - {item["SPEAKING HOURS"]} ({item["PERIOD"]}) - 
                ({item["SPEAKING_TEACHER"]} - ({item["START TIME"]}) - ({item["END TIME"]}))
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
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 6,
  },
});

export default Home;