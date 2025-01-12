import { useState, useEffect } from "react";
import { getWeatherData } from "./request.ts";
import { chatWithCohere } from "./cohere.ts";
import "bootstrap/dist/css/bootstrap.min.css";

export const App = () => {
  const [inputValue, setInputValue] = useState("");
  const [showCards, setShowCards] = useState(true);
  const [isTopPosition, setIsTopPosition] = useState(true);
  //const [isSqft, setIsSqft] = useState(0);
  const [inputValue2, setInputValue2] = useState("");

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
      title: "Hours of Sunshine per year:",
      text: "",
    },
    {
      title: "Energy Generated per year:",
      text: "",
    },
    {
      title: "Electricity Cost:",
      text: "",
    },
    {
      title: "Installation and Maintenance Cost:",
      text: "",
    },
    {
      title: "Profitability:",
      text: "",
    },
  ]);

  let lat = "";
  let long = "";

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };
  const handleChange2 = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue2(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    console.log(inputValue2);
    const isSqft = parseFloat(inputValue2);
    console.log(isSqft);

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
    console.log(engResponseNum, costResNum, maintResNum, kwhNum);
    const amtSaved = Number(
      (
        (engResponseNum * kwhNum * 5 - (maintResNum * 5 + costResNum)) *
        isSqft
      ).toFixed(2)
    );
    const amtSaved2 = Number(
      (
        (engResponseNum * kwhNum * 10 - (maintResNum * 10 + costResNum)) *
        isSqft
      ).toFixed(2)
    );
    const amtSaved3 = Number(
      (
        (engResponseNum * kwhNum * 25 - (maintResNum * 25 + costResNum)) *
        isSqft
      ).toFixed(2)
    );

    // Update cards content with new responses
    setCardsContent([
      {
        title: sunlightResponse,
        text: "",
      },
      {
        title: `With solar panels, you would generate ${
          engResponseNum * isSqft
        } kwh of energy per year`,
        text: "",
      },
      {
        title: kwhResponse,
        text: "",
      },
      {
        //It costs $'answer' per square foot to install Solar panels.`
        //It costs $'answer' per square foot per year to maintain them.`
        title: `It will cost $${
          costResNum * isSqft
        } to install the solar panels and $${
          maintResNum * isSqft
        } per year to maintain them.`,
        text: "",
      },
      {
        title: `So, if you build solar panels, you should expect to earn: $${amtSaved} after five years\n
        , $${amtSaved2} after 10 years, and $${amtSaved3} after 25 years`,
        text: "",
      },
    ]);

    setInputValue2("");
    setInputValue("");
    setInputValue2("");
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
    const match = response.match(/(?<!\w\s)(?<!\w)(\d{1,3}(,\d{3})*(\.\d+)?)/);
    return match ? parseFloat(match[0].replace(/,/g, "")) : 0;
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
        backgroundImage: "url('/public/warpgrid2.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="row h-100">
        {/* Left half - Map Container */}
        <div className="col-6">
          <div
            className="card"
            style={{
              height: "30%",
              marginBottom: "20px",
              backgroundColor: "#b6f2f2",
            }}
          >
            <img
              src="/public/download.png"
              alt="logo"
              style={{ height: "100%" }}
            />
          </div>

          <div className="card" style={{ height: "66%" }}>
            <div className="card-body" style={{ position: "relative" }}>
              <iframe
                src="../maps.html"
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                  display: "block",
                  backgroundColor: "#00ad28",
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
                  className={isTopPosition ? "w-100" : "w-100"}
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
                    value={inputValue2}
                    onChange={handleChange2}
                    className="form-control"
                    placeholder="Square Feet"
                    style={{ flexGrow: 1, width: "30%", fontSize: "1.3rem" }}
                  />
                  <input
                    type="text"
                    value={inputValue}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Address"
                    style={{ flexGrow: 1, width: "50%", fontSize: "1.3rem" }}
                  />

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: "20%", fontSize: "1.5rem" }}
                  >
                    Submit
                  </button>
                </form>
              </div>

              {/* Cards that appear after submit */}
              {showCards && (
                <>
                  <div className="row g-3">
                    {cardsContent.map((card, index) => (
                      <div key={index} className="col-12">
                        <div className="card">
                          <div className="card-body">
                            <h5
                              className="card-title"
                              style={{ fontSize: "1.5rem" }}
                            >
                              {card.title}
                            </h5>
                            <p className="card-text">{card.text}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* New section with 3 cards side-by-side */}
                  <div className="row g-3 mt-4">
                    <div className="col-md-4" style={{ height: "150px" }}>
                      <div className="card h-100">
                        <div className="card-body">
                          <h5
                            className="card-title"
                            style={{ fontSize: "1.3rem" }}
                          >
                            5 Years
                          </h5>
                          <p className="card-text"></p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4" style={{ height: "150px" }}>
                      <div className="card h-100">
                        <div className="card-body">
                          <h5
                            className="card-title"
                            style={{ fontSize: "1.3rem" }}
                          >
                            10 Years
                          </h5>
                          <p className="card-text"></p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4" style={{ height: "150px" }}>
                      <div className="card h-100">
                        <div className="card-body">
                          <h5
                            className="card-title"
                            style={{ fontSize: "1.3rem" }}
                          >
                            25 Years
                          </h5>
                          <p className="card-text"></p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
