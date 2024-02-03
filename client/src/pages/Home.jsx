import axios from "axios";
import { useEffect, useState } from "react";

const backendUrl = "http://localhost:3000";

function Home() {
  // const [file, setFile] = useState(null);
  // const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const handleUpload = () => {
    setUploading(true);
    const selectedFile = document.querySelector("input[type=file]").files[0];
    
    if (selectedFile) {
      // setFile(selectedFile);
      
      const formData = new FormData();
      formData.append("file", selectedFile);
  
      axios
        .post(`${backendUrl}/upload`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => {
          console.log(res);
          setResult(res.data);
          setUploading(false);
          setUploaded(true);
        })
        .catch((err) => {
          console.log(err);
          setUploading(false);
          setUploaded(false);
          setError("Error cannot upload or Rendering failed");
        });
    } else {
      // Handle case when no file is selected
      setError("Please select a file to upload");
      setUploading(false);
    }
  };

  useEffect(() => {
    if (uploaded) {
      if (result && result.status === "success") {
        axios.get(`${backendUrl}/download/${result.id}`, {
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
          setUploading(false);
          setUploaded(false);
        })
        .catch((err) => {
          console.log(err);
          setUploading(false);
          setUploaded(false);
          setError("Error cannot download the zip file");
        });
      }
    }
  }, [uploaded, result]);

  
  return (
    <>
      {uploaded ? (
        <>
        <h1>Rendered! </h1>
        <p>Downloading the Zip file</p>
        </>
      ) : uploading ? (
        <h1>Rendering...</h1>
      ) : (
        <>
          <h1>Upload your .blend file</h1>
          <input type="file" accept=".blend" />
          <button onClick={handleUpload}>Render</button>
        </>
      )}
      {
        error != "" && (
          <div>
            <h1>{error}</h1>
          </div>
        )

      }
    </>
  );
}

export default Home;