import { useState, useEffect } from "react";
import { getWeatherData } from "./request.ts";
import "bootstrap/dist/css/bootstrap.min.css";

export const App = () => {
  const [inputValue, setInputValue] = useState("");
  const [showMap, setShowMap] = useState(true);
  const [showCards, setShowCards] = useState(false);
  const [isTopPosition, setIsTopPosition] = useState(false);
  const [cardsContent] = useState([
    {
      title: "Solar Panel System",
      text: "High-efficiency solar panels with 400W output per panel. Ideal for residential installations.",
    },
    {
      title: "Battery Storage",
      text: "13.5 kWh Powerwall battery system for energy storage. Perfect for night-time power needs.",
    },
    {
      title: "Inverter System",
      text: "Smart inverter with 98% efficiency rating. Converts DC to AC power seamlessly.",
    },
    {
      title: "Installation Package",
      text: "Professional installation by certified technicians. Includes permits and inspections.",
    },
    {
      title: "Monitoring System",
      text: "Real-time energy production and consumption monitoring via smartphone app.",
    },
  ]);

  let lat = "";
  let long = "";

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setInputValue("");
    setShowCards(true);
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
            <div className="card-body d-flex flex-column">
              <div
                className={`${
                  isTopPosition
                    ? ""
                    : "d-flex align-items-center justify-content-center h-100"
                }`}
                style={{
                  position: isTopPosition ? "relative" : "relative",
                  top: isTopPosition ? "20px" : "unset",
                  width: "100%",
                  marginBottom: isTopPosition ? "40px" : "0",
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
                    placeholder="Enter address"
                    style={{ flexGrow: 1 }}
                  />
                  <button type="submit" className="btn btn-primary">
                    Submit
                  </button>
                </form>
              </div>

              {/* Cards that appear after submit */}
              {showCards && (
                <div className="row g-3">
                  {cardsContent.map((card, index) => (
                    <div key={index} className="col-12">
                      <div className="card">
                        <div className="card-body">
                          <h5 className="card-title">{card.title}</h5>
                          <p className="card-text">{card.text}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
