from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from client import Client
from constants import PORT
import time
import base64
import os
import uvicorn
import threading
from fastapi.responses import StreamingResponse
from fastapi import HTTPException
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from sqlalchemy import select
from models import Render

load_dotenv()

app = FastAPI()

# turso init
TURSO_DB_URL = os.environ.get("TURSO_DB_URL")
TURSO_DB_AUTH_TOKEN = os.environ.get("TURSO_DB_AUTH_TOKEN")
dbUrl = f"sqlite+{TURSO_DB_URL}/?authToken={TURSO_DB_AUTH_TOKEN}&secure=true"
engine = create_engine(dbUrl, connect_args={'check_same_thread': False}, echo=True)

# @app.route("/", methods=(["GET"]))
# def home():
#     session = Session(engine)

#     # get & print items
#     stmt = select(Item)

#     for item in session.scalars(stmt):
#         print(item)

class Commander(Client):
    def __init__(self, IP, port):
        super().__init__(IP, port)
        self.type = "commander"
        self.socket.connect((self.IP, self.port))
        self.send_message(self.type)
        self.send_message(self.ID)
        print(f"[INFO] Client {self.ID} connected to server")
        self.no_of_frames = 0
        # self.start_message_loop()
                

    def message_server(self, file):
        print(f"[INFO] Sending file to server")
        start = time.time()
        start_frame = 1
        end_frame = 10
        message = {
            # "file": file,
            "file_name": "balls.blend",
            "file": base64.b64encode(file).decode('utf-8'),
            "start_frame": start_frame,
            "end_frame": end_frame,
            }
        # send file
        self.send_message(message)
        print(f"[INFO] File sent to server")


        output_folder = "commander_output"
        if not os.path.exists(output_folder):
            os.mkdir(output_folder)
        
        self.no_of_frames = end_frame - start_frame + 1
        message = self.receive_message()
        if message is None:
            return False
        if message["message"] == "rendered":
            end = time.time()
            print(f"[INFO] Rendered {end_frame} frames in {end - start} seconds")
            message = self.receive_message()
            if message is None:
                return False
            zip_file = message["file"]
            file_name = message["file_name"]
            
            if not os.path.exists(f"{output_folder}/{self.ID}"):
                os.mkdir(f"{output_folder}/{self.ID}")

            # saving zip file
            f = open(f"{output_folder}/{self.ID}/{file_name}", "wb")
            f.write(base64.b64decode(zip_file))
            f.close()
            return f"{output_folder}/{self.ID}/{file_name}"             
        else:
            return False


# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Add your frontend origin here
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



class uploadData:
    file: UploadFile = File(...)
    no_of_frames: int
    user_id: str

# Define the endpoint for file upload
@app.post("/upload")
async def upload_file(data : uploadData):
    try:
        # Access the uploaded file using file.filename and file.file.read()
        # For now, we are just logging the file details
        print('Received file:', data.file.filename)
        file_content = await data.file.read()
        print('File size:', len(file_content))
        # Send the file to the server
        c = Commander("0.0.0.0", PORT)
        id = c.ID
        
        session = Session(engine)
        render = Render(userid=data.user_id, commanderid=id, no_of_frames=data.no_of_frames, projectName=data.file.filename, status="rendering")
        session.add(render)

        result = c.message_server(file_content)

        

        if result:
            session = Session(engine)
            render = Render(userid=data.user_id, commanderid=id, no_of_frames=data.no_of_frames, projectName=data.file.filename, status="rendered")
            session.add(render)

            return {"status": "success", "id": id}
        else:
            return {"status": "failure"}
    except Exception as e:
        print(e)
        return {"status":"failure","error": "Internal Server Error"}


@app.get("/download/{id}")
async def download_file(id: str):
    try:
        # Access the uploaded file using file.filename and file.file.read()
        # For now, we are just logging the file details
        print('Received file:', id)
        # Send the file to the server
        output_folder = "commander_output"
        if not os.path.exists(output_folder):
            os.mkdir(output_folder)
        file_path = f"{output_folder}/{id}/results.zip"

        if os.path.exists(file_path):
            return StreamingResponse(open(file_path, "rb"), media_type="application/zip", headers={"Content-Disposition": f"attachment; filename={id}_results.zip"})
        else:
            raise HTTPException(status_code=404, detail="File not found")

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Internal Server Error")


# Run the server
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=3000)