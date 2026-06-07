import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import CreatePortfolioDialog from "../components/CreatePortfolioDialog";
import JoinPortfolioDialog from "../components/JoinPortfolioDialog";
import { useNavigate } from "react-router-dom";

interface Portfolio {
  id: string;
  name: string;
  description: string;
  logo_url?: string;
  created_by: string;
}

export default function PortfolioPage() {
  const [loading, setLoading] = useState(true);

  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);

  const [showCreateDialog, setShowCreateDialog] =
    useState(false);

  const [showJoinDialog, setShowJoinDialog] =
    useState(false);

  const [selectedPortfolio, setSelectedPortfolio] =
    useState<Portfolio | null>(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const fetchPortfolios = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("portfolios")
      .select(`
        id,
        name,
        description,
        logo_url,
        created_by
      `)
      .eq("status", "active")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(error);
    } else {
      setPortfolios(data || []);
    }

    setLoading(false);
  };

  const handleJoinPortfolio = (
    portfolio: Portfolio
  ) => {
    setSelectedPortfolio(portfolio);
    setShowJoinDialog(true);
  };

  if (loading) {
    return (
      <div className="p-10">
        Loading portfolios...
      </div>
    );
  }

  return (
    <>
      <CreatePortfolioDialog
        isOpen={showCreateDialog}
        onClose={() =>
          setShowCreateDialog(false)
        }
        onSuccess={fetchPortfolios}
      />

      <JoinPortfolioDialog
        isOpen={showJoinDialog}
        portfolioId={selectedPortfolio?.id || ""}
        portfolioName={selectedPortfolio?.name || ""}
        onClose={() => {
          setShowJoinDialog(false);
          setSelectedPortfolio(null);
        }}
        onSuccess={() => {
          setShowJoinDialog(false);
          setSelectedPortfolio(null);
        }}
      />

      <div className="min-h-screen bg-slate-100">

        <div className="max-w-7xl mx-auto p-8">

          <div className="flex justify-between items-center mb-8">

            <h1 className="text-3xl font-bold">
              All Portfolios
            </h1>

            <button
              onClick={() =>
                setShowCreateDialog(true)
              }
              className="bg-black text-white px-4 py-2 rounded-lg"
            >
              + Create Portfolio
            </button>

          </div>

          {portfolios.length === 0 ? (
            <div className="bg-white rounded-xl p-10 text-center shadow">

              <h2 className="text-xl font-semibold mb-2">
                No Portfolios Found
              </h2>

              <p className="text-gray-500">
                Create your first portfolio
                to begin.
              </p>

            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              {portfolios.map((portfolio) => (
                <div
                  key={portfolio.id}
                  onClick={() =>
                    navigate(`/portfolios/${portfolio.id}`)
                  }
                  className="bg-white rounded-xl shadow p-6 hover:shadow-lg hover:cursor-pointer transition"
                >

                  <div className="w-16 h-16 rounded-full bg-slate-200 mb-4 flex items-center justify-center">

                    {portfolio.logo_url ? (
                      <img
                        src={portfolio.logo_url}
                        alt={portfolio.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-xl font-bold">
                        {portfolio.name.charAt(0)}
                      </span>
                    )}

                  </div>

                  <h2 className="text-xl font-semibold">
                    {portfolio.name}
                  </h2>

                  <p className="text-gray-500 mt-2 min-h-[48px]">
                    {portfolio.description}
                  </p>

                  <p className="text-gray-500 mt-2 min-h-[48px]">
                    {portfolio.created_by}
                  </p>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleJoinPortfolio(portfolio);
                    }}
                    className="mt-5 w-full bg-slate-900 text-white py-2 rounded-lg hover:bg-slate-800"
                  >
                    Join Portfolio
                  </button>

                </div>
              ))}

            </div>
          )}

        </div>

      </div>
    </>
  );
}