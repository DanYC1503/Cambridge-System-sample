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
import { loadCourses } from "../../storage/form_Storage";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScrollView, Swipeable } from "react-native-gesture-handler";
import { BookId, DEFAULT_BOOKS } from "@/storage/books_repo";

const FormConfig = () => {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [courses, setCourses] = useState([]);
  const [bookId, setBookId] = useState<BookId | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showBooks, setShowBooks] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [bookSearch, setBookSearch] = useState("");
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
    bookId?: BookId;
    units: string[];
  };

  const filteredBooks = Object.entries(DEFAULT_BOOKS).filter(
  ([_, book]) =>
    book.name.toLowerCase().includes(bookSearch.toLowerCase())
);
  const handleSelectBook = (id: BookId | null) => {
    setBookId(id);

    if (!id) {
      setUnits([]); // or keep existing if you prefer
      return;
    }

    const book = DEFAULT_BOOKS[id];

    setUnits(
      book.units.map((u, i) => ({
        id: `${Date.now()}-${i}`,
        value: u,
      }))
    );
  };
  const handleSave = async () => {
    if (!name.trim() || !url.trim()) {
      Alert.alert("Error", "Enter both name and URL");
      return;
    }

    const all = await loadCourses();

    const cleanedUnits = units
    .map((u) => u.value.trim())
    .filter((u) => u.length > 0);

    let updated;

    if (editingId) {
      updated = all.map((c: Course) =>
        c.id === editingId
          ? {
              ...c,
              name,
              url,
              bookId: bookId || undefined,
              units: cleanedUnits,
            }
          : c
      );
    } else {
      updated = [
        ...all,
        {
          id: Date.now().toString(),
          name,
          url,
          bookId: bookId || undefined,
          units: cleanedUnits,
        },
      ];
    }


    await saveCourses(updated);

    // reset
    setEditingId(null);
    setName("");
    setUrl("");
    setUnits([]);
    setBookId(null);

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
  const handleEdit = (course: Course) => {
    setEditingId(course.id);
    setName(course.name);
    setUrl(course.url);
    setBookId(course.bookId || null);
    const mappedUnits = (course.units || []).map((u, i) => ({
      id: Date.now().toString() + i,
      value: u,
    }));

    setUnits(mappedUnits);
  };
  const renderRightActions = (item: Course) => {
    return (
      <View style={{ flexDirection: "row" }}>
        {/* EDIT */}
        <TouchableOpacity
          onPress={() => handleEdit(item)}
          style={{
            backgroundColor: "#3b82f6",
            justifyContent: "center",
            alignItems: "center",
            width: 80,
            borderRadius: 5,
          }}
        >
          <Text style={{ color: "white" }}>Edit</Text>
        </TouchableOpacity>

        
      </View>
    );
  };
  const openNewCourseForm = () => {
    setShowForm(true);

    setEditingId(null);
    setName("");
    setUrl("");
    setBookId(null);
    setUnits([]);
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
        {/* TITLE */}
        <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>
          Añadir Curso
        </Text>

        {/* COLLAPSED */}
        {!showForm ? (
          <TouchableOpacity
            onPress={openNewCourseForm}
            style={{
              backgroundColor: "#3b82f6",
              padding: 12,
              borderRadius: 10,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>
              + Nuevo Curso
            </Text>
          </TouchableOpacity>
        ) : (
          <>
            {/* FORM */}
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

            {/* BOOK */}
            <Text style={{ marginTop: 20, fontWeight: "bold" }}>
              Book (optional)
            </Text>

            {/* Dropdown trigger */}
            <TouchableOpacity
              onPress={() => setShowBooks((prev) => !prev)}
              style={{
                marginTop: 8,
                borderWidth: 1,
                borderRadius: 8,
                padding: 12,
                backgroundColor: "#fff",
              }}
            >
              <Text>
                {bookId ? DEFAULT_BOOKS[bookId].name : "Seleccionar libro"} ▼
              </Text>
            </TouchableOpacity>

            {/* Dropdown list */}
            {showBooks && (
              <View
                style={{
                  marginTop: 5,
                  borderWidth: 1,
                  borderRadius: 8,
                  backgroundColor: "#fff",
                  maxHeight: 250,
                }}
                onStartShouldSetResponder={() => true}
              >
                {/*  SEARCH INPUT */}
                <TextInput
                  value={bookSearch}
                  onChangeText={setBookSearch}
                  placeholder="Buscar libro..."
                  style={{
                    padding: 10,
                    borderBottomWidth: 1,
                    borderColor: "#ddd",
                  }}
                />

                {/* SCROLLABLE LIST */}
                <ScrollView
                  style={{ height: 200 }}
                  keyboardShouldPersistTaps="handled"
                >
                  {filteredBooks.map(([key, book]) => (
                    <TouchableOpacity
                      key={key}
                      onPress={() => {
                        handleSelectBook(key as BookId);
                        setShowBooks(false);
                        setBookSearch("");
                      }}
                      style={{
                        padding: 12,
                        borderBottomWidth: 0.5,
                        borderColor: "#eee",
                      }}
                    >
                      <Text>{book.name}</Text>
                    </TouchableOpacity>
                  ))}

                  {bookId && (
                    <TouchableOpacity
                      onPress={() => {
                        handleSelectBook(null);
                        setShowBooks(false);
                        setBookSearch("");
                      }}
                      style={{
                        padding: 12,
                        backgroundColor: "#f87171",
                      }}
                    >
                      <Text style={{ color: "white", textAlign: "center" }}>
                        Remove Book
                      </Text>
                    </TouchableOpacity>
                  )}
                </ScrollView>
              </View>
            )}
            {/* UNITS */}
            <Text style={{ marginTop: 20, fontWeight: "bold" }}>
              Units (optional)
            </Text>

            {units.map((item, index) => (
              <View
                key={item.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 8,
                  borderWidth: 1,
                  borderRadius: 8,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                }}
              >
                <TextInput
                  value={item.value}
                  onChangeText={(text) => updateUnit(item.id, text)}
                  style={{ flex: 1 }}
                  placeholder={`UNIDAD ${index + 1}`}
                />

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
                    marginLeft: 8,
                    backgroundColor: "#ef4444",
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ color: "white", fontWeight: "bold" }}>
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
              style={{
                marginTop: 10,
                backgroundColor: "#22c1c3",
                paddingVertical: 14,
                borderRadius: 12,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "white", fontWeight: "bold" }}>
                Save Course
              </Text>
            </TouchableOpacity>

            {/* CANCEL */}
            <TouchableOpacity
              onPress={() => setShowForm(false)}
              style={{ marginTop: 10, alignItems: "center" }}
            >
              <Text style={{ color: "#6b7280" }}>Cancelar</Text>
            </TouchableOpacity>
          </>
        )}

        {/* ALWAYS SHOW */}
        <Text style={{ marginTop: 20, fontWeight: "bold" }}>
          Saved Courses:
        </Text>
      </>
        }
        renderItem={({ item }: { item: Course }) => (
        <Swipeable renderRightActions={() => renderRightActions(item)}>
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/form",
                params: {
                  url: item.url,
                  name: item.name,
                  units: JSON.stringify(item.units || []),
                },
              })
            }
            onLongPress={() =>
              Alert.alert(
                "Eliminar curso",
                `¿Borrar "${item.name}"?`,
                [
                  { text: "Cancelar", style: "cancel" },
                  {
                    text: "Borrar",
                    style: "destructive",
                    onPress: () => deleteCourse(item),
                  },
                ]
              )
            }
            delayLongPress={300} // optional, makes it feel faster
            style={{
              padding: 10,
              borderWidth: 1,
              marginTop: 10,
              borderRadius: 5,
              backgroundColor: "#fff",
            }}
          >
            <Text>{item.name}</Text>
          </TouchableOpacity>
        </Swipeable>
      )}
      />
    </KeyboardAvoidingView>
  );
};

export default FormConfig;