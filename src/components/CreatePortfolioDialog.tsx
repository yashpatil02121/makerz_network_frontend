import { useState } from "react";
import { supabase } from "../lib/supabase";

interface MemberInput {
  email: string;
  role: string;
}

interface CreatePortfolioDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreatePortfolioDialog({
  isOpen,
  onClose,
  onSuccess,
}: CreatePortfolioDialogProps) {
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("public");

  const [members, setMembers] = useState<MemberInput[]>([]);

  if (!isOpen) {
    return null;
  }

  const addMember = () => {
    setMembers([
      ...members,
      {
        email: "",
        role: "Engineer",
      },
    ]);
  };

  const createPortfolio = async () => {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return;
      }

      const { data: portfolio, error } = await supabase
        .from("portfolios")
        .insert({
          name,
          description,
          visibility,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // creator becomes Product Owner
      const { error: memberError } = await supabase
        .from("portfolio_members")
        .insert({
            portfolio_id: portfolio.id,
            user_id: user.id,
            role: "Product Owner",
        });

        console.log(memberError);

      // future:
      // create invitations here

      onSuccess();

      setName("");
      setDescription("");
      setVisibility("public");
      setMembers([]);

      onClose();
    } catch (error) {
      console.error(error);
      alert("Failed to create portfolio");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

      <div className="bg-white rounded-xl w-full max-w-2xl p-6">

        <h2 className="text-2xl font-bold mb-4">
          Create Portfolio
        </h2>

        <input
          type="text"
          placeholder="Portfolio Name"
          className="w-full border rounded-lg p-3 mb-3"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <textarea
          placeholder="Description"
          className="w-full border rounded-lg p-3 mb-3"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <select
          className="w-full border rounded-lg p-3 mb-4"
          value={visibility}
          onChange={(e) => setVisibility(e.target.value)}
        >
          <option value="public">
            Public
          </option>

          <option value="private">
            Private
          </option>
        </select>

        <div className="mb-4">

          <div className="flex justify-between items-center mb-2">

            <h3 className="font-semibold">
              Members
            </h3>

            <button
              type="button"
              onClick={addMember}
              className="text-blue-600"
            >
              + Add Member
            </button>

          </div>

          {members.map((member, index) => (
            <div
              key={index}
              className="grid grid-cols-2 gap-2 mb-2"
            >

              <input
                type="email"
                placeholder="Member Email"
                className="border rounded-lg p-2"
                value={member.email}
                onChange={(e) => {
                  const updated = [...members];
                  updated[index].email = e.target.value;
                  setMembers(updated);
                }}
              />

              <select
                className="border rounded-lg p-2"
                value={member.role}
                onChange={(e) => {
                  const updated = [...members];
                  updated[index].role = e.target.value;
                  setMembers(updated);
                }}
              >
                <option>Product Owner</option>
                <option>Project Manager</option>
                <option>Designer</option>
                <option>Engineer</option>
              </select>

            </div>
          ))}

        </div>

        <div className="flex justify-end gap-3">

          <button
            onClick={onClose}
            className="border px-4 py-2 rounded-lg"
          >
            Cancel
          </button>

          <button
            onClick={createPortfolio}
            disabled={loading}
            className="bg-black text-white px-4 py-2 rounded-lg"
          >
            {loading
              ? "Creating..."
              : "Create Portfolio"}
          </button>

        </div>

      </div>

    </div>
  );
}