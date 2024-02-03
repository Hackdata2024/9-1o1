from client import Client
from constants import PORT
import time
import base64
import os

class Commander(Client):
    def __init__(self, IP, port):
        super().__init__(IP, port)
        self.type = "commander"
        self.socket.connect((self.IP, self.port))
        self.send_message(self.type)
        self.send_message(self.ID)
        print(f"[INFO] Client {self.ID} connected to server")
        self.no_of_frames = 0

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
