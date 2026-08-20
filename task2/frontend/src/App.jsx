import { useState } from "react";
import "./App.css";

function App() {
  const [formData, setFormData] = useState({
    productName: "",
    productDescription: "",
    platform: "LinkedIn",
    tone: "Professional",
    temperature: 0.7,
    topP: 0.9,
  });

  const [generatedCopy, setGeneratedCopy] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]:
        name === "temperature" || name === "topP"
          ? Number(value)
          : value,
    }));
  };

  const handleGenerate = async (e) => {
    e.preventDefault();

    if (!formData.productName.trim()) {
      alert("Please enter a product name.");
      return;
    }

    if (!formData.productDescription.trim()) {
      alert("Please enter a product description.");
      return;
    }

    setLoading(true);
    setGeneratedCopy("");

    try {
      const response = await fetch("http://localhost:8000/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to generate copy.");
      }

      const data = await response.json();

      setGeneratedCopy(data.generated_copy);
    } catch (error) {
      console.error(error);

      setGeneratedCopy(
        "Backend is not connected yet. We will connect the FastAPI backend in the next step."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div>
          <p className="eyebrow">GENERATIVE AI • PROJECT 2</p>
          <h1>AI Copywriter</h1>
          <p className="subtitle">
            Automated Copywriting & Tone Transformer
          </p>
        </div>
      </header>

      <main className="container">
        <section className="hero">
          <h2>Create platform-specific marketing copy</h2>
          <p>
            Enter your product information, select a platform and tone,
            then control the creativity of the generation.
          </p>
        </section>

        <form onSubmit={handleGenerate} className="copy-form">
          <div className="form-section">
            <h3>Product Information</h3>

            <label htmlFor="productName">Product Name</label>

            <input
              id="productName"
              name="productName"
              type="text"
              placeholder="e.g. EcoBottle"
              value={formData.productName}
              onChange={handleChange}
            />

            <label htmlFor="productDescription">
              Product Description
            </label>

            <textarea
              id="productDescription"
              name="productDescription"
              rows="5"
              placeholder="Describe your product..."
              value={formData.productDescription}
              onChange={handleChange}
            />
          </div>

          <div className="form-grid">
            <div className="form-section">
              <h3>Platform</h3>

              <select
                name="platform"
                value={formData.platform}
                onChange={handleChange}
              >
                <option value="LinkedIn">LinkedIn</option>
                <option value="Instagram">Instagram</option>
                <option value="Email">Email</option>
              </select>
            </div>

            <div className="form-section">
              <h3>Tone</h3>

              <select
                name="tone"
                value={formData.tone}
                onChange={handleChange}
              >
                <option value="Professional">Professional</option>
                <option value="Friendly">Friendly</option>
                <option value="Persuasive">Persuasive</option>
                <option value="Casual">Casual</option>
                <option value="Luxury">Luxury</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="form-section">
            <h3>Generation Parameters</h3>

            <div className="parameter">
              <div className="parameter-header">
                <label htmlFor="temperature">Temperature</label>

                <span>{formData.temperature.toFixed(1)}</span>
              </div>

              <input
                id="temperature"
                name="temperature"
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={formData.temperature}
                onChange={handleChange}
              />
            </div>

            <div className="parameter">
              <div className="parameter-header">
                <label htmlFor="topP">Top P</label>

                <span>{formData.topP.toFixed(1)}</span>
              </div>

              <input
                id="topP"
                name="topP"
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={formData.topP}
                onChange={handleChange}
              />
            </div>
          </div>

          <button
            type="submit"
            className="generate-button"
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate Marketing Copy"}
          </button>
        </form>

        <section className="result-section">
          <div className="result-header">
            <h3>Generated Copy</h3>

            {generatedCopy && (
              <button
                type="button"
                className="copy-button"
                onClick={() =>
                  navigator.clipboard.writeText(generatedCopy)
                }
              >
                Copy
              </button>
            )}
          </div>

          <div className="result-box">
            {generatedCopy ? (
              <p>{generatedCopy}</p>
            ) : (
              <p className="placeholder">
                Your generated marketing copy will appear here.
              </p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
