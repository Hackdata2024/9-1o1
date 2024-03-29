from fastapi import FastAPI, File, UploadFile, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from client import Client
from constants import PORT
import time
import base64
import os
import uvicorn
import threading
from fastapi.responses import StreamingResponse, HTMLResponse
from fastapi import HTTPException
from starlette.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.responses import StreamingResponse
from pathlib import Path

import mysql.connector


db_config = {
    'host': 'localhost',
    'user': 'pavan',
    'password': 'Vishalsai@123',
    'database': 'hackdata'
}



app = FastAPI()

rendered = dict()
is_rendered = dict()
total_frames = dict()

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
                

    def message_server(self, file, no_of_frames,fps):
        print(f"[INFO] Sending file to server")
        start = time.time()
        start_frame = 1
        end_frame = int(no_of_frames)
        message = {
            # "file": file,
            "file_name": "balls.blend",
            "file": base64.b64encode(file).decode('utf-8'),
            "start_frame": start_frame,
            "end_frame": end_frame,
            "fps": int(fps)
            }
        # send file
        self.send_message(message)
        print(f"[INFO] File sent to server")


        output_folder = "commander_output"
        if not os.path.exists(output_folder):
            os.mkdir(output_folder)
        
        self.no_of_frames = end_frame - start_frame + 1
        print(f"[INFO] Waiting for server to render {self.no_of_frames} frames")

        rendered[self.ID] = 0
        total_frames[self.ID] = self.no_of_frames
        while rendered[self.ID] < self.no_of_frames:
            message = self.receive_message()
            if message is None:
                return False
            if message["message"] == "frame_rendered":
                rendered[self.ID] += 1
                
                print(f"[INFO] Frame {rendered[self.ID]} rendered out of {self.no_of_frames}frames", end="\r")
            else:
                return False

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

            video = message["video"]
            video_name = message["video_name"]
            
            if not os.path.exists(f"{output_folder}/{self.ID}"):
                os.mkdir(f"{output_folder}/{self.ID}")

            # saving zip file
            f = open(f"{output_folder}/{self.ID}/{file_name}", "wb")
            f.write(base64.b64decode(zip_file))
            f.close()
            
            # saving video
            f = open(f"{output_folder}/{self.ID}/{video_name}", "wb")
            f.write(base64.b64decode(video))
            f.close()
            
            
            is_rendered[self.ID] = True

            # return f"{output_folder}/{self.ID}/{file_name}"   
            return True         
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



# class uploadData(BaseModel):
#     # file: UploadFile = File(...)
#     no_of_frames: str
#     user_id: str

@app.post("/upload/{user_id}/{no_of_frames}/{fps}/{project_name}")
async def upload_file(
    file: UploadFile = File(...),
    user_id: str = None,
    no_of_frames: str = 0,
    fps: str = 24,
    project_name: str = "default"
):
    try:
        file_content = await file.read()

        c = Commander("10.8.23.226", PORT)
        id = c.ID
        is_rendered[id] = False
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()
        cursor.execute(f"INSERT INTO renders (user_id,commander_id, no_of_frames,project_name,status) VALUES ('{user_id}', '{id}', {no_of_frames}, '{project_name}', 'rendering')")
        connection.commit()

        # result = c.message_server(file_content,no_of_frames,fps)
        thread = threading.Thread(target=c.message_server, args=(file_content, no_of_frames, fps))
        # thread.daemon = True
        thread.start()
        return {"status":"success", "id": id}

    except Exception as e:
        print(e)
        return {"status": "failure", "error": "Internal Server Error"}


app.mount("/commander_output", StaticFiles(directory="commander_output"), name="commander_output")

@app.get("/download/{id}")
async def download_file(id: str):
    zip_file_path = Path("commander_output") / id / "results.zip"
    def generate():
        with open(zip_file_path, "rb") as file:
            yield from file

    response = StreamingResponse(generate(), media_type="application/zip")
    response.headers["Content-Disposition"] = f'attachment; filename="results_{id}.zip"'
    return response

@app.get("/download/video/{id}")
async def download_video(id: str):
    video_file_path = Path("commander_output") / id / "results.mp4"
    def generate():
        with open(video_file_path, "rb") as file:
            yield from file

    response = StreamingResponse(generate(), media_type="video/mp4")
    response.headers["Content-Disposition"] = f'attachment; filename="video_{id}.mp4"'
    return response


@app.get("/renders/{user_id}")
async def get_renders(user_id: str):
    try:
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()
        cursor.execute(f"SELECT * FROM renders WHERE user_id='{user_id}'")
        result = cursor.fetchall()
        return result
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Internal Server Error")


@app.websocket("/ws/{commander_id}")
async def websocket_endpoint(websocket: WebSocket, commander_id: str):
    await websocket.accept()
    try:
        while True:
            if is_rendered.get(commander_id, False):
                connection = mysql.connector.connect(**db_config)
                cursor = connection.cursor()
                cursor.execute(f"UPDATE renders SET status='rendered' WHERE commander_id='{commander_id}'")
                connection.commit()
                await websocket.send_text("rendered")
                break
            await websocket.send_text(str(rendered.get(commander_id, 0))+"/"+str(total_frames.get(commander_id, 0)))
    except WebSocketDisconnect:
        pass
    finally:
        await websocket.close()
# Run the server
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=3000)