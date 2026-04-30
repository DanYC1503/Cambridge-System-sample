import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  Button,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { fetchSchema } from "../api/schema";
import DateTimePicker from "@react-native-community/datetimepicker";
import { submitForm } from "../api/submit_schema";
import { BookId, DEFAULT_BOOKS } from "@/storage/books_repo";

export default function FormScreen() {
  const { url, name,  units, bookId } = useLocalSearchParams();
  
  
  const book = bookId ? DEFAULT_BOOKS[bookId as BookId] : null;
  const bookName = book?.name;

  const router = useRouter();

  const [schema, setSchema] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  //  Date
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  // Students
  const [studentValues, setStudentValues] = useState<{ [key: string]: string }>({});

  // Fields
  const [fieldValues, setFieldValues] = useState<{ [key: string]: string }>({});

  type Mode = "none" | "report" | "plan";

  const [mode, setMode] = useState<Mode>("none");

  const parsedUnits: string[] = units ? JSON.parse(units as string) : [];

  const [showUnitDropdown, setShowUnitDropdown] = useState(false);
  const isBookField = (field: string) => {
    const f = field.toLowerCase();
    return (
      f.includes("pagina") ||
      f.includes("página") ||
      f.includes("libro") ||
      f.includes("texto")
    );
  };
  const getSuggestedValue = (field: string) => {
    if (isBookField(field) && bookName) {
      return `${bookName}; `;
    }
    return "";
  };
  const buildInitialFields = (defaultValue: string) => {
    const result: { [key: string]: string } = {};

    Object.keys(schema.fields).forEach((field) => {
      const suggested = getSuggestedValue(field);

      result[field] = suggested || defaultValue;
    });

    return result;
  };
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
  
  useEffect(() => {
    if (!schema) return;

    const isModeActive = mode === "report" || mode === "plan";

    // Students
    if (isModeActive) {
      const allAbsent: { [key: string]: string } = {};
      Object.keys(schema.students).forEach((student) => {
        allAbsent[student] = "INASISTENCIA";
      });
      setStudentValues(allAbsent);
    } else {
      // clean state
      setStudentValues({});
    }

    // Fields (same logic as before)
    const defaultValue =
      mode === "report"
        ? "REPORTE"
        : mode === "plan"
        ? "PLANIFICACION"
        : "";

    const initialFields: { [key: string]: string } = {};

    Object.keys(schema.fields).forEach((field) => {
      if (isModeActive) {
        initialFields[field] = defaultValue;
      } else {
        const suggested = getSuggestedValue(field);
        initialFields[field] = suggested || "";
      }
    });

    setFieldValues(initialFields);

  }, [mode, schema, bookName]);

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
  const formatLocalDate = (date: { getFullYear: () => any; getMonth: () => number; getDate: () => any; }) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };
  const handleSubmit = async () => {
    try {
      console.log("Submitting to:", url);
      
      if (!url) {
        Alert.alert("Error", "Missing form URL");
        return;
      }
      const totalStudents = Object.keys(schema.students).length;
      const filledStudents = Object.keys(studentValues).length;

      if (filledStudents !== totalStudents) {
        Alert.alert("Error", "All students must have a value");
        return;
      }

      const requiredFields = Object.keys(schema.fields).filter((field) => {
        const normalized = normalize(field);

        const isOptional =
          normalized.includes("DEBER") ||
          normalized.includes("OBSERV");

        return !isOptional;
      });

      const missingFields = requiredFields.filter(
        (field) => !fieldValues[field]?.trim()
      );

      if (missingFields.length > 0) {
        Alert.alert("Error", "Fill all required fields");
        return;
      }

      // Clean fields (no forced formatting anymore)
      const cleanedFields: { [key: string]: string } = {};

      Object.keys(fieldValues).forEach((field) => {
        const value = fieldValues[field] || "";
        cleanedFields[field] = value.trim();
      }); 
      
      const payload = {
        fecha: formatLocalDate(date),
        fields: cleanedFields,
        students: studentValues,
      };
      console.log("PAYLOAD:", JSON.stringify(payload, null, 2));
      await submitForm(url as string, payload);

      Alert.alert("Success", "Form submitted!");
      router.back();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Submission failed");
    }
  };
  const normalize = (text: string) =>
    text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase();

  const isFieldRequired = (field: string) => {
    const normalized = normalize(field);

    const isOptional =
      normalized.includes("DEBER") ||
      normalized.includes("OBSERV");

    return !isOptional;
  };
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 , backgroundColor: "#ffffff"}}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={80} // adjust if needed
    >
      <ScrollView
        style={{ flex: 1 , backgroundColor: "#f2fafd"}}
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
            alignItems: "center",
            marginTop: 10,
          }}
        >
          {/* LEFT SIDE: MODES */}
          <View style={{ flexDirection: "row", gap: 8 }}>
            
            {/* REPORT */}
            <Pressable
              onPress={() => setMode(mode === "report" ? "none" : "report")}
              style={({ pressed }) => ({
                backgroundColor: mode === "report" ? "#3b82f6" : "#ccc",
                paddingVertical: 8,
                paddingHorizontal: 14,
                borderRadius: 20,
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Text style={{ color: "white", fontWeight: "bold" }}>
                Reporte
              </Text>
            </Pressable>

            {/* PLANIFICACION */}
            <Pressable
              onPress={() => setMode(mode === "plan" ? "none" : "plan")}
              style={({ pressed }) => ({
                backgroundColor: mode === "plan" ? "#10b981" : "#ccc",
                paddingVertical: 8,
                paddingHorizontal: 14,
                borderRadius: 20,
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Text style={{ color: "white", fontWeight: "bold" }}>
                Planificación
              </Text>
            </Pressable>

          </View>

          {/* RIGHT SIDE: SUBMIT */}
          <Pressable
            onPress={handleSubmit}
            style={({ pressed }) => ({
              backgroundColor: "#22c55e",
              paddingVertical: 10,
              paddingHorizontal: 18,
              borderRadius: 12,
              transform: [{ scale: pressed ? 0.96 : 1 }],
              opacity: pressed ? 0.9 : 1,
            })}
          >
            <Text style={{ color: "white", fontWeight: "bold", fontSize: 15 }}>
              Submit
            </Text>
          </Pressable>
        </View>

        {/* DATE */}
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

        {/* STUDENTS */}
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
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    marginRight: 8,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor:
                      studentValues[student] === option ? "#3b82f6" : "#ccc",
                    backgroundColor:
                      studentValues[student] === option ? "#dbeafe" : "#fff",
                  }}
                >
                  <Text
                    style={{
                      color:
                        studentValues[student] === option ? "#1d4ed8" : "#333",
                      fontWeight: "500",
                    }}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* FIELDS */}
        <Text style={{ marginTop: 20, fontWeight: "bold" }}>Campos</Text>

        {Object.keys(schema.fields).map((field) => {
          const isUnidad = field.toUpperCase().includes("UNIDAD");
        if (isUnidad && parsedUnits.length > 0) {
          return (
            <View key={field} style={{ marginTop: 10 }}>
              <Text>
                {field}
                {isFieldRequired(field) && (
                  <Text style={{ color: "red" }}> *</Text>
                )}
              </Text>

              {/* TEXT INPUT (always editable) */}
              <TextInput
                value={fieldValues[field] || ""}
                onChangeText={(text) => handleFieldChange(field, text)}
                placeholder="Type or select Unidad"
                placeholderTextColor="#9ca3af"
                style={{
                  borderWidth: 1,
                  padding: 10,
                  marginTop: 5,
                  borderRadius: 8,
                  backgroundColor: "#fff",
                }}
                onFocus={() => setShowUnitDropdown(true)}
              />

              {/* DROPDOWN SUGGESTIONS */}
              {showUnitDropdown && (
                <View
                  style={{
                    borderWidth: 1,
                    borderTopWidth: 0,
                    borderRadius: 8,
                    backgroundColor: "#f9fafb",
                  }}
                >
                  {parsedUnits.map((unit, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => {
                        handleFieldChange(field, unit);
                        setShowUnitDropdown(false);
                      }}
                      style={{
                        padding: 10,
                        borderBottomWidth: index !== parsedUnits.length - 1 ? 1 : 0,
                      }}
                    >
                      <Text>{unit}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          );
        }
          // default fields
          return (
            <View key={field} style={{ marginTop: 10 }}>
              <Text>
                {field}
                {isFieldRequired(field) && (
                  <Text style={{ color: "red" }}> *</Text>
                )}
              </Text>
              <TextInput
                placeholder={`Enter ${field}`}
                placeholderTextColor="#7c7c7e"
                value={
                  fieldValues[field] || ""
                }
                onChangeText={(text) => handleFieldChange(field, text)}
                style={{
                  borderWidth: 1,
                  padding: 8,
                  marginTop: 5,
                  color: "#111827",
                  backgroundColor: "#fff",
                  borderRadius: 6,
                }}
              />
            </View>
          );
        })}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}