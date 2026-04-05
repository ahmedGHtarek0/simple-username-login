import { useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import { Toaster } from "@/components/ui/toaster";

const App = () => {
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null);

  if (!loggedInUser) {
    return (
      <>
        <Toaster />
        <Login onLogin={setLoggedInUser} />
      </>
    );
  }

  return (
    <>
      <Toaster />
      <Dashboard username={loggedInUser} onLogout={() => setLoggedInUser(null)} />
    </>
  );
};

export default App;
