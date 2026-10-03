// controllers/bulkRequestController.js
const BulkRequest = require("../models/BulkRequest");
const Product = require("../models/Product");

// ── POST /api/bulk-requests/create ───────────────────────────────────────────
// Customer sends a purchase request
exports.createRequest = async (req, res) => {
  try {
    const { productId, quantity, proposedPrice } = req.body;

    if (!productId || !quantity || !proposedPrice)
      return res.status(400).json({ message: "Missing required fields" });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Prevent farmer from requesting their own product
    if (product.farmer.toString() === req.user.id)
      return res.status(400).json({ message: "You cannot request your own product" });

    const request = await BulkRequest.create({
      product: productId,
      customer: req.user.id,
      farmer: product.farmer,
      quantity,
      proposedPrice,
      status: "pending",
      // ✅ Add first entry to negotiation history
      negotiationHistory: [{ price: proposedPrice, by: "customer" }],
    });

    const populated = await BulkRequest.findById(request._id)
      .populate("product", "name pricePerKg quantityAvailable")
      .populate("customer", "name mobile district")
      .populate("farmer", "name mobile district");

    res.status(201).json(populated);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── GET /api/bulk-requests ────────────────────────────────────────────────────
// ✅ THIS WAS MISSING — main reason requests tab was empty
// Farmer sees requests sent TO them | Customer sees requests sent BY them
exports.getMyRequests = async (req, res) => {
  try {
    const filter = req.user.role === "farmer"
      ? { farmer: req.user.id }
      : { customer: req.user.id };

    const requests = await BulkRequest.find(filter)
      .populate("product", "name pricePerKg quantityAvailable description")
      .populate("customer", "name mobile district")
      .populate("farmer", "name mobile district")
      .sort({ updatedAt: -1 }); // most recently updated first

    res.json({ requests });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── PUT /api/bulk-requests/farmer/:id ────────────────────────────────────────
// Farmer: accept / reject / counter
exports.respondByFarmer = async (req, res) => {
  try {
    const { action, newPrice } = req.body;

    const request = await BulkRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    if (request.farmer.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    if (request.status === "accepted" || request.status === "rejected")
      return res.status(400).json({ message: "Request already finalized" });

    if (action === "accept") {
      request.status = "accepted";
      request.finalPrice = request.proposedPrice; // ✅ Set finalPrice on accept
    }
    else if (action === "reject") {
      request.status = "rejected";
    }
    else if (action === "counter") {
      if (!newPrice) return res.status(400).json({ message: "Counter price required" });
      request.proposedPrice = newPrice;
      request.status = "negotiating";
      // ✅ Record in negotiation history
      request.negotiationHistory.push({ price: Number(newPrice), by: "farmer" });
    }
    else {
      return res.status(400).json({ message: "Invalid action" });
    }

    await request.save();

    const populated = await BulkRequest.findById(request._id)
      .populate("product", "name pricePerKg quantityAvailable")
      .populate("customer", "name mobile district")
      .populate("farmer", "name mobile district");

    res.json({ message: "Response recorded", request: populated });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── PUT /api/bulk-requests/customer/:id ──────────────────────────────────────
// Customer: accept / reject / counter a farmer's counter offer
exports.respondByCustomer = async (req, res) => {
  try {
    const { action, newPrice } = req.body;

    const request = await BulkRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    if (request.customer.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    if (request.status === "accepted" || request.status === "rejected")
      return res.status(400).json({ message: "Request already finalized" });

    if (action === "accept") {
      request.status = "accepted";
      request.finalPrice = request.proposedPrice; // ✅ Set finalPrice on accept
    }
    else if (action === "reject") {
      request.status = "rejected";
    }
    else if (action === "counter") {
      if (!newPrice) return res.status(400).json({ message: "Counter price required" });
      request.proposedPrice = newPrice;
      request.status = "negotiating";
      // ✅ Record in negotiation history
      request.negotiationHistory.push({ price: Number(newPrice), by: "customer" });
    }
    else {
      return res.status(400).json({ message: "Invalid action" });
    }

    await request.save();

    const populated = await BulkRequest.findById(request._id)
      .populate("product", "name pricePerKg quantityAvailable")
      .populate("customer", "name mobile district")
      .populate("farmer", "name mobile district");

    res.json({ message: "Response recorded", request: populated });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── GET /api/bulk-requests/all ────────────────────────────────────────────────
// Admin only
exports.getAllRequests = async (req, res) => {
  try {
    const requests = await BulkRequest.find()
      .populate("product", "name pricePerKg")
      .populate("customer", "name email")
      .populate("farmer", "name email");
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
