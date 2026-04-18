import { API_URL } from "../config";

export const fetchSchema = async (url) => {
  const response = await fetch(
    `${API_URL}/retrieve-form-schema?form_url=${encodeURIComponent(url)}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch schema");
  }

  return response.json();
};