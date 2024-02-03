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

  const handleDownload = async (commander_id) => {
    const filename = "results.zip"; // Replace with your actual filename

    const url = `${backendUrl}/download/${commander_id}`;
    const response = await fetch(url);
    const blob = await response.blob();

    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadVideo = async (commander_id) => {
    const filename = "video.mp4"; // Replace with your actual filename

    const url = `${backendUrl}/download/video/${commander_id}`;
    const response = await fetch(url);
    const blob = await response.blob();

    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
                    Download Frames as Zip
                  </button>
                  <button onClick={() => handleDownloadVideo(render[1])}>
                    Download Video
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
