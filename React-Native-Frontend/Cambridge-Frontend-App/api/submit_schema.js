export const submitForm = async (url, payload) => {
  const response = await fetch(
    `http://192.168.1.34:8000/form/submit?form_url=${encodeURIComponent(url)}`,
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