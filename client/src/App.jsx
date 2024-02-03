import { useEffect, useState } from "react";
import "./App.css";

// const CLIENT_SERVER_URL = "http://localhost:3000";

function App() {
  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    const status = localStorage.getItem("isLogged");
    if (status === "true") {
      setIsLogged(true);
    } else {
      setIsLogged(false);
    }

    if(!isLogged){
      window.location.href = `/login`;
    }
  }, [isLogged]);

  return <></>;
}

export default App;
