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
    setInputValue("");
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
        overflow: "hidden",
      }}
    >
      {/* Left half - Map Container */}
      <div
        className="map-container"
        style={{
          width: "50%",
          height: "100%",
          borderRight: "1px solid #ccc",
        }}
      >
        {showMap && (
          <iframe
            src="/maps.html"
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              display: "block",
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
          position: "relative",
        }}
      >
        <div
          className="form-container"
          style={{
            position: "absolute",
            width: "50%",
            left: "75%",
            transform: "translateX(-50%)",
            top: isTopPosition ? "20px" : "50%",
            marginTop: isTopPosition ? "0" : "-1.5em",
            transition: "all 0.3s ease",
            zIndex: 1000,
            background: "#fff",
            padding: "20px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <form onSubmit={handleSubmit} className="form">
            <input
              type="text"
              value={inputValue}
              onChange={handleChange}
              className="input"
              style={{
                width: "100%",
                padding: "8px",
              }}
            />
            <button
              type="submit"
              className="submit-button"
              style={{
                marginTop: "10px",
                width: "100%",
              }}
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default App;
