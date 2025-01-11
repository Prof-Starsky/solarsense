import { useState, useEffect } from "react";
import { getWeatherData } from "./request.ts";

export const App = () => {
  const [inputValue, setInputValue] = useState("");
  const [showMap, setShowMap] = useState(false);
  const [isTopPosition, setIsTopPosition] = useState(false);
  let lat = "";
  let long = "";

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setInputValue(""); // Add this line to clear the input
    setShowMap(true);
    setIsTopPosition(true);
    setTimeout(() => {
      const mapFrame = document.querySelector("iframe");
      if (mapFrame && mapFrame.contentWindow) {
        mapFrame.contentWindow.postMessage(
          {
            type: "SET_INPUT_VALUE",
            value: inputValue,
          },
          "*"
        );
      }
    }, 100);
  };

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.data.type === "SET_LAT_LNG") {
        console.log(event.data.lat, event.data.lng);
        lat = event.data.lat;
        long = event.data.lng;
        const weatherData = await getWeatherData(lat, long);
        console.log("Averages", weatherData);
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return (
    <div
      className="container"
      style={{
        display: "flex",
        width: "100%",
        height: "100vh",
        overflow: "hidden", // Prevent any potential scrolling
      }}
    >
      {/* Left half - Map Container */}
      <div
        className="map-container"
        style={{
          width: "50%",
          height: "100%",
          borderRight: "1px solid #ccc", // Optional: adds visual separation
        }}
      >
        {showMap && (
          <iframe
            src="/maps.html"
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              display: "block", // Prevents any extra space
            }}
            title="map"
          />
        )}
      </div>

      {/* Right half - Content Container */}
      <div
        className="content-container"
        style={{
          width: "50%",
          height: "100%",
          position: "relative", // Container for absolute positioning
        }}
      >
        <div
          className="form-container"
          style={{
            position: isTopPosition ? "absolute" : "relative",
            top: isTopPosition ? "20px" : "auto",
            left: isTopPosition ? "50%" : "auto",
            transform: isTopPosition ? "translateX(-50%)" : "none",
            zIndex: isTopPosition ? 1000 : "auto",
            background: isTopPosition ? "#fff" : "transparent",
            padding: "20px",
            boxShadow: isTopPosition ? "0 2px 4px rgba(0,0,0,0.1)" : "none",
          }}
        >
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
      </div>
    </div>
  );
};

export default App;
