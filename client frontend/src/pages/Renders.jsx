import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";

import axios from "axios";
const backendUrl = "http://localhost:3000";

function Renders() {
  const [userId, setUserId] = useState("");
  const user = useUser().user;
  const [renders, setRenders] = useState([]);

  useEffect(() => {
    setUserId(user.id);
  }, []);

  const handleDownload = (commander_id) => {
    axios
      .get(`${backendUrl}/download/${commander_id}`, {
        responseType: "blob",
      })
      .then((res) => {
        console.log(res);
        const url = window.URL.createObjectURL(
          new Blob([res.data], {
            type: "application/zip",
          })
        );
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "results.zip");
        document.body.appendChild(link);
        link.click();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    if (userId === "") {
      return;
    }

    axios
      .get(`${backendUrl}/renders/${userId}`)
      .then((res) => {
        // console.log(res);
        if (res.status === 200) {
          console.log(res);
          setRenders(res.data);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, [userId]);

  return (
    <div>
      <h1>All Renders</h1>
      {userId && userId !== "" && renders != [] ? (
        <div>
          {renders.map((render) => (
            <div key={render[1]}>
              <h3>{render[3]}</h3>
              <p>{render[2]}</p>
              {render[4] === "rendered" ? (
                <>
                  <p>Rendered</p>
                  <button onClick={() => handleDownload(render[1])}>
                    Download
                  </button>
                </>
              ) : (
                <p>Rendering...</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <h1>Loading Data...</h1>
      )}
    </div>
  );
}

export default Renders;
