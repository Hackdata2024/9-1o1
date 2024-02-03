# server.py
import socket
import threading
from server.constants import ACKNOWLEDGEMENT_SIZE, HEADER_SIZE, PORT, DATA_SIZE_PER_PACKET
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


    def receive_message(self, connection):
        try:
            size_data = connection.recv(HEADER_SIZE)
            if not size_data:
                print("[ERROR] Failed to receive message size data.")
            #     return None
            # print(f"[INFO] Message size data received successfully. Waiting for message size... {size_data}")
            size = int(size_data.strip().decode('utf-8'))
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