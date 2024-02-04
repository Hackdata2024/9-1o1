import { Route } from "react-router-dom";
import Home from "./pages/Home";
import Renders from "./pages/Renders";
import { Routes, useNavigate } from "react-router-dom";
import {
  ClerkProvider,
  RedirectToSignIn,
  RedirectToSignUp,
  SignedIn,
  SignedOut,
  SignIn,
  SignUp,
} from "@clerk/clerk-react";
import variables from "./config/index";
import Landing from "./pages/Landing";

const clerkPubKey = variables.VITE_CLERK_PUBLISHABLE_KEY;

function App() {
  const navigate = useNavigate();
  return (
    <ClerkProvider publishableKey={clerkPubKey} navigate={(to) => navigate(to)}>
      <SignedIn>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/renders" element={<Renders />} />
        </Routes>
      </SignedIn>
      <SignedOut>
        {/* <RedirectToSignIn /> */}
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<RedirectToSignIn />} />
          <Route path="/signup" element={<RedirectToSignUp />} />
        </Routes>
      </SignedOut>
    </ClerkProvider>
  );
}
export default App;
