import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import PropTypes from "prop-types";

import axios from "axios";
const backendUrl = "http://localhost:3000";

function Renders({  commander_id }) {
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

  const RenderingComponentStatus = () => {
    if (!commander_id) {
      return (
        <div>
          <p>No Active Renders</p>
        </div>
      );
    } 
    // setRendered(false);
    const [status, setStatus] = useState("");
    const [ws, setWs] = useState(null);

    useEffect(() => {
      console.log(commander_id);
      const socket = new WebSocket(`ws://localhost:3000/ws/${commander_id}`);
      setWs(socket);
      // return () => {
      //   socket.close();
      // };
    }, []);

    useEffect(() => {
      // setVideoProcessing(true);
      if (!ws) {
        return;
      }
      ws.onmessage = (event) => {
        const message = event.data;
        if(message === "rendered"){
          ws.close();
          window.location.reload();
        }
        setStatus(message);
      };
    }, [ws,status]);

    useEffect(() => {
      if (
        status.split("/")[0] === status.split("/")[1] &&
        status.split("/")[0] !== "0"
      ) {
        // setRendered(true);
        // render_data = null;
      }
    }, [status]);

    
      return (
        <div>
        <h1>Active Renders</h1>
          <p>Rendering...</p>
          <p>{status}</p>
        </div>
      );
  };

  return (
    <div>
            <RenderingComponentStatus />
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

Renders.propTypes = {
  commander_id: PropTypes.string,
};

export default Renders;
