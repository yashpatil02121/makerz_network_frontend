import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

interface Artifact {
  id: string;
  title: string;
  status: string;
}

interface Template {
  id: string;
  name: string;
  portfolio_id: string;
}

export default function ArtifactListPage() {
  const navigate = useNavigate();

  const { templateId } = useParams();

  const [loading, setLoading] =
    useState(true);

  const [template, setTemplate] =
    useState<Template | null>(null);

  const [artifacts, setArtifacts] =
    useState<Artifact[]>([]);


  useEffect(() => {
    if (templateId) {
      fetchData();
    }
  }, [templateId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const {
        data: templateData,
        error: templateError,
      } = await supabase
        .from("artifact_templates")
        .select(`
          id,
          name,
          portfolio_id
        `)
        .eq("id", templateId)
        .maybeSingle();

      if (templateError) {
        console.error(templateError);
      }

      const {
        data: artifactData,
        error: artifactError,
      } = await supabase
        .from("artifacts")
        .select(`
          id,
          title,
          status
        `)
        .eq("template_id", templateId)
        .order("created_at", {
          ascending: false,
        });

      if (artifactError) {
        console.error(artifactError);
      }

      setTemplate(templateData);
      setArtifacts(artifactData || []);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-10">
        Loading artifacts...
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
    <>


      <div className="min-h-screen bg-slate-100">

        <div className="max-w-7xl mx-auto p-8">

          <div className="bg-white rounded-xl shadow p-6 mb-6">

            <div className="flex justify-between items-center">

              <div>

                <h1 className="text-3xl font-bold">
                  {template.name}
                </h1>

                <p className="text-gray-500">
                  Artifacts created from this template
                </p>

              </div>

              <button
                onClick={() =>
                  navigate(
                    `/artifact-templates/${template.id}/artifacts/create`
                  )
                }
                className="bg-black text-white px-4 py-2 rounded-lg"
              >
                Create Artifact
            </button>

            </div>

          </div>

          {artifacts.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-10 text-center">

              <h2 className="text-xl font-semibold mb-2">
                No Artifacts Found
              </h2>

              <p className="text-gray-500">
                Create your first artifact from this template.
              </p>

            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              {artifacts.map((artifact) => (
                <div
                  key={artifact.id}
                  className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition cursor-pointer"
                >

                  <h2 className="text-xl font-semibold">
                    {artifact.title}
                  </h2>

                  <div className="mt-4">

                    <span className="bg-slate-100 px-3 py-1 rounded-full text-sm">
                      {artifact.status}
                    </span>

                  </div>

                </div>
              ))}

            </div>
          )}

        </div>

      </div>
    </>
  );
}