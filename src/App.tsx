import { useState, useEffect } from "react";
import { getWeatherData } from "./request.ts";
import { chatWithCohere } from "./cohere.ts";
import "bootstrap/dist/css/bootstrap.min.css";

export const App = () => {
  const [inputValue, setInputValue] = useState("");
  const [showMap, setShowMap] = useState(true);
  const [showCards, setShowCards] = useState(false);
  const [isTopPosition, setIsTopPosition] = useState(false);
  const [cardsContent] = useState([
    {
      title: "Sunlight hits your house for approximately: ",
      text: "2002 hours every single year",
    },
    {
      title: "Based on Solar Power Advancement and amount of sunlight",
      text: "With solar panels, you would generate 274 kwh of energy per square foot per year",
    },
    {
      title:
        "It costs approximately $0.19 per kwh with the average home use being 10000 kwh/year",
      text: "That means electricity costs $1920 minus $52.6 per square foot a year",
    },
    {
      title:
        "In your area, it costs about $12 per square foot to install solar panels",
      text: "and it costs about $1 per square foot per year to maintain them",
    },
    {
      title: "This results in a final yearly cost of ~$1920+$1/square ft",
      text: "But in the same time frame you make $52/year",
    },
  ]);

  let lat = "";
  let long = "";

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  let response = "";
  let response2 = "";
  let response3 = "";
  let response4 = "";

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    response2 = await costPerYear(inputValue);
    response = await sunPerYear(inputValue);
    response3 = await maintPerYear(inputValue);
    response4 = await kwhPerYear(inputValue);

    console.log(typeof response);
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

  const sunPerYear = async (address: string) => {
    const response = await chatWithCohere(
      `How many hours of sunlight does ${address} get per year? Give a concise answer`
    );
    return response;
  };
  const costPerYear = async (address: string) => {
    const response2 = await chatWithCohere(
      `What is the dollar cost per square foot to install Solars panels at ${address}, assume the most basic and cheapest solar panel. Give a concise answer`
    );
    return response2;
  };
  const maintPerYear = async (address: string) => {
    const response3 = await chatWithCohere(
      `What is the dollar cost per square foot to maintain Solars panels at ${address}, assume the most basic and cheapest solar panel. Give a concise answer`
    );
    return response3;
  };
  const kwhPerYear = async (address: string) => {
    const response4 = await chatWithCohere(
      `What is cost per kwh at ${address}, guess to the best of your ability. Give you answers in dollars. Very concise answer`
    );
    return response4;
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
