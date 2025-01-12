import { useState, useEffect } from "react";
import { getWeatherData } from "./request.ts";
import { chatWithCohere } from "./cohere.ts";
import "bootstrap/dist/css/bootstrap.min.css";

export const App = () => {
  const [inputValue, setInputValue] = useState("");
  const [showCards, setShowCards] = useState(false);
  const [isTopPosition, setIsTopPosition] = useState(false);

  // Add state for responses
  const [responses, setResponses] = useState({
    sunlight: "",
    eng: "",
    cost: "",
    maintenance: "",
    kwhCost: "",
  });

  // dummy stuff to stop it from fucking erroring im gonna crash out

  // Update cardsContent to be dependent on responses
  const [cardsContent, setCardsContent] = useState([
    {
      title: "",
      text: "2002 hours every single year",
    },
    {
      title: "Based on Solar Power Advancement and amount of sunlight",
      text: "With solar panels, you would generate 274 kwh of energy per square foot per year",
    },
    {
      title: "",
      text: "That means electricity costs $1920 minus $52.6 per square foot a year",
    },
    {
      title: "",
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Get all responses
    const sunlightResponse = await sunPerYear(inputValue);
    const engResponse = await engPerYear(inputValue);
    const costResponse = await costPerYear(inputValue);
    const maintResponse = await maintPerYear(inputValue);
    const kwhResponse = await kwhPerYear(inputValue);

    // Update responses state
    setResponses({
      sunlight: sunlightResponse,
      eng: engResponse,
      cost: costResponse,
      maintenance: maintResponse,
      kwhCost: kwhResponse,
    });

    const engResponseNum = extractNumber(engResponse);
    const costResNum = extractNumber(costResponse);
    const maintResNum = extractNumber(maintResponse);
    const kwhNum = extractNumber(kwhResponse);
    console.log(responses);
    const amtSaved = Number(
      (engResponseNum * kwhNum * 5 - (maintResNum * 5 + costResNum)).toFixed(2)
    );
    const amtSaved2 = Number(
      (engResponseNum * kwhNum * 10 - (maintResNum * 10 + costResNum)).toFixed(
        2
      )
    );
    const amtSaved3 = Number(
      (engResponseNum * kwhNum * 25 - (maintResNum * 25 + costResNum)).toFixed(
        2
      )
    );

    // Update cards content with new responses
    setCardsContent([
      {
        title: sunlightResponse,
        text: "",
      },
      {
        title: engResponse,
        text: "",
      },
      {
        title: kwhResponse,
        text: "",
      },
      {
        title: costResponse + maintResponse,
        text: "",
      },
      {
        title: `$${amtSaved}, $${amtSaved2}, $${amtSaved3}`,
        text: "",
      },
    ]);

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
  const extractNumber = (response: string): number => {
    const match = response.match(/(\d{1,3}(,\d{3})*(.\d+)?)/);
    return match ? parseFloat(match[0]) : 0;
  };

  const sunPerYear = async (address: string) => {
    const response = await chatWithCohere(
      `How many hours of sunlight does ${address} get per year? Give an reasonable and concise answer. Respond in the exact format: ${address} receives about 'answer' hours of sunshine per year.`
    );
    return response;
  };
  const engPerYear = async (address: string) => {
    const response5 = await chatWithCohere(
      `How many kwh are generated per square foot per year of Solar panels with the amount of sunlight from ${address}?. More sunlight = more kwh generated. Max number of kwh generated is 10 kwh per square foot per year. Respond in the exact format: With solar panels, you would generate 'answer' kwh of energy per square foot per year `
    );
    return response5;
  };
  const kwhPerYear = async (address: string) => {
    const response4 = await chatWithCohere(
      `What is cost per kwh at ${address}? Respond in the exact format: The cost of electricity in ${address} is $'answer' per kwh.`
    );
    return response4;
  };
  const costPerYear = async (address: string) => {
    const response2 = await chatWithCohere(
      `What is the dollar cost per square foot to install Solars panels at ${address} based on local prices? The min cost is $2 per square foot. Respond in the exact format: It costs $'answer' per square foot to install Solar panels.`
    );
    return response2;
  };
  const maintPerYear = async (address: string) => {
    const response3 = await chatWithCohere(
      `What is the dollar cost per square foot to maintain Solars panels at ${address}. The min cost is $0.05 per square foot. Respond in the exact format: ' It costs $'answer' per square foot per year to maintain them.`
    );
    return response3;
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
                <iframe
                  src="../maps.html"
                  style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                    display: "block",
                  }}
                  title="map"
                />
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
