import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

interface ArtifactTemplate {
  id: string;
  name: string;
  description: string;
  target_role: string;
}

interface TemplateSection {
  id: string;
  section_name: string;
  section_order: number;
  description: string;
  validation_enabled: boolean;
  required: boolean;
}

export default function ArtifactTemplateDetailsPage() {
  const { templateId } = useParams();

  const [loading, setLoading] = useState(true);

  const [template, setTemplate] =
    useState<ArtifactTemplate | null>(null);

  const [sections, setSections] =
    useState<TemplateSection[]>([]);

  useEffect(() => {
    fetchData();
  }, [templateId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const { data: templateData } =
        await supabase
          .from("artifact_templates")
          .select("*")
          .eq("id", templateId)
          .single();

      const { data: sectionsData } =
        await supabase
          .from("artifact_template_sections")
          .select("*")
          .eq("template_id", templateId)
          .order("section_order");

      setTemplate(templateData);

      setSections(sectionsData || []);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-10">
        Loading template...
      </div>
    );
  }

  if (!template) {
    return (
      <div className="p-10">
        Template not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">

      <div className="max-w-6xl mx-auto p-8">

        {/* Template Info */}

        <div className="bg-white rounded-xl shadow p-6 mb-6">

          <h1 className="text-3xl font-bold">
            {template.name}
          </h1>

          <p className="text-gray-600 mt-2">
            {template.description}
          </p>

          <div className="mt-4">

            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
              {template.target_role}
            </span>

          </div>

        </div>

        {/* Sections */}

        <div className="bg-white rounded-xl shadow p-6">

          <div className="flex justify-between items-center mb-4">

            <h2 className="text-2xl font-semibold">
              Template Sections
            </h2>

            <button
              className="bg-black text-white px-4 py-2 rounded-lg"
            >
              Add Section
            </button>

          </div>

          {sections.length === 0 ? (
            <p className="text-gray-500">
              No sections created yet
            </p>
          ) : (
            <div className="space-y-4">

              {sections.map((section) => (
                <div
                  key={section.id}
                  className="border rounded-xl p-4"
                >

                  <div className="flex justify-between">

                    <div>

                      <div className="font-semibold">

                        {section.section_order}.
                        {" "}
                        {section.section_name}

                      </div>

                      <div className="text-sm text-gray-500 mt-1">

                        {section.description}

                      </div>

                    </div>

                    <div className="flex gap-2">

                      {section.required && (
                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs">
                          Required
                        </span>
                      )}

                      {section.validation_enabled && (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                          AI Validation
                        </span>
                      )}

                    </div>

                  </div>

                </div>
              ))}

            </div>
          )}

        </div>

      </div>

    </div>
  );
}