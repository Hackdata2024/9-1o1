import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import PropTypes from "prop-types";

import axios from "axios";
const backendUrl = "http://localhost:3000";

function Renders({ commander_id }) {
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

  const ProgressBar = ({ numerator, denominator }) => {
    // Calculate the percentage completion
    const percentage = (numerator / denominator) * 100;

    return (
      <div
        className="progress-bar"
        style={{
          width: "50%",
          height: "10px",
          border: "1px solid #ccc",
          borderRadius: "5px",
          overflow: "hidden",
        }}
      >
        <div
          className="progress-bar-fill"
          style={{
            width: `${percentage}%`,
            height: "100%",
            backgroundColor: "#6c47ff",
          }}
        ></div>
      </div>
    );
  };

  const RenderingComponentStatus = () => {
    if (!commander_id) {
      return (
        <div>
          <p>No Active Renders Right Now ...</p>
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
        if (message === "rendered") {
          ws.close();
          window.location.reload();
        }
        setStatus(message);
      };
    }, [ws, status]);

    useEffect(() => {
      if (
        status.split("/")[0] === status.split("/")[1] &&
        status.split("/")[0] !== "0"
      ) {
        // setRendered(true);
        // render_data = null;
        // render_data = null;
      }
    }, [status]);

    return (
      <div>
        {/* <h1>Active Renders</h1> */}
        <p>Rendering in Progress status : {status}</p>
        {/* Progress bar */}
        <ProgressBar
          numerator={parseInt(status.split("/")[0])}
          denominator={parseInt(status.split("/")[1])}
        />
      </div>
    );
  };

  const renderList = renders.map((render) => {
    return (
      <div key={render[1]} className="render_item">
        <div className="render_info">
          <h3>Project Name : {render[3]}</h3>
          <p>Number of Frames : {render[2]}</p>
          {/* <p>Frames Per Second : {render}</p> */}
          <p>Status : {render[4]}</p>
        </div>
        <div className="render_buttons">
          <button onClick={() => handleDownload(render.id)} className="btn1">
            Download Frames(Zip)
          </button>
          <button
            onClick={() => handleDownloadVideo(render.id)}
            className="btn2"
          >
            Download Video(mp4)
          </button>
        </div>
      </div>
    );
  });

  return (
    <div>
      <RenderingComponentStatus />
      {userId && userId !== "" && renders.length != 0 ? (
        <div>
          <h2>Previous Renders</h2>
          <div>{renderList}</div>
        </div>
      ) : (
        <>
          <br />
          <h2>No Previous Renders</h2>
          <p>Upload a .blend file in the form to start rendering</p>
        </>
      )}
    </div>
  );
}

Renders.propTypes = {
  render_data: PropTypes.object,
};

Renders.propTypes = {
  render_data: PropTypes.object,
};

export default Renders;
