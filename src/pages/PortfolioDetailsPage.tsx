import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

interface Portfolio {
  id: string;
  name: string;
  description: string;
  visibility: string;
}

interface PortfolioMember {
  id: string;
  user_id: string;
  role: string;
}

interface ArtifactTemplate {
  id: string;
  name: string;
  description: string;
  target_role: string;
}

export default function PortfolioDetailsPage() {
  const { portfolioId } = useParams();

  const [loading, setLoading] = useState(true);

  const [portfolio, setPortfolio] =
    useState<Portfolio | null>(null);

  const [members, setMembers] = useState<
    PortfolioMember[]
  >([]);

  const [templates, setTemplates] = useState<
    ArtifactTemplate[]
  >([]);

  useEffect(() => {
    fetchData();
  }, [portfolioId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const { data: portfolioData } =
        await supabase
          .from("portfolios")
          .select("*")
          .eq("id", portfolioId)
          .single();

      const { data: membersData } =
        await supabase
          .from("portfolio_members")
          .select("*")
          .eq("portfolio_id", portfolioId);

      const { data: templatesData } =
        await supabase
          .from("artifact_templates")
          .select("*")
          .eq("portfolio_id", portfolioId)
          .order("created_at");

      setPortfolio(portfolioData);

      setMembers(membersData || []);

      setTemplates(templatesData || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-10">
        Loading portfolio...
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="p-10">
        Portfolio not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">

      <div className="max-w-7xl mx-auto p-8">

        {/* Portfolio Info */}

        <div className="bg-white rounded-xl shadow p-6 mb-6">

          <h1 className="text-3xl font-bold">
            {portfolio.name}
          </h1>

          <p className="text-gray-600 mt-2">
            {portfolio.description}
          </p>

          <div className="mt-4">
            <span className="bg-slate-200 px-3 py-1 rounded-full text-sm">
              {portfolio.visibility}
            </span>
          </div>

        </div>

        {/* Members */}

        <div className="bg-white rounded-xl shadow p-6 mb-6">

          <div className="flex justify-between items-center mb-4">

            <h2 className="text-2xl font-semibold">
              Members
            </h2>

            <button className="bg-black text-white px-4 py-2 rounded-lg">
              Add Member
            </button>

          </div>

          {members.length === 0 ? (
            <p className="text-gray-500">
              No members found
            </p>
          ) : (
            <div className="space-y-3">

              {members.map((member) => (
                <div
                  key={member.id}
                  className="border rounded-lg p-4 flex justify-between"
                >
                  <div>
                    <div className="font-medium">
                      {member.user_id}
                    </div>

                    <div className="text-sm text-gray-500">
                      Joined Portfolio
                    </div>
                  </div>

                  <div className="bg-slate-100 px-3 py-1 rounded-full h-fit">
                    {member.role}
                  </div>

                </div>
              ))}

            </div>
          )}

        </div>

        {/* Templates */}

        <div className="bg-white rounded-xl shadow p-6">

          <div className="flex justify-between items-center mb-4">

            <h2 className="text-2xl font-semibold">
              Artifact Templates
            </h2>

            <button className="bg-black text-white px-4 py-2 rounded-lg">
              Create Template
            </button>

          </div>

          {templates.length === 0 ? (
            <p className="text-gray-500">
              No templates created yet
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {templates.map((template) => (
                <div
                  key={template.id}
                  className="border rounded-xl p-4"
                >

                  <h3 className="text-lg font-semibold">
                    {template.name}
                  </h3>

                  <p className="text-gray-500 mt-2">
                    {template.description}
                  </p>

                  <div className="mt-3">

                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                      {template.target_role}
                    </span>

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