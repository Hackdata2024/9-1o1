import React from "react";
import "../styles/Landing.css";
import Main from "../assets/main.png";
import { Link } from "react-router-dom";
function Landing() {
  const handleStart = () => {
    window.location.href = "/signup";
  };
  return (
    <div className="landing_main">
      <div className="nav">
        <div className="nav_head">
          <h1>1o1</h1>
          <p>presents</p>
        </div>
        <div>
          {/* <Link to="/login">Login</Link>
          <Link to="/signup">Sign Up</Link> */}
          <button onClick={() => (window.location.href = "/login")}>
            Login
          </button>
          <button onClick={() => (window.location.href = "/signup")}>
            Sign Up
          </button>
        </div>
      </div>
      <hr className="hor" />
      <div className="main_cont">
        <div className="main_info">
          <h2>Parallel Pilot</h2>
          <p>Empowering Computational Tasks with Peer-to-Peer Efficiency</p>
          <button onClick={handleStart}>Get Started</button>
        </div>
        <div className="img_cont">
          <img src={Main} alt="img" className="img" />
        </div>
      </div>
      {/* <div className="scroll">
        <p>Scroll Down</p>
      </div> */}

      <div className="what_cont">
        <h2>What is Parallel Pilot?</h2>
        <p>
          Parallel Pilot is a peer-to-peer computational platform designed to
          distribute heavy computational tasks across multiple workers,
          significantly reducing processing time. Our platform is designed to
          optimize computational processing and reduce time, ensuring that your
          computational tasks are processed efficiently and securely.
        </p>
      </div>

      <div className="reason_cont">
        <h2>Why Parallel Pilot?</h2>
        <div className="reason_main">
          <div className="reason">
            <h3>Cost-Effective</h3>
            <p>
              Parallel Pilot is a cost-effective solution to reduce
              computational processing time.
            </p>
          </div>
          <div className="reason">
            <h3>Distributed</h3>
            <p>
              Our platform is designed to distribute tasks across multiple
              workers, reducing processing time.
            </p>
          </div>
          <div className="reason">
            <h3>Scalable</h3>
            <p>
              Our platform is designed to scale with your computational needs.
            </p>
          </div>
          <div className="reason">
            <h3>Secure</h3>
            <p>
              We ensure that your data is secure and protected from unauthorized
              access.
            </p>
          </div>
          <div className="reason">
            <h3>Efficient</h3>
            <p>
              Our platform is designed to optimize computational processing and
              reduce time.
            </p>
          </div>
        </div>
      </div>
      <div className="working_main_cont">
        <h2>How Parallel Pilot Works?</h2>
        <div className="step_cont">
          <div className="step">
            <h3>1. Client Uploads Task</h3>
            <p>
              Upload your heavy computational task easily through our
              user-friendly interface.
            </p>
          </div>
          <div className="step">
            <h3>2. Load Balancer Optimizes Workload</h3>
            <p>
              Our intelligent load balancer efficiently distributes tasks to
              available workers.
            </p>
          </div>
          <div className="step">
            <h3>3. Worker Processing</h3>
            <p>
              Workers process tasks simultaneously, reducing processing time
              significantly.
            </p>
          </div>
          <div className="step">
            <h3>4. Results Consolidation</h3>
            <p>
              Final results are consolidated and delivered to clients, ensuring
              accelerated processing.
            </p>
          </div>
        </div>
      </div>
      <div className="architecture_main_cont">
        <h2>Architecture</h2>
        <div className="architecture_img">
          <img
            src="https://i.imgur.com/I50BdUt.png"
            alt="img"
            className="img"
          />
        </div>
      </div>
    </div>
  );
}

export default Landing;
