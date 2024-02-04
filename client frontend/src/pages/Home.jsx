import axios from "axios";
import { useEffect, useState } from "react";
import { useUser, UserButton } from "@clerk/clerk-react";
import "../styles/Home.css";
import Renders from "./Renders";

const backendUrl = "http://10.8.24.31:3000";

function Home() {
  const [uploaded, setUploaded] = useState(false);
  const [result, setResult] = useState(null);
  const [commander_id, setCommander_id] = useState("");
  const [numberOfFrames, setNumberOfFrames] = useState("");
  const [file, setFile] = useState(null);
  const [fps, setFps] = useState(24);
  const [projectName, setProjectName] = useState("");
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

  // const UploadForm = () => {
  //   return (

  //   );
  // };

  return (
    <div className="home-container">
      <div className="renders-container">
        <h1 className="heading">Parallel Pilot</h1>
        <Renders commander_id={commander_id} />
      </div>
      <div className="right-container">
        <UserButton />
        {/* <UploadForm /> */}
        <div className="form-container">
          <h2 className="title">Upload your .blend file</h2>
          <label htmlFor="projectName">Project Name :</label>
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
          <label htmlFor="framesInput">Number of frames :</label>
          <input
            id="framesInput"
            type="text"
            placeholder="Enter the number of frames to render"
            value={numberOfFrames}
            onChange={(e) => setNumberOfFrames(e.target.value)}
          />
          <br />
          <label htmlFor="fpsInput">FPS :</label> &nbsp;
          <input
            id="fpsInput"
            type="number"
            placeholder="Enter the fps"
            value={fps}
            onChange={(e) => setFps(e.target.value)}
          />
          <br />
          <button onClick={handleRender} disabled={!numberOfFrames}>
            Render
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;
