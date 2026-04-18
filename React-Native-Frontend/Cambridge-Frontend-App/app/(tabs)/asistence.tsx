import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { loadCourses, saveCourse } from "../../storage/form_Storage";
import { useRouter } from "expo-router";

const FormConfig = () => {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [courses, setCourses] = useState([]);
  const router = useRouter();
  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    const data = await loadCourses();
    setCourses(data || []);
  };
  type Course = {
    name: string;
    url: string;
  };
  const handleSave = async () => {
    if (!name.trim() || !url.trim()) {
      Alert.alert("Error", "Enter both name and URL");
      return;
    }

    await saveCourse({ name, url });
    setName("");
    setUrl("");
    loadAll();
  };
  return (
    <View style={{ padding: 20 }}>
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

      <Button title="Save Course" onPress={handleSave} />

      <Text style={{ marginTop: 20, fontWeight: "bold" }}>
        Saved Courses:
      </Text>

      <FlatList
      data={courses}
      keyExtractor={(item, index) => index.toString()}
      renderItem={({ item }: { item: Course }) => (
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/form",
              params: {
                url: item.url,
                name: item.name,
              },
            })
          }
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
    </View>
  );
};

export default FormConfig;