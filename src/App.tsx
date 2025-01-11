import { useState, useEffect } from "react";
import { getWeatherData } from "./request.ts";
import "bootstrap/dist/css/bootstrap.min.css";

export const App = () => {
  const [inputValue, setInputValue] = useState("");
  const [showMap, setShowMap] = useState(true);
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
    setIsTopPosition(true); // Trigger the top position for the form
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
      className="container-fluid"
      style={{
        height: "100vh",
        overflow: "hidden",
        padding: "20px",
      }}
    >
      <div className="row h-100">
        {/* Left half - Map Container */}
        <div className="col-6">
          <div className="card h-100">
            <div className="card-body" style={{ position: "relative" }}>
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
          </div>
        </div>

        {/* Right half - Content Container */}
        <div className="col-6">
          <div className="card h-100">
            <div
              className={`card-body d-flex ${
                isTopPosition ? "" : "align-items-center justify-content-center"
              }`}
              style={{
                position: isTopPosition ? "absolute" : "relative",
                top: isTopPosition ? "20px" : "unset",
                left: isTopPosition ? "50%" : "unset",
                transform: isTopPosition ? "translateX(-50%)" : "unset",
                width: isTopPosition ? "100%" : "unset",
                zIndex: isTopPosition ? 1000 : "unset",
              }}
            >
              <form
                onSubmit={handleSubmit}
                className={isTopPosition ? "w-100" : "w-50"}
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "center",
                  padding: isTopPosition ? "10px" : "unset",
                  boxShadow: isTopPosition
                    ? "0 2px 4px rgba(0,0,0,0.2)"
                    : "unset",
                  background: isTopPosition ? "#fff" : "unset",
                }}
              >
                <input
                  type="text"
                  value={inputValue}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter value"
                  style={{ flexGrow: 1 }}
                />
                <button type="submit" className="btn btn-primary">
                  Submit
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
