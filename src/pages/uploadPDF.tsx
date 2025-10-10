import React, { useState } from "react";
import api from "../api/axios";

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<any[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !password) {
      setError("Please provide both PDF file and password");
      return;
    }

    setLoading(true);
    setError("");
    setData([]);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("password", password);

    try {
      const response = await api.post(
        "/decrypt-parse-statement",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      // Response contains parsed JSON
      setData(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to decrypt/parse PDF");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadExcel = () => {
    if (data.length === 0) return;

    // Convert JSON to CSV
    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(","),
      ...data.map(row => headers.map(h => `"${row[h]}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bank_statement.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-foreground">
        Decrypt & Parse Bank Statement PDF
      </h1>
      <form
        onSubmit={handleSubmit}
        className="max-w-lg mx-auto bg-card p-6 rounded-2xl shadow-sm border border-border"
      >
        <div className="mb-4">
          <label className="block mb-2 font-semibold text-card-foreground">Encrypted PDF File</label>
          <input type="file" accept="application/pdf" onChange={handleFileChange} className="w-full" />
        </div>
        <div className="mb-4">
          <label className="block mb-2 font-semibold text-card-foreground">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-input rounded-lg p-2 bg-background focus:ring-2 focus:ring-ring focus:border-ring"
          />
        </div>
        <button
          type="submit"
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Processing..." : "Decrypt & Parse"}
        </button>
      </form>

      {error && <p className="text-destructive text-center mt-4">{error}</p>}

      {data.length > 0 && (
        <div className="mt-6 max-w-4xl mx-auto overflow-x-auto">
          <button
            onClick={handleDownloadExcel}
            className="mb-4 bg-chart-2 text-white px-4 py-2 rounded-lg hover:bg-chart-2/90"
          >
            Download as CSV
          </button>
          <table className="w-full border border-border rounded-lg">
            <thead className="bg-secondary">
              <tr>
                {Object.keys(data[0]).map((key) => (
                  <th key={key} className="border border-border px-2 py-1 text-left text-secondary-foreground">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* {data.map((row, idx) => (
                <tr key={idx} className="even:bg-secondary">
                  {Object.values(row).map((val, i) => (
                    <td key={i} className="border border-border px-2 py-1 text-card-foreground">
                      {val}
                    </td>
                  ))}
                </tr>
              ))} */}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default App;
