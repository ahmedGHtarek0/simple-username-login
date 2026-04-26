import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import { Toaster } from "@/components/ui/toaster";

const App = () => {
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("loggedInUser");
    if (stored) setLoggedInUser(stored);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    setLoggedInUser(null);
  };

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
      <Dashboard username={loggedInUser} onLogout={handleLogout} />
    </>
  );
};

export default App;
