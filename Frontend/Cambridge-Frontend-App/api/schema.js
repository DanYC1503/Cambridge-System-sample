import { API_URL } from "../config";

export const fetchSchema = async (url) => {
  const response = await fetch(
    `${API_URL}/retrieve-form-schema?form_url=${encodeURIComponent(url)}`
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.log("Schema error:", errorText);

    throw new Error("Failed to retrieve form schema");
  }

  return response.json();
};