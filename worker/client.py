import nanoid
import socket
from constants import ACKNOWLEDGEMENT_SIZE, HEADER_SIZE, DATA_SIZE_PER_PACKET
import time
import json

class Client:
    def __init__(self, IP, port):
        self.IP = IP
        self.port = port
        self.ID = nanoid.generate(size=10)
        self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

    def wait_for_ack(self, expected_ack="ACK"):
        try:
            ack = self.socket.recv(ACKNOWLEDGEMENT_SIZE)
            return ack.decode('utf-8').strip() == expected_ack
        except socket.error as e:
            print(f"[ERROR] Failed to receive acknowledgment: {e}")
            return False

    def send_ack(self, message="ACK"):
        try:
            # print(f"[INFO] Sending acknowledgment: {message}")
            self.socket.send(message.encode('utf-8').ljust(ACKNOWLEDGEMENT_SIZE))
        except socket.error as e:
            print(f"[ERROR] Failed to send acknowledgment: {e}")
            return False
        return True

    def send_message(self, message, max_retries=3, retry_interval=1):
        try:
            # Convert message to bytes using JSON serialization
            message_json = json.dumps(message)
            message_bytes = message_json.encode('utf-8')

            # Send the size of the message
            size = len(message_bytes)
            size_data = str(size).encode('utf-8').ljust(HEADER_SIZE)
            # print(f"[INFO] Sending message of size: {size}")
            self.socket.send(size_data)
            self.socket.sendall(message_bytes)

        except socket.error as e:
            print(f"[ERROR] Failed to send message: {e}")
    
    def receive_message(self):
        try:
            size_data = self.socket.recv(HEADER_SIZE)
            if not size_data:
                print("[ERROR] Failed to receive message size data.")
                return None

            size = int(size_data.strip().decode('utf-8'))
            message_bytes = b''
            remaining_size = size
            while remaining_size > 0:
                chunk = self.socket.recv(min(DATA_SIZE_PER_PACKET, remaining_size))
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