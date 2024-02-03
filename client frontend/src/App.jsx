import { Route } from "react-router-dom";
import Home from "./pages/Home";
import { Routes, useNavigate } from "react-router-dom";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  RedirectToSignIn,
} from "@clerk/clerk-react";
import variables from "./config/index";
import "./App.css";

const clerkPubKey = variables.VITE_CLERK_PUBLISHABLE_KEY;

function App() {
  const navigate = useNavigate();
  return (
    <ClerkProvider publishableKey={clerkPubKey} navigate={(to) => navigate(to)}>
      <SignedIn>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </ClerkProvider>
  );
}
export default App;