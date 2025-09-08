const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
// Serve static files from public directory at /public path
app.use("/public", express.static(path.join(__dirname, "public")));

// Also serve assets directly from root for React compatibility
app.use("/assets", express.static(path.join(__dirname, "public", "assets")));

// Routes
app.get("/api/products", async (req, res) => {
  try {
    // Check if Amazon Product Advertising API is available
    const useAmazonAPI = process.env.AMAZON_API_AVAILABLE === "true";

    if (useAmazonAPI) {
      // TODO: Implement Amazon Product Advertising API when unblocked
      // For now, fallback to JSON
      const products = getProductsFromJSON();
      res.json({ products, source: "amazon" });
    } else {
      // Fallback to JSON data
      const products = getProductsFromJSON();
      res.json({ products, source: "json" });
    }
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

app.get("/api/products/:id", (req, res) => {
  try {
    const productId = req.params.id;
    const products = getProductsFromJSON();
    const product = products.find((p) => p.id === productId);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

function getProductsFromJSON() {
  const filePath = path.join(__dirname, "public", "data", "products.json");
  const data = fs.readFileSync(filePath, "utf8");
  return JSON.parse(data);
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});
