### Project Name - `Parallel Pilot`

# Hackdata

### Team Name - 1o1


## Problem Statement

Not everyone has the resources to perform heavy computational tasks (like 3D Rendering, Deep
Learning, Simulations, etc.): Developing a peer-to-peer resource sharing software that distributes
tasks to multiple clients to increase efficiency and decrease processing time.

## Solution


### Solution Description

- We created a peer-to-peer resource sharing system that takes the workload off a client
and distributes it to workers in the network, which process these tasks simultaneously
there by decreasing the processing time(rendering time, model training time, etc.)
- There are Clients and workers connected to the server. When a client shares a task to be
processed, for example, take a 3d animation with 1200 frames.
- This task is sent to the server, which in turn distributes the workload to available
workers, for example take there are 30 workers, where each worker would get a task to
render 40 frames.
- After each worker completed their respective tasks, all the results are gathered at the
server and sent to the respective client.
- Instead of a single client rendering 1200 frames, each worker will only have to render 40
frames, which decreases the rendering time drastically(30 times faster in this case).
- This can also be implemented for training deep neural networks, which brings down the
training time from multiple days to few hours.

### Architecture

![Architecture](https://i.imgur.com/I50BdUt.png)

### Components

1. **Client**: The client is the user who wants to perform a heavy computational task. The client
   will be able to upload the task to the server and will be able to monitor the progress of the
   task.
   - **Client UI**: The client will have a user interface to upload the task to the server and to
     monitor the progress of the task.
   - **Client API**: The client will have an API to communicate with the server. The client will be
     able to upload the task to the server and will be able to monitor the progress of the task.
2. **Load Balancer**: The load balancer will be used to distribute the tasks to the workers. The
   load balancer will be able to distribute the tasks to the workers based on the availability of the
   workers.
3. **Worker**: The worker is the client who has the resources to perform the heavy computational
   tasks. The worker will be able to receive the tasks from the server and will be able to perform
   the tasks. The worker will also be able to update the server about the progress of the tasks.
4. **Database**: The database will be used to store the tasks and the progress of the tasks. The
   database will be used by the server to store the tasks and the progress of the tasks. The
   database will also be used by the clients to monitor the progress of the tasks.

## Tech Stack

- Server side
  - FastAPI for handling Client requests
  - Sockets for task assignment and other communications
  - File blobs for task and result storage
- Worker side
  - Socket tools for communication
  - Threading architecture for multiprocessing
- Website
  - ReactJS
  - Vanilla CSS
- Database
  - MySQL for task and result storage (local)
  - Clerk for user authentication


## Future Scope

- Integrating a jupyter notebook with cloud storage to store the datasets,
models and other program files to work on the go.
- Implementing a remote kernel so that clients can use the service from
their favourite IDEs
- We can add a feature to the client to select the workers based on the resources available
  (like GPU, CPU, etc.)


## Running the project

- Clone the repository
- Install the required packages using `pip install -r requirements.txt`

- Load Balancer
  - `cd "load balancer"`
  - `python app.py` or `python3 app.py` to start the load balancer

- Worker
  - `cd worker`
  - `python app.py` or `python3 app.py` to start the worker

- website
  - `cd "client frontend"`
  - `npm install` to install the required packages
  - `npm run dev` to start the website

- client backend
  - `cd "client backend"`
  - `mkdir commander_output` to create a directory for the task results
  - `python app.py` or `python3 app.py` to start the client backend


### Note: Please update the constants and urls before running the project

### Note: For Workers update the blender_path in the app.py file to the path of the blender executable in your system

### Team Members ( 1o1 )

1. [Pavan Manish](github.com/pavanmanishd)
2. [Sai Vishal](github.com/Vishal0129)
3. [Vinay Teja](github.com/vinaymamidala)
4. [Dhanush](github.com/dhanushkunchakuri)