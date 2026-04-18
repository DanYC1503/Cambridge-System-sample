import { API_URL } from "../config";

export const submitForm = async (url, payload) => {
  const response = await fetch(
    `${API_URL}/form/submit?form_url=${encodeURIComponent(url)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to submit form");
  }

  return response.json();
};