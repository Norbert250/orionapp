import axios from "axios";

export const analyzeMpesa = async (file: File, password: string, id?: string) => {
  // generate fake ID if not provided
  const fakeId = id || `fake-id-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

  const formData = new FormData();
  formData.append("file", file, file.name);
  formData.append("password", password);
  formData.append("id", fakeId);

  await axios.post(
    "https://mpesaservice.onrender.com/analyzempesa", 
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );

  // ✅ return just an okay flag
  return "ok";
};
