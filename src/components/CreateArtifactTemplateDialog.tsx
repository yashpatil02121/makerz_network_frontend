import { useState } from "react";
import { supabase } from "../lib/supabase";

interface TemplateSection {
  section_name: string;
}

interface CreateArtifactTemplateDialogProps {
  isOpen: boolean;
  portfolioId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateArtifactTemplateDialog({
  isOpen,
  portfolioId,
  onClose,
  onSuccess,
}: CreateArtifactTemplateDialogProps) {

  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [targetRole, setTargetRole] =
    useState("Software Engineer");

  const [sections, setSections] = useState<
    TemplateSection[]
  >([
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

  const createTemplate = async () => {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return;
      }

      const { data: template, error } =
        await supabase
          .from("artifact_templates")
          .insert({
            portfolio_id: portfolioId,
            name,
            description,
            target_role: targetRole,
            created_by: user.id,
          })
          .select()
          .single();

      if (error) {
        throw error;
      }

      const sectionRecords = sections
        .filter(
          (section) =>
            section.section_name.trim() !== ""
        )
        .map((section, index) => ({
          template_id: template.id,
          section_name: section.section_name,
          section_order: index + 1,
        }));

      if (sectionRecords.length > 0) {
        const { error: sectionError } =
          await supabase
            .from(
              "artifact_template_sections"
            )
            .insert(sectionRecords);

        if (sectionError) {
          throw sectionError;
        }
      }

      setName("");
      setDescription("");
      setTargetRole("Software Engineer");

      setSections([
        {
          section_name: "",
        },
      ]);

      onSuccess();
      onClose();

    } catch (error) {
      console.error(error);
      alert("Failed to create template");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

      <div className="bg-white rounded-xl w-full max-w-3xl p-6">

        <h2 className="text-2xl font-bold mb-4">
          Create Artifact Template
        </h2>

        <input
          type="text"
          placeholder="Template Name"
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
          className="w-full border rounded-lg p-3 mb-3"
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) =>
            setDescription(e.target.value)
          }
          className="w-full border rounded-lg p-3 mb-3"
        />

        <select
          value={targetRole}
          onChange={(e) =>
            setTargetRole(e.target.value)
          }
          className="w-full border rounded-lg p-3 mb-4"
        >
          <option>
            Product Owner
          </option>

          <option>
            Project Manager
          </option>

          <option>
            Designer
          </option>

          <option>
            Software Engineer
          </option>
        </select>

        <div className="mb-4">

          <div className="flex justify-between mb-2">

            <h3 className="font-semibold">
              Template Sections
            </h3>

            <button
              type="button"
              onClick={addSection}
              className="text-blue-600"
            >
              + Add Section
            </button>

          </div>

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
                className="w-full border rounded-lg p-2 mb-2"
              />
            )
          )}

        </div>

        <div className="flex justify-end gap-3">

          <button
            onClick={onClose}
            className="border px-4 py-2 rounded-lg"
          >
            Cancel
          </button>

          <button
            onClick={createTemplate}
            disabled={loading}
            className="bg-black text-white px-4 py-2 rounded-lg"
          >
            {loading
              ? "Creating..."
              : "Create Template"}
          </button>

        </div>

      </div>

    </div>
  );
}