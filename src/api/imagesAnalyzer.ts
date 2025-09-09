// import axios from "axios";

// export const uploadImages = async (files: File[]) => {
//   const formData = new FormData();

//   // 🔹 append each file under "images"
//   files.forEach((file) => {
//     formData.append("images", file, file.name);
//   });

//   const response = await axios.post(
//     "https://gps-fastapi-upload.onrender.com/upload-images",
//     formData,
//     {
//       headers: {
//         "Content-Type": "multipart/form-data",
//       },
//     }
//   );

//   // Save the JSON response to a file
//   const blob = new Blob([JSON.stringify(response.data, null, 2)], {
//     type: "application/json",
//   });
//   const url = URL.createObjectURL(blob);
//   const link = document.createElement("a");
//   link.href = url;
//   link.download = `images-analysis-${Date.now()}.json`;
//   link.click();

//   return response.data;
// };



import axios from "axios";

export const uploadImages = async (files: File[]) => {
  // --- API 1: gps-fastapi-upload ---
  const formData1 = new FormData();
  files.forEach((file) => {
    formData1.append("images", file, file.name);
  });

  const gpsPromise = axios.post(
    "https://gps-fastapi-upload.onrender.com/upload-images",
    formData1,
    { headers: { "Content-Type": "multipart/form-data" } }
  );

  // --- API 2: analysis/create_batch ---
  const formData2 = new FormData();
  formData2.append("user_id", "user123"); // fake user_id
  files.forEach((file) => {
    formData2.append("files", file, file.name);
  });

  const analysisPromise = axios.post(
    "http://157.245.20.199:8000/analysis/create_batch",
    formData2,
    { headers: { "Content-Type": "multipart/form-data" } }
  );

  // Run both in parallel
  await Promise.all([gpsPromise, analysisPromise]);

  // ✅ Just return an okay flag
  return "ok";
};
