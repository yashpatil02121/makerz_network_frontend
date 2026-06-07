import { useState } from "react";
import { supabase } from "../lib/supabase";

interface SectionInput {
  section_name: string;
}

interface AddTemplateSectionsDialogProps {
  isOpen: boolean;
  templateId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddTemplateSectionsDialog({
  isOpen,
  templateId,
  onClose,
  onSuccess,
}: AddTemplateSectionsDialogProps) {
  const [loading, setLoading] = useState(false);

  const [sections, setSections] =
    useState<SectionInput[]>([
      {
        section_name: "",
      },
    ]);

  if (!isOpen) {
    return null;
  }

  const addSection = () => {
    setSections([
      ...sections,
      {
        section_name: "",
      },
    ]);
  };

  const saveSections = async () => {
    try {
      setLoading(true);

      const { data: existingSections } =
        await supabase
          .from("artifact_template_sections")
          .select("section_order")
          .eq("template_id", templateId)
          .order("section_order", {
            ascending: false,
          })
          .limit(1);

      const lastOrder =
        existingSections?.[0]?.section_order || 0;

      const records = sections
        .filter(
          (section) =>
            section.section_name.trim() !== ""
        )
        .map((section, index) => ({
          template_id: templateId,
          section_name: section.section_name,
          section_order:
            lastOrder + index + 1,
        }));

      if (records.length === 0) {
        return;
      }

      const { error } = await supabase
        .from(
          "artifact_template_sections"
        )
        .insert(records);

      if (error) {
        throw error;
      }

      setSections([
        {
          section_name: "",
        },
      ]);

      onSuccess();
      onClose();

    } catch (error) {
      console.error(error);
      alert("Failed to create sections");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

      <div className="bg-white rounded-xl w-full max-w-2xl p-6">

        <h2 className="text-2xl font-bold mb-4">
          Add Template Sections
        </h2>

        <div className="space-y-2">

          {sections.map(
            (section, index) => (
              <input
                key={index}
                type="text"
                placeholder={`Section ${index + 1}`}
                value={section.section_name}
                onChange={(e) => {
                  const updated = [
                    ...sections,
                  ];

                  updated[
                    index
                  ].section_name =
                    e.target.value;

                  setSections(updated);
                }}
                className="w-full border rounded-lg p-3"
              />
            )
          )}

        </div>

        <button
          onClick={addSection}
          className="mt-4 text-blue-600"
        >
          + Add Section
        </button>

        <div className="flex justify-end gap-3 mt-6">

          <button
            onClick={onClose}
            className="border px-4 py-2 rounded-lg"
          >
            Cancel
          </button>

          <button
            onClick={saveSections}
            disabled={loading}
            className="bg-black text-white px-4 py-2 rounded-lg"
          >
            {loading
              ? "Saving..."
              : "Save Sections"}
          </button>

        </div>

      </div>

    </div>
  );
}