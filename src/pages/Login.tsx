import { supabase } from "../lib/supabase";

export default function Login() {
  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
        redirectTo: `${window.location.origin}/portfolios`,
        },
    });
};

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">

      <div className="bg-white p-10 rounded-xl shadow-lg">

        <h1 className="text-3xl font-bold mb-6 text-center">
          MakerZ Network
        </h1>

        <button
          onClick={signInWithGoogle}
          className="bg-black text-white px-6 py-3 rounded-lg w-full"
        >
          Continue with Google
        </button>

      </div>
    </div>
  );
}