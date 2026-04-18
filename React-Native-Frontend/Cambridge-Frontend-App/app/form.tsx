import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  Button,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { fetchSchema } from "../api/schema";
import DateTimePicker from "@react-native-community/datetimepicker";
import { submitForm } from "../api/submit_schema";

export default function FormScreen() {
  const { url, name } = useLocalSearchParams();
  const router = useRouter();

  const [schema, setSchema] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 📅 Date
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  // 🧑 Students
  const [studentValues, setStudentValues] = useState<{ [key: string]: string }>({});

  // 📝 Fields
  const [fieldValues, setFieldValues] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const loadSchema = async () => {
      try {
        const data = await fetchSchema(url as string);
        console.log("SCHEMA:", data);
        setSchema(data);
      } catch (err) {
        console.error(err);
        Alert.alert("Error", "Failed to load schema");
      } finally {
        setLoading(false);
      }
    };

    loadSchema();
  }, []);

  const handleStudentSelect = (student: string, value: string) => {
    setStudentValues((prev) => ({
      ...prev,
      [student]: value,
    }));
  };

  const handleFieldChange = (field: string, value: string) => {
    setFieldValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (loading || !schema) {
    return <ActivityIndicator style={{ marginTop: 50 }} />;
  }
  const handleSubmit = async () => {
    try {
      const totalStudents = Object.keys(schema.students).length;
      const filledStudents = Object.keys(studentValues).length;

      if (filledStudents !== totalStudents) {
        Alert.alert("Error", "All students must have a value");
        return;
      }

      const payload = {
        fecha: date.toISOString().split("T")[0],
        fields: fieldValues,
        students: studentValues,
      };

      await submitForm(url as string, payload);

      Alert.alert("Success", "Form submitted!");
      router.back();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Submission failed");
    }
  };
  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
      keyboardShouldPersistTaps="handled"
    >
      {/* TITLE */}
      <Text style={{ fontSize: 20, fontWeight: "bold" }}>{name}</Text>

      {/* ACTION BUTTONS */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 10,
        }}
      >
        <Button title="Back" onPress={() => router.back()} />

        <Button title="Submit" onPress={handleSubmit} />
      </View>

      {/* 📅 DATE */}
      <Text style={{ marginTop: 20, fontWeight: "bold" }}>Fecha</Text>
      <TouchableOpacity onPress={() => setShowPicker(true)}>
        <Text style={{ padding: 10, borderWidth: 1, marginTop: 5 }}>
          {date.toDateString()}
        </Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowPicker(false);
            if (selectedDate) setDate(selectedDate);
          }}
        />
      )}

      {/* 🧑 STUDENTS */}
      <Text style={{ marginTop: 20, fontWeight: "bold" }}>
        Lista Estudiantes
      </Text>

      {Object.keys(schema.students).map((student) => (
        <View key={student} style={{ marginTop: 15 }}>
          <Text>{student}</Text>

          <View style={{ flexDirection: "row", marginTop: 5 }}>
            {["ASISTENCIA", "INASISTENCIA", "ATRASO"].map((option) => (
              <TouchableOpacity
                key={option}
                onPress={() => handleStudentSelect(student, option)}
                style={{
                  padding: 8,
                  borderWidth: 1,
                  marginRight: 5,
                  backgroundColor:
                    studentValues[student] === option ? "#ccc" : "#fff",
                }}
              >
                <Text>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      {/* 📝 FIELDS */}
      <Text style={{ marginTop: 20, fontWeight: "bold" }}>Campos</Text>

      {Object.keys(schema.fields).map((field) => (
        <View key={field} style={{ marginTop: 10 }}>
          <Text>{field}</Text>
          <TextInput
            placeholder={`Enter ${field}`}
            value={fieldValues[field] || ""}
            onChangeText={(text) => handleFieldChange(field, text)}
            style={{
              borderWidth: 1,
              padding: 8,
              marginTop: 5,
            }}
          />
        </View>
      ))}
    </ScrollView>
  );
}