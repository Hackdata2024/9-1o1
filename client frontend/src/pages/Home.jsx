import axios from "axios";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import Renders from "./Renders";
const backendUrl = "http://localhost:3000";

function Home() {
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [numberOfFrames, setNumberOfFrames] = useState("");
  const [file, setFile] = useState(null);
  const user = useUser().user;
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    // Handle the selected file if needed
  };

  const handleRender = () => {
    setUploading(true);

    if (file && numberOfFrames) {
      const formData = new FormData();
      formData.append("file", file);
      // formData.append("no_of_frames", numberOfFrames);
      // formData.append("user_id", user.id);

      axios
        .post(`${backendUrl}/upload/${user.id}/${numberOfFrames}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => {
          console.log(res);
          setResult(res.data);
          setUploaded(true);
          setUploading(false);
        })
        .catch((err) => {
          console.log(err);
          setUploading(false);
          setUploaded(false);
          setError("Error: Cannot upload or rendering failed");
        });
    } else {
      setError("Please select a file to upload");
      setUploading(false);
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
      <Renders />
      {uploaded ? (
        <>
          <h1>Rendered!</h1>
          <p>Downloading the Zip file</p>
        </>
      ) : uploading ? (
        <h1>Rendering...</h1>
      ) : (
        <>
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
            placeholder="Enter the number of frames"
            value={numberOfFrames}
            onChange={(e) => setNumberOfFrames(e.target.value)}
          />
          <br />
          <button onClick={handleRender} disabled={!numberOfFrames}>
            Render
          </button>
        </>
      )}
      {error !== "" && (
        <div>
          <h1>{error}</h1>
        </div>
      )}
    </>
  );
}

export default Home;
