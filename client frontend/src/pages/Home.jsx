import axios from "axios";
import { useEffect, useState } from "react";
import { useUser, UserButton } from "@clerk/clerk-react";
import "../styles/Home.css";
import Renders from "./Renders";

const backendUrl = "http://localhost:3000";

function Home() {
  const [uploaded, setUploaded] = useState(false);
  const [result, setResult] = useState(null);
  const [commander_id, setCommander_id] = useState("");
  const [numberOfFrames, setNumberOfFrames] = useState("");
  const [file, setFile] = useState(null);
  const [fps, setFps] = useState(24);
  const [projectName, setProjectName] = useState("");
  const [showInputForm, setShowInputForm] = useState(false);
  const user = useUser().user;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const handleRender = () => {
    if (file && numberOfFrames !== "" && projectName !== "" && fps > 0) {
      const formData = new FormData();
      formData.append("file", file);

      axios
        .post(
          `${backendUrl}/upload/${user.id}/${numberOfFrames}/${fps}/${projectName}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        )
        .then((res) => {
          console.log(res);
          setResult(res.data);
          setCommander_id(res.data.id);
          setUploaded(true);
        })
        .catch((err) => {
          console.log(err);
          setUploaded(false);
        });
    }
  };

  useEffect(() => {
    if (uploaded && result && result.status === "success") {
      // handleDownload();
    }
  }, [uploaded, result]);

  const InputForm = () => {
    const handleClose = () => {
      setShowInputForm(false);
    };

    const handleSubmit = () => {
      handleRender();
      setShowInputForm(false);
    };

    return (
      <div className="input-form-card">
        <button className="close-button" onClick={handleClose}>
          X
        </button>
        <label htmlFor="projectName">Project Name:</label>
        <input
          id="projectName"
          type="text"
          placeholder="Enter the project name"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
        />
        <br />
        <label htmlFor="fileInput">Select File:</label>
        <input
          type="file"
          accept=".blend"
          id="fileInput"
          onChange={(e) => handleFileChange(e)}
        />
        <br />
        <label htmlFor="framesInput">Number of Frames:</label>
        <input
          id="framesInput"
          type="text"
          placeholder="Enter the number of frames to render"
          value={numberOfFrames}
          onChange={(e) => setNumberOfFrames(e.target.value)}
        />
        <br />
        <label htmlFor="fpsInput">FPS:</label> &nbsp;
        <input
          id="fpsInput"
          type="number"
          placeholder="Enter the fps"
          value={fps}
          onChange={(e) => setFps(e.target.value)}
        />
        <br />
        <button onClick={handleSubmit} disabled={!numberOfFrames}>
          Render
        </button>
        <br />
      </div>
    );
  };

  return (
    <div className="home-container">
      <div className="nav">
        {showInputForm ? (
          <InputForm />
        ) : (
          <button onClick={() => setShowInputForm(true)}>Upload</button>
        )}
        <UserButton />
      </div>
      <Renders commander_id={commander_id} />
    </div>
  );
}

export default Home;
