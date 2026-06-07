import { useState } from "react";
import { supabase } from "../lib/supabase";

interface ConfirmDeleteDialogProps {
  isOpen: boolean;
  tableName: string;
  recordId: string;
  recordName?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ConfirmDeleteDialog({
  isOpen,
  tableName,
  recordId,
  recordName,
  onClose,
  onSuccess,
}: ConfirmDeleteDialogProps) {
  const [loading, setLoading] =
    useState(false);

  if (!isOpen) {
    return null;
  }

  const handleDelete = async () => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq("id", recordId);

      if (error) {
        throw error;
      }

      onSuccess();
      onClose();

    } catch (error) {
      console.error(error);
      alert("Failed to delete record");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

      <div className="bg-white rounded-xl p-6 w-full max-w-md">

        <h2 className="text-xl font-bold mb-3">
          Delete Record
        </h2>

        <p className="text-gray-600">

          Are you sure you want to delete

          <span className="font-semibold">
            {" "}
            {recordName || "this record"}
          </span>

          ?

        </p>

        <p className="text-red-600 text-sm mt-2">
          This action cannot be undone.
        </p>

        <div className="flex justify-end gap-3 mt-6">

          <button
            onClick={onClose}
            className="border px-4 py-2 rounded-lg"
          >
            Cancel
          </button>

          <button
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 text-white px-4 py-2 rounded-lg"
          >
            {loading
              ? "Deleting..."
              : "Delete"}
          </button>

        </div>

      </div>

    </div>
  );
}