# server.py
import socket
import threading
from constants import ACKNOWLEDGEMENT_SIZE, HEADER_SIZE, PORT, DATA_SIZE_PER_PACKET
import time
from queue import Queue
from threading import Lock
import nanoid
import json
import base64
import os

class Server:
    def __init__(self, IP, port):
        self.IP = IP
        self.PORT = port
        self.workers = {}
        self.worker_status = {}
        self.commanders = {}
        self.commander_status = {}

        self.assigned_tasks = {}

        self.server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.server_socket.bind((self.IP, self.PORT))
        self.message_queue = Queue()

        self.result_queues = [Queue() for _ in range(2)]
        self.present_queue = 0

        self.all_messages = {}

        self.result_lengths = {}
        self.result_sent_lengths = {}

        self.lock = Lock()
        # self.result_lock = Lock()

    def start(self):
        self.server_socket.listen()
        print(f"[INFO] Server listening on {self.IP}:{self.PORT}")
        threading.Thread(target=self.handle_result_queue).start()

        threading.Thread(target=self.order_messages).start()
        # threading.Thread(target=self.worker_health_check).start()
        while True:
            client_socket, client_address = self.server_socket.accept()
            # self.send_ack(client_socket, "CONNECTED")  # Send acknowledgment for connection establishment
            client_type = self.receive_message(client_socket)
            # self.send_ack(client_socket)  # Send acknowledgment for client type receipt

            if client_type == "worker":
                worker_id = self.receive_message(client_socket)
                # self.send_ack(client_socket)
                # self.lock.acquire()
                self.workers[worker_id] = (client_socket, client_address)
                self.worker_status[worker_id] = "idle"
                # self.lock.release()
                print(f"[INFO] Worker {worker_id} connected to server")

                threading.Thread(target=self.handle_worker_send, args=(client_socket, worker_id)).start()
                # threading.Thread(target=self.handle_worker_receive, args=(client_socket, client_address, worker_id)).start()

            elif client_type == "commander":
                threading.Thread(target=self.handle_commander, args=(client_socket, client_address)).start()


    def handle_worker_send(self, worker_socket, worker_id):
        while True:
            if self.worker_status[worker_id] == "busy":
                continue

            # self.lock.acquire()
            if not self.message_queue.empty():
                message = self.message_queue.get()
                # print(f"[INFO] Message removed from message queue")
                self.assigned_tasks[worker_id] = message
                self.send_message(message, worker_socket)
                self.worker_status[worker_id] = "busy"
                # print(f"[INFO] Message sent to worker {worker_address}")
                self.handle_worker_receive(worker_socket, worker_id, message["commander_id"], message["message"]["start_frame"], message["message"]["end_frame"])
            # self.lock.release()

    def handle_worker_receive(self, worker_socket, worker_id, commander_id, start_frame, end_frame):
        i = 0
        while i < end_frame - start_frame + 1:
            message = self.receive_message(worker_socket)
            if message is None:
                break
            self.worker_status[worker_id] = "idle"
            message["commander_id"] = commander_id
            # self.result_queues[self.present_queue].put(message)
            # self.present_queue = (self.present_queue + 1) % 2
            with self.lock:
                if self.result_queues[self.present_queue].qsize() > 30:
                    self.present_queue = (self.present_queue + 1) % 2
                self.result_queues[self.present_queue].put(message)            
            # self.result_queue.put(message)
            # print(self.result_queue.qsize())
            i += 1
        

    def handle_commander(self, commander_socket, commander_address):
        # print(f"[INFO] Connection established with commander {commander_address}")
        commander_id = self.receive_message(commander_socket)
        # self.lock.acquire()
        # self.commanders.append((commander_socket, commander_address, commander_id))
        self.commanders[commander_id] = (commander_socket, commander_address)
        self.commander_status[commander_id] = "idle"
        print(f"[INFO] Commander {commander_id} connected to server")
        # print(f"[INFO] Commander {commander_id} connected to server")
        # self.lock.release()

        while True:
            if self.commander_status[commander_id] == "busy":
                continue
            try:
                message = self.receive_message(commander_socket)
            except:
                print(f"[INFO] Commander {commander_id} disconnected from server")
                break
            if message is None:
                break
            # print(f"[INFO] Message received from commander {commander_id}: {message}")
            input_file = message["file"]
            input_file = base64.b64decode(input_file)
            file_name = message["file_name"]
            #create folder
            if not os.path.exists('server_blend_files'):
                os.makedirs('server_blend_files')
            if not os.path.exists(f'server_blend_files/{commander_id}'):
                os.makedirs(f'server_blend_files/{commander_id}')
            #save file
            f = open(f"server_blend_files/{commander_id}/{file_name}", "wb")
            f.write(input_file)
            f.close()
            print(f"[INFO] File received from commander {commander_id}")

            no_of_frames = message["end_frame"] - message["start_frame"] + 1
            self.all_messages[commander_id] = Queue()
            self.result_lengths[commander_id] = no_of_frames
            self.result_sent_lengths[commander_id] = 0
            # no_of_chunks = 10
            no_of_chunks = len(self.workers) 
            task_id = nanoid.generate(size=10)
            message["task_id"] = task_id
            # self.send_message(no_of_chunks, commander_socket)
            for i in range(no_of_chunks):
                start_frame = message["start_frame"] + i * (no_of_frames // no_of_chunks)
                end_frame = message["start_frame"] + (i + 1) * (no_of_frames // no_of_chunks) - 1
                if i == no_of_chunks - 1:
                    end_frame = message["end_frame"]
                message_to_send = message.copy()
                message_to_send["start_frame"] = start_frame
                message_to_send["end_frame"] = end_frame
                self.add_message_to_queue(message_to_send, commander_id, i)
            self.commander_status[commander_id] = "busy"
  
                
        
    def receive_message(self, connection):
        try:
            size_data = connection.recv(HEADER_SIZE)
            if not size_data:
                print("[ERROR] Failed to receive message size data.")
            #     return None
            # print(f"[INFO] Message size data received successfully. Waiting for message size... {size_data}")
            size = int(size_data.strip().decode('utf-8'))
            # print(f"[INFO] Message size received successfully. Waiting for message... {size}")
            # message_bytes = connection.recv(size)
            message_bytes = b''
            remaining_size = size
            while remaining_size > 0:
                chunk = connection.recv(min(DATA_SIZE_PER_PACKET, remaining_size))
                if not chunk:
                    print("[ERROR] Failed to receive message chunk.")
                    return None
                message_bytes += chunk
                remaining_size -= len(chunk)
            message_json = message_bytes.decode('utf-8')
            message = json.loads(message_json)  # Decode the JSON message

            return message

        except socket.error as e:
            print(f"[ERROR] Failed to receive message: {e}")
            return None

    def send_message(self, message, conn, max_retries=3, retry_interval=1):
        try:
            # Convert message to bytes using JSON serialization
            message_json = json.dumps(message)
            message_bytes = message_json.encode('utf-8')

            # Send the size of the message
            size = len(message_bytes)
            # print(f"[INFO] Sending message of size: {size}")
            size_data = str(size).encode('utf-8').ljust(HEADER_SIZE)
            # print(f"[INFO] Sending message of size: {len(size_data)}")
            conn.send(size_data)
            conn.sendall(message_bytes)
            # print(f"[INFO] Message size sent successfully. Waiting for acknowledgment...")

            # Receive acknowledgment for the size
            # if not self.wait_for_ack(conn):
            #     print("[ERROR] Failed to send message size acknowledgment")
            #     return

            # Send the message in chunks with retries
            # chunk_size = DATA_SIZE_PER_PACKET
            # count = 0
            # remaining_size = size
            # for i in range(0, size, chunk_size):
            #     if remaining_size < chunk_size:
            #         chunk_size = remaining_size
            #     chunk = message_bytes[i:i + chunk_size]
            #     remaining_size -= chunk_size
            #     # count += 1
            #     conn.send(chunk)
                # print(f"[INFO] Chunk {count} sent successfully")
                # Receive acknowledgment for the chunk
                # if not self.wait_for_ack(conn):
                    # print("[ERROR] Failed to send message chunk acknowledgment. Retrying...")
                    # Retry sending the chunk
                    # for retry_count in range(max_retries):
                    #     time.sleep(retry_interval)
                    #     conn.send(chunk)
                    #     if self.wait_for_ack(conn):
                    #         break
                    # else:
                    #     print("[ERROR] Maximum retries reached. Failed to send message chunk.")
                    #     return

            # print(f"[INFO] Message sent successfully.")

        except socket.error as e:
            print(f"[ERROR] Failed to send message: {e}")

    def send_ack(self, conn, message="ACK"):
        try:
            ack_message = message.encode('utf-8').ljust(ACKNOWLEDGEMENT_SIZE)
            conn.send(ack_message)
        except socket.error as e:
            print(f"[ERROR] Failed to send acknowledgment: {e}")

    def wait_for_ack(self, conn, expected_ack="ACK"):
        try:
            # print(f"[INFO] Waiting for acknowledgment: {expected_ack}")
            ack = conn.recv(ACKNOWLEDGEMENT_SIZE)
            return ack.decode('utf-8').strip() == expected_ack
        except socket.error as e:
            print(f"[ERROR] Failed to receive acknowledgment: {e}")
            return False

s = Server("0.0.0.0", port=PORT)
s.start()