import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Home from "./pages/Home";
import PortfolioPage from "./pages/PortfolioPage";
import ProtectedRoute from "./components/ProtectedRoute";
import PortfolioDetailsPage from "./pages/PortfolioDetailsPage";

import { supabase } from "./lib/supabase";

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>

        {/* Login Page */}
        <Route
          path="/"
          element={
            user
              ? <Navigate to="/home" replace />
              : <Login />
          }
        />

        {/* Portfolio Selection */}
        <Route
          path="/portfolios"
          element={
            <ProtectedRoute user={user}>
              <PortfolioPage />
            </ProtectedRoute>
          }
        />

        {/* Dashboard */}
        <Route
          path="/home"
          element={
            <ProtectedRoute user={user}>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/portfolios/:portfolioId"
          element={
            <ProtectedRoute user={user}>
              <PortfolioDetailsPage />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;