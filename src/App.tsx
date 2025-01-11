import { useState } from "react";

export const App = () => {
  const [inputValue, setInputValue] = useState("");
  const [showMap, setShowMap] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log(inputValue);
    setShowMap(true);
  };

  return (
    <div
      className="container"
      style={{ display: "flex", width: "100%", height: "100vh" }}
    >
      <div className="form-container" style={{ flex: 1, padding: "20px" }}>
        <form onSubmit={handleSubmit} className="form">
          <input
            type="text"
            value={inputValue}
            onChange={handleChange}
            className="input"
          />
          <button type="submit" className="submit-button">
            Submit
          </button>
        </form>
      </div>
      <div className="map-container" style={{ flex: 1 }}>
        {showMap && (
          <iframe
            src="/maps.html"
            style={{
              width: "100%",
              height: "100%",
              border: "none",
            }}
            title="map"
          />
        )}
      </div>
    </div>
  );
};

export default App;
