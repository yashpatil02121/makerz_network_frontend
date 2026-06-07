import { useState } from "react";
import { supabase } from "../lib/supabase";

interface JoinPortfolioDialogProps {
  isOpen: boolean;
  portfolioId: string;
  portfolioName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function JoinPortfolioDialog({
  isOpen,
  portfolioId,
  portfolioName,
  onClose,
  onSuccess,
}: JoinPortfolioDialogProps) {
  const [loading, setLoading] = useState(false);

  const [role, setRole] = useState("Software Engineer");

  if (!isOpen) {
    return null;
  }

  const joinPortfolio = async () => {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return;
      }

      const { error } = await supabase
        .from("portfolio_members")
        .insert({
          portfolio_id: portfolioId,
          user_id: user.id,
          role,
        });

      if (error) {
        throw error;
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Failed to join portfolio");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

      <div className="bg-white rounded-xl w-full max-w-md p-6">

        <h2 className="text-2xl font-bold mb-2">
          Join Portfolio
        </h2>

        <p className="text-gray-600 mb-4">
          Are you sure you want to join
          <span className="font-semibold">
            {" "}{portfolioName}
          </span>
          ?
        </p>

        <label className="block mb-2 font-medium">
          Join As
        </label>

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full border rounded-lg p-3 mb-6"
        >
          <option value="Software Engineer">
            Software Engineer
          </option>

          <option value="Designer">
            Designer
          </option>
        </select>

        <div className="flex justify-end gap-3">

          <button
            onClick={onClose}
            className="border px-4 py-2 rounded-lg"
          >
            Cancel
          </button>

          <button
            onClick={joinPortfolio}
            disabled={loading}
            className="bg-black text-white px-4 py-2 rounded-lg"
          >
            {loading
              ? "Joining..."
              : "Join Portfolio"}
          </button>

        </div>

      </div>

    </div>
  );
}