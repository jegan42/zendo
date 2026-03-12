// =============================================================
// PAGE SELLER HOME - Dashboard du vendeur
// Tableau produits facon back-office (MUI DataGrid)
// + cartes stats + bouton ajouter
// =============================================================

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { frFR } from "@mui/x-data-grid/locales";
import Switch from "@mui/material/Switch";
import IconButton from "@mui/material/IconButton";
import StorefrontIcon from "@mui/icons-material/Storefront";
import InventoryIcon from "@mui/icons-material/Inventory";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import api from "../../services/api";
import "../../styles/Pages.css";
import "./SellerHome.css";

const SellerHome = () => {
  // -- DETECTION MOBILE (pour cacher des colonnes du tableau) --
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 600);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // -- ETATS --
  const [products, setProducts] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    inactiveProducts: 0,
    totalStock: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Logique User x reducer
  const user = useSelector((state: any) => state.user.userInfo);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    fetchSellerData();
  }, [user]);

  // recuperation des donnees du Dash Seller
  const fetchSellerData = async () => {
    try {
      setLoading(true);
      setError("");

      // Appel API : GET /api/seller/:userId
      const response = await api.get("/seller/" + user.id);

      // On met a jour les state avec les donnees recues
      setProducts(response.data.products);
      setStats(response.data.stats);
    } catch (err: any) {
      console.error("Erreur chargement dashboard vendeur:", err);
      setError("Impossible de charger vos produits");
    } finally {
      setLoading(false);
    }
  };

  // -- TOGGLE ACTIF/INACTIF --
  // On fait un PUT pour changer le statut du produit
  const handleToggleStatus = async (productId: string, currentStatus: boolean) => {
    try {
      await api.put("/products/" + productId, { status: !currentStatus });
      fetchSellerData();
    } catch (err: any) {
      console.error("Erreur toggle statut:", err);
    }
  };

  // -- SUPPRESSION D'UN PRODUIT --
  const handleDeleteProduct = async (productId: string, productName: string) => {
    const confirmed = window.confirm("Supprimer le produit \"" + productName + "\" ?");
    if (!confirmed) return;

    try {
      await api.delete("/products/" + productId);
      fetchSellerData();
    } catch (err: any) {
      console.error("Erreur suppression produit:", err);
      alert("Erreur lors de la suppression du produit.");
    }
  };

  // -- CALCUL DU PRIX MIN/MAX --
  const getPriceRange = (variations: any[]) => {
    if (!variations || variations.length === 0) return "—";
    const prices = variations.map((v) => v.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    if (minPrice === maxPrice) return minPrice.toFixed(2) + " EUR";
    return minPrice.toFixed(2) + " - " + maxPrice.toFixed(2) + " EUR";
  };

  // -- CALCUL DU STOCK TOTAL --
  const getTotalStock = (variations: any[]) => {
    if (!variations || variations.length === 0) return 0;
    return variations.reduce((sum, v) => sum + (v.stock || 0), 0);
  };

  // =============================================================
  // DEFINITION DES COLONNES DU TABLEAU
  // =============================================================

  const columns: GridColDef[] = [
    // Colonne image
    {
      field: "images",
      headerName: "Image",
      width: 70,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => {
        const images = params.row.images;
        if (images && images.length > 0) {
          return (
            <img
              src={images[0]}
              alt=""
              style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 6 }}
            />
          );
        }
        return <InventoryIcon sx={{ fontSize: 24, color: "#ccc" }} />;
      },
    },

    // Colonne nom
    {
      field: "name",
      headerName: "Nom",
      flex: 1,
      minWidth: isMobile ? 100 : 150,
    },

    // Colonne reference
    {
      field: "reference",
      headerName: "Reference",
      width: 120,
    },

    // Colonne categorie
    {
      field: "category",
      headerName: "Categorie",
      width: 120,
    },

    // Colonne prix (calcule depuis les variations)
    {
      field: "prix",
      headerName: "Prix",
      width: 140,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => {
        return getPriceRange(params.row.variations);
      },
    },

    // Colonne stock (calcule depuis les variations)
    {
      field: "stock",
      headerName: "Stock",
      width: 80,
      renderCell: (params: GridRenderCellParams) => {
        const total = getTotalStock(params.row.variations);
        return (
          <span style={{ color: total === 0 ? "#e57373" : "#1a1a2e", fontWeight: 600 }}>
            {total}
          </span>
        );
      },
    },

    // Colonne etat (toggle switch)
    {
      field: "status",
      headerName: "Etat",
      width: 80,
      renderCell: (params: GridRenderCellParams) => {
        return (
          <Switch
            checked={params.row.status === true}
            onChange={() => handleToggleStatus(params.row._id, params.row.status)}
            size="small"
            color="success"
          />
        );
      },
    },

    // Colonne actions (edit + delete)
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => {
        return (
          <div style={{ display: "flex", gap: 4 }}>
            <IconButton
              size="small"
              onClick={() => navigate("/vendeur/modifier-produit/" + params.row._id)}
              sx={{ color: "#3b5998" }}
            >
              <EditIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => handleDeleteProduct(params.row._id, params.row.name)}
              sx={{ color: "#e57373" }}
            >
              <DeleteOutlineIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </div>
        );
      },
    },
  ];

  // =============================================================
  // AFFICHAGE
  // =============================================================

  // Si pas connecte
  if (!user) {
    return (
      <div className="page-container">
        <p className="page-placeholder">
          Connectez-vous pour acceder a votre espace vendeur.
        </p>
      </div>
    );
  }

  // Erreur
  if (error) {
    return (
      <div className="page-container">
        <p className="seller-error">{error}</p>
        <button className="seller-retry-btn" onClick={fetchSellerData}>
          Reessayer
        </button>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* -- EN-TETE VENDEUR -- */}
      <div className="seller-header">
        <StorefrontIcon sx={{ fontSize: 28, color: "#3b5998" }} />
        <h1 className="page-title">Ma boutique</h1>
      </div>

      {/* -- CARTES STATISTIQUES -- */}
      <div className="seller-stats-row">
        <div className="stat-card">
          <InventoryIcon className="stat-icon" />
          <div className="stat-info">
            <span className="stat-number">{stats.totalProducts}</span>
            <span className="stat-label">Produits</span>
          </div>
        </div>

        <div className="stat-card">
          <CheckCircleOutlineIcon className="stat-icon stat-icon-active" />
          <div className="stat-info">
            <span className="stat-number">{stats.activeProducts}</span>
            <span className="stat-label">Actifs</span>
          </div>
        </div>

        <div className="stat-card">
          <RemoveCircleOutlineIcon className="stat-icon stat-icon-inactive" />
          <div className="stat-info">
            <span className="stat-number">{stats.inactiveProducts}</span>
            <span className="stat-label">Inactifs</span>
          </div>
        </div>
      </div>

      {/* -- SECTION TABLEAU PRODUITS -- */}
      <div className="seller-products-section">
        <div className="seller-products-header">
          <h2 className="seller-section-title">Mes produits</h2>
          <button className="seller-add-btn" onClick={() => navigate("/vendeur/ajouter-produit")}>
            <AddIcon sx={{ fontSize: 20 }} />
            <span>Nouveau produit</span>
          </button>
        </div>

        {/* Tableau DataGrid */}
        <div className="seller-datagrid-wrapper">
          <DataGrid
            rows={products}
            columns={columns}
            getRowId={(row) => row._id}
            loading={loading}
            localeText={frFR.components.MuiDataGrid.defaultProps.localeText}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
            pageSizeOptions={[5, 10, 25]}
            columnVisibilityModel={{
              reference: !isMobile,
              category: !isMobile,
              prix: !isMobile,
            }}
            disableRowSelectionOnClick
            autoHeight
            sx={{
              border: "none",
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.06)",
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#faf8f5",
                fontWeight: 700,
                fontSize: 13,
                color: "#1a1a2e",
              },
              "& .MuiDataGrid-cell": {
                fontSize: 13,
                color: "#1a1a2e",
                display: "flex",
                alignItems: "center",
              },
              "& .MuiDataGrid-row:hover": {
                backgroundColor: "rgba(59, 89, 152, 0.04)",
              },
              "& .MuiDataGrid-footerContainer": {
                borderTop: "1px solid #f0ede6",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default SellerHome;
