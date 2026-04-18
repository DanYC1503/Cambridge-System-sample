export const fetchSchema = async (url) => {
  const response = await fetch(
    `http://192.168.1.34:8000/retrieve-form-schema?form_url=${encodeURIComponent(url)}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch schema");
  }

  return response.json();
};