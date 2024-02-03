import axios from "axios";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
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
  const [render_data, setRender_data] = useState(null);
  const user = useUser().user;
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    // Handle the selected file if needed
  };

  const handleRender = () => {
    if (file && numberOfFrames != "" && projectName !== "" && fps > 0) {
      setRender_data({
        commander_id: commander_id,
        projectName: projectName,
        numberOfFrames: numberOfFrames,
      });

      const formData = new FormData();
      formData.append("file", file);
      // formData.append("no_of_frames", numberOfFrames);
      // formData.append("user_id", user.id);

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

  // const handleDownload = () => {
  //   axios
  //     .get(`${backendUrl}/download/${result.id}`, {
  //       responseType: "blob",
  //     })
  //     .then((res) => {
  //       console.log(res);
  //       const url = window.URL.createObjectURL(
  //         new Blob([res.data], {
  //           type: "application/zip",
  //         })
  //       );
  //       const link = document.createElement("a");
  //       link.href = url;
  //       link.setAttribute("download", "results.zip");
  //       document.body.appendChild(link);
  //       link.click();
  //       setUploaded(false);
  //       setUploading(false);
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //       setUploading(false);
  //       setUploaded(false);
  //       setError("Error: Cannot download the zip file");
  //     });
  // };

  useEffect(() => {
    if (uploaded && result && result.status === "success") {
      // handleDownload();
    }
  }, [uploaded, result]);

  return (
    <>
      <label htmlFor="projectName">Project Name :</label>
      <input
        id="projectName"
        type="text"
        placeholder="Enter the project name"
        value={projectName}
        onChange={(e) => setProjectName(e.target.value)}
      />
      <br />
      {/* <h1>Upload your .blend file :</h1> */}
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
      <br />
      <Renders 
        render_data={render_data}
        commander_id={commander_id}
      />
    </>
  );
}

export default Home;
