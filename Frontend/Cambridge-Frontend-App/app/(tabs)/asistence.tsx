import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { loadCourses, saveCourse } from "../../storage/form_Storage";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const FormConfig = () => {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [courses, setCourses] = useState([]);
  type Unit = {
    id: string;
    value: string;
  };
const [units, setUnits] = useState<Unit[]>([]);
  const router = useRouter();
  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    const data = await loadCourses();
    setCourses(data || []);
  };
  type Course = {
    id: string;
    name: string;
    url: string;
    units: string[];
  };
  const handleSave = async () => {
    if (!name.trim() || !url.trim()) {
      Alert.alert("Error", "Enter both name and URL");
      return;
    }

    await saveCourse({
      id: Date.now().toString(),
      name,
      url,
      units: units.map(u => u.value),
    });
    setUnits([]); 
    setName("");
    setUrl("");
    loadAll();
  };
  const addUnit = () => {
    setUnits((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        value: `UNIDAD ${prev.length + 1}`,
      },
    ]);
  };
  const updateUnit = (id: string, value: string) => {
    setUnits((prev) =>
      prev.map((u) => (u.id === id ? { ...u, value } : u))
    );
  };
  const deleteUnit = (id: string) => {
    setUnits((prev) => prev.filter((u) => u.id !== id));
  };
  const saveCourses = async (courses: Course[]) => {
    await AsyncStorage.setItem("FORM_LINKS", JSON.stringify(courses));
  };
  const deleteCourse = async (courseToDelete: Course) => {
    const all = await loadCourses();

    const updated = all.filter(
      (c: Course) => c.id !== courseToDelete.id
    );

    await saveCourses(updated);
    setCourses(updated);
    Alert.alert("Eliminado", `${courseToDelete.name} fue borrado`);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={80} // important when using headers/tabs
    >
      <FlatList
        data={courses}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20 }}
        
        ListHeaderComponent={
          <>
            <Text>Course Name:</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. English"
              style={{ borderWidth: 1, marginVertical: 5, padding: 10 }}
            />

            <Text>Form URL:</Text>
            <TextInput
              value={url}
              onChangeText={setUrl}
              placeholder="Paste Google Form link"
              style={{ borderWidth: 1, marginVertical: 5, padding: 10 }}
            />
            <Text style={{ marginTop: 20, fontWeight: "bold" }}>
              Units (optional)
            </Text>

            {units.map((item, index) => (
              <View
                key={item.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 10,
                  borderWidth: 1,
                  borderRadius: 10,
                  padding: 10,
                }}
              >
                {/* TEXT INPUT */}
                <TextInput
                  value={item.value}
                  onChangeText={(text) => updateUnit(item.id, text)}
                  style={{
                    flex: 1,
                    fontWeight: "bold",
                  }}
                  placeholder={`UNIDAD ${index + 1}`}
                />

                {/* DELETE BUTTON */}
                <TouchableOpacity
                  onPress={() =>
                    Alert.alert(
                      "Eliminar unidad",
                      `¿Borrar "${item.value}"?`,
                      [
                        { text: "Cancelar", style: "cancel" },
                        {
                          text: "Borrar",
                          style: "destructive",
                          onPress: () => deleteUnit(item.id),
                        },
                      ]
                    )
                  }
                  style={{
                    marginLeft: 10,
                    backgroundColor: "#ef4444",
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
                    ×
                  </Text>
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity
              onPress={addUnit}
              style={{
                marginTop: 10,
                backgroundColor: "#3b82f6",
                padding: 10,
                borderRadius: 10,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "white", fontWeight: "bold" }}>
                + Add Unit
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              activeOpacity={0.7}
              style={{
                marginTop: 10,
                backgroundColor: "#22c1c3", // cyan-blue
                paddingVertical: 14,
                borderRadius: 12,
                alignItems: "center",
                shadowColor: "#000",
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 3, // Android shadow
              }}
            >
              <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
                Save Course
              </Text>
            </TouchableOpacity>

            <Text style={{ marginTop: 20, fontWeight: "bold" }}>
              Saved Courses:
            </Text>
          </>
        }

        renderItem={({ item }: { item: Course }) => (
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/form",
                params: {
                  url: item.url,
                  name: item.name,
                  units: JSON.stringify(item.units || []), // 🔥 important
                },
              })
            }
            onLongPress={() => {
              Alert.alert(
                "Eliminar curso",
                `¿Seguro que quieres borrar "${item.name}"?`,
                [
                  { text: "Cancelar", style: "cancel" },
                  {
                    text: "Borrar",
                    style: "destructive",
                    onPress: () => deleteCourse(item),
                  },
                ]
              );
            }}
            delayLongPress={400}
            style={{
              padding: 10,
              borderWidth: 1,
              marginTop: 10,
              borderRadius: 5,
            }}
          >
            <Text>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </KeyboardAvoidingView>
  );
};

export default FormConfig;