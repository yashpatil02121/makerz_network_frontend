import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div className="p-10">

      <h1 className="text-3xl font-bold">
        Welcome to MakerZ Network
      </h1>

      <p className="mt-4">
        {user?.email}
      </p>

      <button
        onClick={logout}
        className="mt-6 bg-red-500 text-white px-4 py-2 rounded"
      >
        Logout
      </button>

    </div>
  );
}