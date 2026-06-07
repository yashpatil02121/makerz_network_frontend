import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

interface TemplateSection {
  id: string;
  section_name: string;
  section_order: number;
  description: string;
  required: boolean;
}

interface Template {
  id: string;
  portfolio_id: string;
  name: string;
}

export default function CreateArtifactPage() {

  const navigate = useNavigate();

  const { templateId } =
    useParams();

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [template,
    setTemplate] =
    useState<Template | null>(null);

  const [artifactTitle,
    setArtifactTitle] =
    useState("");

  const [sections,
    setSections] =
    useState<TemplateSection[]>([]);

  const [sectionValues,
    setSectionValues] =
    useState<Record<string, string>>(
      {}
    );

  useEffect(() => {
    loadData();
  }, [templateId]);

  const loadData = async () => {

    setLoading(true);

    const { data: templateData } =
      await supabase
        .from("artifact_templates")
        .select("*")
        .eq("id", templateId)
        .single();

    const { data: sectionsData } =
      await supabase
        .from(
          "artifact_template_sections"
        )
        .select("*")
        .eq(
          "template_id",
          templateId
        )
        .order(
          "section_order"
        );

    setTemplate(templateData);

    setSections(
      sectionsData || []
    );

    setLoading(false);
  };

  const createArtifact =
    async () => {

      try {

        setSaving(true);

        const {
          data: { user },
        } =
          await supabase.auth.getUser();

        if (!user || !template) {
          return;
        }

        const {
          data: artifact,
          error,
        } = await supabase
          .from("artifacts")
          .insert({
            portfolio_id:
              template.portfolio_id,

            template_id:
              template.id,

            title:
              artifactTitle,

            created_by:
              user.id,
          })
          .select()
          .single();

        if (error) {
          throw error;
        }

        const artifactSections =
          sections.map(
            (
              section
            ) => ({
              artifact_id:
                artifact.id,

              template_section_id:
                section.id,

              content:
                sectionValues[
                  section.id
                ] || "",

              created_by:
                user.id,
            })
          );

        await supabase
          .from(
            "artifact_sections"
          )
          .insert(
            artifactSections
          );

        navigate(
          `/artifact-templates/${template.id}/artifacts`
        );

      } catch (error) {

        console.error(
          error
        );

        alert(
          "Failed to create artifact"
        );
      } finally {
        setSaving(false);
      }
    };

  if (loading) {
    return (
      <div className="p-10">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">

      <div className="max-w-5xl mx-auto p-8">

        <div className="bg-white rounded-xl shadow p-6">

          <h1 className="text-3xl font-bold mb-6">
            Create Artifact
          </h1>

          <div className="mb-6">

            <label className="block font-medium mb-2">
              Artifact Title
            </label>

            <input
              value={artifactTitle}
              onChange={(e) =>
                setArtifactTitle(
                  e.target.value
                )
              }
              className="w-full border rounded-lg p-3"
            />

          </div>

          <div className="space-y-6">

            {sections.map(
              (section) => (
                <div
                  key={section.id}
                >

                  <label className="block font-medium mb-2">

                    {
                      section.section_order
                    }.
                    {" "}
                    {
                      section.section_name
                    }

                  </label>

                  <textarea
                    rows={6}
                    value={
                      sectionValues[
                        section.id
                      ] || ""
                    }
                    onChange={(e) =>
                      setSectionValues(
                        (
                          prev
                        ) => ({
                          ...prev,
                          [
                            section.id
                          ]:
                            e
                              .target
                              .value,
                        })
                      )
                    }
                    className="w-full border rounded-lg p-3"
                  />

                </div>
              )
            )}

          </div>

          <div className="flex justify-end gap-3 mt-8">

            <button
              onClick={() =>
                navigate(-1)
              }
              className="border px-4 py-2 rounded-lg"
            >
              Cancel
            </button>

            <button
              onClick={
                createArtifact
              }
              disabled={
                saving
              }
              className="bg-black text-white px-4 py-2 rounded-lg"
            >
              {saving
                ? "Creating..."
                : "Create Artifact"}
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}