// import { useState, useEffect } from "react";
// import { useAuth } from "../context/Authcontext";
// import { getToken } from "../services/authService";
// import "../pages/Dashboard.css";

// const BASE = "http://localhost:5000";

// const CROP_EMOJIS = {
//   Wheat: "🌾",
//   Potato: "🥔",
//   Tomato: "🍅",
//   Onion: "🧅",
//   Banana: "🍌",
//   Orange: "🍊",
//   Rice: "🍚",
//   Maize: "🌽",
//   Mustard: "🌻",
// };
// const getCropEmoji = (name) => CROP_EMOJIS[name] || "🌿";

// // ✅ FIXED: was "countered" — schema uses "negotiating"
// const STATUS_STYLE = {
//   pending: { background: "#fef3c7", color: "#92400e" },
//   accepted: { background: "#d1fae5", color: "#065f46" },
//   rejected: { background: "#fee2e2", color: "#991b1b" },
//   negotiating: { background: "#e0e7ff", color: "#3730a3" },
// };

// // ─── LIST PRODUCT MODAL (Farmer) ──────────────────────────────────────────────
// function ListProductModal({ onClose, onSuccess, token }) {
//   const [form, setForm] = useState({
//     name: "Wheat",
//     pricePerKg: "",
//     quantityAvailable: "",
//     description: "",
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const submit = async () => {
//     setLoading(true);
//     setError("");
//     try {
//       const res = await fetch(`${BASE}/api/products/create`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           ...form,
//           pricePerKg: Number(form.pricePerKg),
//           quantityAvailable: Number(form.quantityAvailable),
//         }),
//       });
//       const json = await res.json();
//       if (!res.ok) throw new Error(json.message || "Failed to list product");
//       onSuccess();
//     } catch (e) {
//       setError(e.message);
//     }
//     setLoading(false);
//   };

//   return (
//     <div className="modal-overlay" onClick={onClose}>
//       <div className="modal" onClick={(e) => e.stopPropagation()}>
//         <div className="modal-header">
//           <div className="modal-title">🌾 List Your Crop</div>
//           <button className="modal-close" onClick={onClose}>
//             ×
//           </button>
//         </div>
//         {error && <div style={styles.errorBox}>⚠️ {error}</div>}
//         <div className="form-group">
//           <label className="form-label">Crop Name</label>
//           <select
//             className="form-select"
//             value={form.name}
//             onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
//           >
//             {Object.keys(CROP_EMOJIS).map((c) => (
//               <option key={c}>{c}</option>
//             ))}
//           </select>
//         </div>
//         <div className="two-col">
//           <div className="form-group">
//             <label className="form-label">Price per Kg (₹)</label>
//             <input
//               className="form-input"
//               type="number"
//               placeholder="e.g. 25"
//               value={form.pricePerKg}
//               onChange={(e) =>
//                 setForm((f) => ({ ...f, pricePerKg: e.target.value }))
//               }
//             />
//           </div>
//           <div className="form-group">
//             <label className="form-label">Quantity (Kg)</label>
//             <input
//               className="form-input"
//               type="number"
//               placeholder="e.g. 1000"
//               value={form.quantityAvailable}
//               onChange={(e) =>
//                 setForm((f) => ({ ...f, quantityAvailable: e.target.value }))
//               }
//             />
//           </div>
//         </div>
//         <div className="form-group">
//           <label className="form-label">Description</label>
//           <input
//             className="form-input"
//             placeholder="e.g. Fresh harvest, Grade A"
//             value={form.description}
//             onChange={(e) =>
//               setForm((f) => ({ ...f, description: e.target.value }))
//             }
//           />
//         </div>
//         <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
//           <button
//             className="btn btn-primary"
//             style={{ flex: 1 }}
//             onClick={submit}
//             disabled={loading}
//           >
//             {loading ? "⏳ Listing..." : "✅ List Crop"}
//           </button>
//           <button className="btn btn-outline" onClick={onClose}>
//             Cancel
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── BULK REQUEST MODAL (Customer) ────────────────────────────────────────────
// function BulkRequestModal({ product, onClose, onSuccess, token }) {
//   const [form, setForm] = useState({
//     quantity: "",
//     proposedPrice: product.pricePerKg || "",
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const submit = async () => {
//     setLoading(true);
//     setError("");
//     try {
//       const res = await fetch(`${BASE}/api/bulk-requests/create`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           productId: product._id,
//           quantity: Number(form.quantity),
//           proposedPrice: Number(form.proposedPrice),
//         }),
//       });
//       const json = await res.json();
//       if (!res.ok) throw new Error(json.message || "Request failed");
//       onSuccess();
//     } catch (e) {
//       setError(e.message);
//     }
//     setLoading(false);
//   };

//   return (
//     <div className="modal-overlay" onClick={onClose}>
//       <div className="modal" onClick={(e) => e.stopPropagation()}>
//         <div className="modal-header">
//           <div className="modal-title">🛒 Request Bulk Purchase</div>
//           <button className="modal-close" onClick={onClose}>
//             ×
//           </button>
//         </div>
//         <div style={styles.dealInfo}>
//           <div style={styles.dealRow}>
//             <span>Crop</span>
//             <strong>
//               {getCropEmoji(product.name)} {product.name}
//             </strong>
//           </div>
//           <div style={styles.dealRow}>
//             <span>Farmer's Price</span>
//             <strong>₹{product.pricePerKg}/kg</strong>
//           </div>
//           <div style={styles.dealRow}>
//             <span>Available</span>
//             <strong>{product.quantityAvailable} Kg</strong>
//           </div>
//           {product.farmer?.name && (
//             <div style={styles.dealRow}>
//               <span>Farmer</span>
//               <strong>👨‍🌾 {product.farmer.name}</strong>
//             </div>
//           )}
//         </div>
//         {error && <div style={styles.errorBox}>⚠️ {error}</div>}
//         <div className="two-col">
//           <div className="form-group">
//             <label className="form-label">Quantity (Kg)</label>
//             <input
//               className="form-input"
//               type="number"
//               placeholder="e.g. 500"
//               value={form.quantity}
//               onChange={(e) =>
//                 setForm((f) => ({ ...f, quantity: e.target.value }))
//               }
//             />
//           </div>
//           <div className="form-group">
//             <label className="form-label">Your Offer (₹/kg)</label>
//             <input
//               className="form-input"
//               type="number"
//               placeholder={product.pricePerKg}
//               value={form.proposedPrice}
//               onChange={(e) =>
//                 setForm((f) => ({ ...f, proposedPrice: e.target.value }))
//               }
//             />
//           </div>
//         </div>
//         <div style={{ display: "flex", gap: "0.75rem" }}>
//           <button
//             className="btn btn-primary"
//             style={{ flex: 1 }}
//             onClick={submit}
//             disabled={loading}
//           >
//             {loading ? "⏳ Sending..." : "📨 Send Request"}
//           </button>
//           <button className="btn btn-outline" onClick={onClose}>
//             Cancel
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── NEGOTIATION MODAL ────────────────────────────────────────────────────────
// function NegotiationModal({ request, role, onClose, onAction, token }) {
//   const [counterPrice, setCounterPrice] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const doAction = async (action) => {
//     setLoading(true);
//     setError("");
//     try {
//       const endpoint =
//         role === "farmer"
//           ? `${BASE}/api/bulk-requests/farmer/${request._id}`
//           : `${BASE}/api/bulk-requests/customer/${request._id}`;

//       const body =
//         action === "counter"
//           ? { action, newPrice: Number(counterPrice) }
//           : { action };

//       const res = await fetch(endpoint, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(body),
//       });
//       const json = await res.json();
//       if (!res.ok) throw new Error(json.message || "Action failed");
//       onAction();
//     } catch (e) {
//       setError(e.message);
//     }
//     setLoading(false);
//   };

//   // ✅ FIXED: was checking "countered" — schema uses "negotiating"
//   // Farmer acts on "pending" requests
//   // Customer acts on "negotiating" requests where farmer last countered
//   const lastBy = request.negotiationHistory?.slice(-1)[0]?.by;
//   const canAct =
//     (role === "farmer" && request.status === "pending") ||
//     (role === "farmer" &&
//       request.status === "negotiating" &&
//       lastBy === "customer") ||
//     (role === "customer" &&
//       request.status === "negotiating" &&
//       lastBy === "farmer");

//   return (
//     <div className="modal-overlay" onClick={onClose}>
//       <div className="modal" onClick={(e) => e.stopPropagation()}>
//         <div className="modal-header">
//           <div className="modal-title">🤝 Negotiate Deal</div>
//           <button className="modal-close" onClick={onClose}>
//             ×
//           </button>
//         </div>

//         <div style={styles.dealInfo}>
//           <div style={styles.dealRow}>
//             <span>Crop</span>
//             <strong>
//               {getCropEmoji(request.product?.name)}{" "}
//               {request.product?.name || "—"}
//             </strong>
//           </div>
//           <div style={styles.dealRow}>
//             <span>Quantity</span>
//             <strong>{request.quantity} Kg</strong>
//           </div>
//           {/* ✅ FIXED: proposedPrice is always the current offer (updated on each counter) */}
//           <div style={styles.dealRow}>
//             <span>Current Price</span>
//             <strong>₹{request.proposedPrice}/kg</strong>
//           </div>
//           {request.finalPrice && (
//             <div style={styles.dealRow}>
//               <span>Final Price</span>
//               <strong style={{ color: "#065f46" }}>
//                 ₹{request.finalPrice}/kg
//               </strong>
//             </div>
//           )}
//           {role === "farmer" && request.customer?.name && (
//             <div style={styles.dealRow}>
//               <span>Buyer</span>
//               <strong>
//                 🛒 {request.customer.name} — {request.customer.district}
//               </strong>
//             </div>
//           )}
//           {role === "customer" && request.farmer?.name && (
//             <div style={styles.dealRow}>
//               <span>Farmer</span>
//               <strong>
//                 👨‍🌾 {request.farmer.name} — {request.farmer.district}
//               </strong>
//             </div>
//           )}
//           <div style={styles.dealRow}>
//             <span>Status</span>
//             <span
//               style={{
//                 ...(STATUS_STYLE[request.status] || {}),
//                 padding: "2px 10px",
//                 borderRadius: 12,
//                 fontSize: 12,
//                 fontWeight: 700,
//               }}
//             >
//               {request.status}
//             </span>
//           </div>
//         </div>

//         {/* Negotiation history */}
//         {request.negotiationHistory?.length > 0 && (
//           <div style={{ marginBottom: "1rem" }}>
//             <div
//               style={{
//                 fontSize: "0.78rem",
//                 fontWeight: 700,
//                 color: "var(--gray-500)",
//                 marginBottom: 6,
//                 textTransform: "uppercase",
//                 letterSpacing: "0.5px",
//               }}
//             >
//               Negotiation History
//             </div>
//             {request.negotiationHistory.map((h, i) => (
//               <div
//                 key={i}
//                 style={{
//                   display: "flex",
//                   justifyContent: "space-between",
//                   fontSize: "0.83rem",
//                   padding: "4px 0",
//                   borderBottom: "1px solid var(--gray-100)",
//                 }}
//               >
//                 <span
//                   style={{
//                     color: h.by === "farmer" ? "#1b4332" : "#92400e",
//                     fontWeight: 600,
//                   }}
//                 >
//                   {h.by === "farmer" ? "👨‍🌾 Farmer" : "🛒 Buyer"}
//                 </span>
//                 <strong>₹{h.price}/kg</strong>
//               </div>
//             ))}
//           </div>
//         )}

//         {error && <div style={styles.errorBox}>⚠️ {error}</div>}

//         {canAct && (
//           <div
//             style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
//           >
//             <div className="form-group">
//               <label className="form-label">Counter Price (₹/kg)</label>
//               <input
//                 className="form-input"
//                 type="number"
//                 placeholder="Your counter offer"
//                 value={counterPrice}
//                 onChange={(e) => setCounterPrice(e.target.value)}
//               />
//             </div>
//             <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
//               <button
//                 className="btn btn-primary btn-sm"
//                 onClick={() => doAction("accept")}
//                 disabled={loading}
//               >
//                 ✅ Accept ₹{request.proposedPrice}/kg
//               </button>
//               <button
//                 className="btn btn-outline btn-sm"
//                 style={{ color: "var(--red)", borderColor: "var(--red)" }}
//                 onClick={() => doAction("reject")}
//                 disabled={loading}
//               >
//                 ❌ Reject
//               </button>
//               <button
//                 className="btn btn-outline btn-sm"
//                 onClick={() => doAction("counter")}
//                 disabled={loading || !counterPrice}
//               >
//                 ↩️ Counter
//               </button>
//             </div>
//           </div>
//         )}

//         {!canAct && (
//           <div
//             style={{
//               textAlign: "center",
//               marginTop: "1rem",
//               color: "var(--gray-500)",
//               fontSize: "0.9rem",
//             }}
//           >
//             {request.status === "accepted" &&
//               `🎉 Deal done at ₹${request.finalPrice || request.proposedPrice}/kg! Contact details above.`}
//             {request.status === "rejected" && "❌ This request was rejected."}
//             {request.status === "pending" &&
//               role === "customer" &&
//               "⏳ Waiting for farmer's response."}
//             {request.status === "negotiating" &&
//               role === "farmer" &&
//               "⏳ Waiting for buyer's response."}
//             {request.status === "negotiating" &&
//               role === "customer" &&
//               "⏳ Waiting for farmer's response."}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// // ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
// export default function DirectTrade() {
//   const { user } = useAuth();
//   const isFarmer = user?.role === "farmer";
//   const token = getToken();

//   const [products, setProducts] = useState([]);
//   const [requests, setRequests] = useState([]);
//   const [loadingProducts, setLoadingProducts] = useState(false);
//   const [loadingRequests, setLoadingRequests] = useState(false);
//   const [showListModal, setShowListModal] = useState(false);
//   const [selectedProduct, setSelectedProduct] = useState(null);
//   const [selectedRequest, setSelectedRequest] = useState(null);
//   const [activeTab, setActiveTab] = useState("products");
//   const [toast, setToast] = useState("");

//   const showToast = (msg) => {
//     setToast(msg);
//     setTimeout(() => setToast(""), 3000);
//   };

//   const loadProducts = async () => {
//     setLoadingProducts(true);
//     try {
//       // ✅ FIXED — farmer calls /my, customer calls /
//       const endpoint = isFarmer
//         ? `${BASE}/api/products/my`
//         : `${BASE}/api/products`;
//       const res = await fetch(endpoint, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const json = await res.json();
//       setProducts(Array.isArray(json) ? json : []);
//     } catch {
//       setProducts([]);
//     }
//     setLoadingProducts(false);
//   };

//   // ✅ FIXED: was missing entirely — now fetches from GET /api/bulk-requests
//   const loadRequests = async () => {
//     setLoadingRequests(true);
//     try {
//       const res = await fetch(`${BASE}/api/bulk-requests`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const json = await res.json();
//       setRequests(Array.isArray(json.requests) ? json.requests : []);
//     } catch {
//       setRequests([]);
//     }
//     setLoadingRequests(false);
//   };

//   useEffect(() => {
//     loadProducts();
//     loadRequests();
//   }, []);

//   useEffect(() => {
//     if (activeTab === "requests") loadRequests();
//   }, [activeTab]);

//   // ✅ FIXED: badge counts use "negotiating" not "countered"
//   const actionNeeded = requests.filter((r) => {
//     const lastBy = r.negotiationHistory?.slice(-1)[0]?.by;
//     if (isFarmer)
//       return (
//         r.status === "pending" ||
//         (r.status === "negotiating" && lastBy === "customer")
//       );
//     return r.status === "negotiating" && lastBy === "farmer";
//   }).length;

//   return (
//     <div>
//       {toast && <div style={styles.toast}>{toast}</div>}

//       <div className="page-header">
//         <h1>{isFarmer ? "🤝 Direct Selling" : "🛒 Direct Buying"}</h1>
//         <p>
//           {isFarmer
//             ? "List your crops and negotiate directly with buyers"
//             : "Browse crops and send bulk purchase requests to farmers"}
//         </p>
//       </div>

//       {/* WORKFLOW BANNER */}
//       <div style={styles.workflowBanner}>
//         {["List / Browse", "Send Request", "Negotiate", "Deal Done ✅"].map(
//           (step, i) => (
//             <div
//               key={i}
//               style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
//             >
//               <div style={styles.workflowStep}>
//                 <span style={styles.stepNum}>{i + 1}</span> {step}
//               </div>
//               {i < 3 && <div style={styles.workflowArrow}>→</div>}
//             </div>
//           ),
//         )}
//       </div>

//       {/* TABS */}
//       <div style={styles.tabs}>
//         <button
//           style={{
//             ...styles.tab,
//             ...(activeTab === "products" ? styles.tabActive : {}),
//           }}
//           onClick={() => setActiveTab("products")}
//         >
//           {isFarmer ? "🌾 My Listings" : "🛒 Available Crops"}
//         </button>
//         <button
//           style={{
//             ...styles.tab,
//             ...(activeTab === "requests" ? styles.tabActive : {}),
//           }}
//           onClick={() => setActiveTab("requests")}
//         >
//           📋 Requests & Negotiations
//           {actionNeeded > 0 && <span style={styles.badge}>{actionNeeded}</span>}
//         </button>
//       </div>

//       {/* ── PRODUCTS TAB ─────────────────────────────────────────────────────── */}
//       {activeTab === "products" && (
//         <div>
//           {isFarmer && (
//             <div style={{ marginBottom: "1.25rem" }}>
//               <button
//                 className="btn btn-primary"
//                 onClick={() => setShowListModal(true)}
//               >
//                 ➕ List New Crop
//               </button>
//             </div>
//           )}
//           {loadingProducts ? (
//             <div className="loading-box">
//               <div className="spinner" />
//               <span>Loading products...</span>
//             </div>
//           ) : products.length === 0 ? (
//             <div className="empty-state">
//               <div className="empty-icon">{isFarmer ? "🌱" : "🛍️"}</div>
//               <h3>
//                 {isFarmer ? "No crops listed yet" : "No products available"}
//               </h3>
//               <p>
//                 {isFarmer
//                   ? "Add your first crop listing above."
//                   : "Check back later for available listings."}
//               </p>
//             </div>
//           ) : (
//             <div className="product-grid">
//               {products.map((p) => (
//                 <div key={p._id} className="product-card">
//                   <div className="product-emoji">{getCropEmoji(p.name)}</div>
//                   <div className="product-name">{p.name}</div>
//                   <div className="product-price">₹{p.pricePerKg}/kg</div>
//                   <div className="product-qty">
//                     📦 {p.quantityAvailable} Kg available
//                   </div>
//                   {p.farmer?.name && (
//                     <div className="product-farmer">👨‍🌾 {p.farmer.name}</div>
//                   )}
//                   {p.farmer?.district && (
//                     <div
//                       style={{ fontSize: "0.8rem", color: "var(--gray-500)" }}
//                     >
//                       📍 {p.farmer.district}
//                     </div>
//                   )}
//                   {p.description && (
//                     <div
//                       style={{ fontSize: "0.8rem", color: "var(--gray-500)" }}
//                     >
//                       {p.description}
//                     </div>
//                   )}
//                   <div className="product-actions">
//                     {!isFarmer && (
//                       <button
//                         className="btn btn-primary btn-sm"
//                         onClick={() => setSelectedProduct(p)}
//                       >
//                         🛒 Request Purchase
//                       </button>
//                     )}
//                     {isFarmer && (
//                       <span className="badge badge-green">Your Listing</span>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       )}

//       {/* ── REQUESTS TAB ─────────────────────────────────────────────────────── */}
//       {activeTab === "requests" && (
//         <div>
//           {loadingRequests ? (
//             <div className="loading-box">
//               <div className="spinner" />
//               <span>Loading requests...</span>
//             </div>
//           ) : requests.length === 0 ? (
//             <div className="empty-state">
//               <div className="empty-icon">📋</div>
//               <h3>No requests yet</h3>
//               <p>
//                 {isFarmer
//                   ? "Buyer requests will appear here once customers send them."
//                   : "Send a purchase request from the Available Crops tab."}
//               </p>
//             </div>
//           ) : (
//             <div
//               style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
//             >
//               {requests.map((r) => {
//                 const lastBy = r.negotiationHistory?.slice(-1)[0]?.by;
//                 // ✅ FIXED: uses "negotiating" not "countered"
//                 const myTurn =
//                   (isFarmer &&
//                     (r.status === "pending" ||
//                       (r.status === "negotiating" && lastBy === "customer"))) ||
//                   (!isFarmer &&
//                     r.status === "negotiating" &&
//                     lastBy === "farmer");
//                 return (
//                   <div
//                     key={r._id}
//                     style={{
//                       ...styles.requestCard,
//                       borderLeft: myTurn
//                         ? "4px solid #2d6a4f"
//                         : "4px solid transparent",
//                     }}
//                   >
//                     <div style={styles.requestLeft}>
//                       <span style={{ fontSize: "2rem" }}>
//                         {getCropEmoji(r.product?.name)}
//                       </span>
//                       <div>
//                         <div style={{ fontWeight: 700, fontSize: "1rem" }}>
//                           {r.product?.name}
//                         </div>
//                         <div
//                           style={{
//                             fontSize: "0.83rem",
//                             color: "var(--gray-500)",
//                           }}
//                         >
//                           {r.quantity} Kg &nbsp;•&nbsp; Current: ₹
//                           {r.proposedPrice}/kg
//                           {r.negotiationHistory?.length > 1 && (
//                             <span style={{ color: "#3730a3" }}>
//                               {" "}
//                               &nbsp;•&nbsp; {r.negotiationHistory.length} rounds
//                             </span>
//                           )}
//                         </div>
//                         <div
//                           style={{
//                             fontSize: "0.8rem",
//                             color: "var(--gray-500)",
//                             marginTop: 2,
//                           }}
//                         >
//                           {isFarmer
//                             ? `🛒 From: ${r.customer?.name || "—"} (${r.customer?.district || ""})`
//                             : `👨‍🌾 Farmer: ${r.farmer?.name || "—"} (${r.farmer?.district || ""})`}
//                         </div>
//                       </div>
//                     </div>
//                     <div
//                       style={{
//                         display: "flex",
//                         alignItems: "center",
//                         gap: "1rem",
//                       }}
//                     >
//                       <span
//                         style={{
//                           ...(STATUS_STYLE[r.status] || {}),
//                           padding: "4px 12px",
//                           borderRadius: 20,
//                           fontSize: 12,
//                           fontWeight: 700,
//                         }}
//                       >
//                         {r.status}
//                       </span>
//                       <button
//                         className={
//                           myTurn
//                             ? "btn btn-primary btn-sm"
//                             : "btn btn-outline btn-sm"
//                         }
//                         onClick={() => setSelectedRequest(r)}
//                       >
//                         {myTurn ? "🤝 Respond" : "View"}
//                       </button>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </div>
//       )}

//       {/* MODALS */}
//       {showListModal && (
//         <ListProductModal
//           token={token}
//           onClose={() => setShowListModal(false)}
//           onSuccess={() => {
//             setShowListModal(false);
//             loadProducts();
//             showToast("✅ Crop listed!");
//           }}
//         />
//       )}
//       {selectedProduct && (
//         <BulkRequestModal
//           product={selectedProduct}
//           token={token}
//           onClose={() => setSelectedProduct(null)}
//           onSuccess={() => {
//             setSelectedProduct(null);
//             loadRequests();
//             showToast("📨 Request sent to farmer!");
//           }}
//         />
//       )}
//       {selectedRequest && (
//         <NegotiationModal
//           request={selectedRequest}
//           role={user?.role}
//           token={token}
//           onClose={() => setSelectedRequest(null)}
//           onAction={() => {
//             setSelectedRequest(null);
//             loadRequests();
//             showToast("✅ Action completed!");
//           }}
//         />
//       )}
//     </div>
//   );
// }

// const styles = {
//   errorBox: {
//     background: "#fce4ec",
//     border: "1px solid #ef9a9a",
//     borderRadius: "8px",
//     padding: "0.75rem 1rem",
//     color: "var(--red)",
//     marginBottom: "1rem",
//     fontSize: "0.88rem",
//   },
//   workflowBanner: {
//     display: "flex",
//     alignItems: "center",
//     gap: "0.5rem",
//     flexWrap: "wrap",
//     background: "var(--green-pale)",
//     border: "1px solid var(--green-soft)",
//     borderRadius: "8px",
//     padding: "1rem 1.5rem",
//     marginBottom: "1.5rem",
//   },
//   workflowStep: {
//     display: "flex",
//     alignItems: "center",
//     gap: "0.5rem",
//     fontSize: "0.85rem",
//     fontWeight: 600,
//     color: "var(--green-dark)",
//   },
//   stepNum: {
//     background: "var(--green-main)",
//     color: "white",
//     borderRadius: "50%",
//     width: 22,
//     height: 22,
//     display: "inline-flex",
//     alignItems: "center",
//     justifyContent: "center",
//     fontSize: "0.75rem",
//     fontWeight: 800,
//   },
//   workflowArrow: { color: "var(--green-mid)", fontWeight: 700 },
//   tabs: {
//     display: "flex",
//     gap: "0.5rem",
//     marginBottom: "1.25rem",
//     borderBottom: "2px solid var(--gray-200)",
//     paddingBottom: "0.25rem",
//   },
//   tab: {
//     padding: "0.55rem 1.2rem",
//     border: "none",
//     background: "none",
//     cursor: "pointer",
//     fontFamily: "inherit",
//     fontSize: "0.88rem",
//     fontWeight: 600,
//     color: "var(--gray-500)",
//     borderRadius: "8px 8px 0 0",
//     transition: "all 0.2s",
//     display: "flex",
//     alignItems: "center",
//     gap: 8,
//   },
//   tabActive: {
//     color: "var(--green-dark)",
//     background: "var(--green-pale)",
//     borderBottom: "2px solid var(--green-main)",
//   },
//   badge: {
//     background: "#ef4444",
//     color: "white",
//     borderRadius: "50%",
//     width: 18,
//     height: 18,
//     fontSize: 11,
//     fontWeight: 800,
//     display: "inline-flex",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   dealInfo: {
//     background: "var(--gray-50)",
//     borderRadius: "8px",
//     padding: "0.85rem 1rem",
//     marginBottom: "1rem",
//   },
//   dealRow: {
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: "0.3rem 0",
//     fontSize: "0.87rem",
//     color: "var(--gray-700)",
//   },
//   requestCard: {
//     background: "#fff",
//     border: "1px solid var(--gray-200)",
//     borderRadius: 12,
//     padding: "1rem 1.25rem",
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
//     boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
//   },
//   requestLeft: { display: "flex", alignItems: "center", gap: "1rem" },
//   toast: {
//     position: "fixed",
//     top: "80px",
//     right: "24px",
//     background: "var(--green-main)",
//     color: "white",
//     padding: "0.75rem 1.5rem",
//     borderRadius: "8px",
//     fontWeight: 600,
//     boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
//     zIndex: 999,
//     fontSize: "0.9rem",
//   },
// };

import { useState, useEffect } from "react";
import { useAuth } from "../context/Authcontext";
import { getToken } from "../services/authService";
import "../pages/Dashboard.css";

const BASE = "http://localhost:5000";

const CROP_EMOJIS = {
  Wheat: "🌾",
  Potato: "🥔",
  Tomato: "🍅",
  Onion: "🧅",
  Banana: "🍌",
  Orange: "🍊",
  Rice: "🍚",
  Maize: "🌽",
  Mustard: "🌻",
};
const getCropEmoji = (name) => CROP_EMOJIS[name] || "🌿";

// ✅ FIXED: was "countered" — schema uses "negotiating"
const STATUS_STYLE = {
  pending: { background: "#fef3c7", color: "#92400e" },
  accepted: { background: "#d1fae5", color: "#065f46" },
  rejected: { background: "#fee2e2", color: "#991b1b" },
  negotiating: { background: "#e0e7ff", color: "#3730a3" },
};

// ─── LIST PRODUCT MODAL (Farmer) ──────────────────────────────────────────────
function ListProductModal({ onClose, onSuccess, token }) {
  const [form, setForm] = useState({
    name: "Wheat",
    pricePerKg: "",
    quantityAvailable: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${BASE}/api/products/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          pricePerKg: Number(form.pricePerKg),
          quantityAvailable: Number(form.quantityAvailable),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to list product");
      onSuccess();
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">🌾 List Your Crop</div>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        {error && <div style={styles.errorBox}>⚠️ {error}</div>}
        <div className="form-group">
          <label className="form-label">Crop Name</label>
          <select
            className="form-select"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          >
            {Object.keys(CROP_EMOJIS).map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="two-col">
          <div className="form-group">
            <label className="form-label">Price per Kg (₹)</label>
            <input
              className="form-input"
              type="number"
              placeholder="e.g. 25"
              value={form.pricePerKg}
              onChange={(e) =>
                setForm((f) => ({ ...f, pricePerKg: e.target.value }))
              }
            />
          </div>
          <div className="form-group">
            <label className="form-label">Quantity (Kg)</label>
            <input
              className="form-input"
              type="number"
              placeholder="e.g. 1000"
              value={form.quantityAvailable}
              onChange={(e) =>
                setForm((f) => ({ ...f, quantityAvailable: e.target.value }))
              }
            />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <input
            className="form-input"
            placeholder="e.g. Fresh harvest, Grade A"
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
          />
        </div>
        <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
          <button
            className="btn btn-primary"
            style={{ flex: 1 }}
            onClick={submit}
            disabled={loading}
          >
            {loading ? "⏳ Listing..." : "✅ List Crop"}
          </button>
          <button className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── BULK REQUEST MODAL (Customer) ────────────────────────────────────────────
function BulkRequestModal({ product, onClose, onSuccess, token }) {
  const [form, setForm] = useState({
    quantity: "",
    proposedPrice: product.pricePerKg || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${BASE}/api/bulk-requests/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: product._id,
          quantity: Number(form.quantity),
          proposedPrice: Number(form.proposedPrice),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Request failed");
      onSuccess();
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">🛒 Request Bulk Purchase</div>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div style={styles.dealInfo}>
          <div style={styles.dealRow}>
            <span>Crop</span>
            <strong>
              {getCropEmoji(product.name)} {product.name}
            </strong>
          </div>
          <div style={styles.dealRow}>
            <span>Farmer's Price</span>
            <strong>₹{product.pricePerKg}/kg</strong>
          </div>
          <div style={styles.dealRow}>
            <span>Available</span>
            <strong>{product.quantityAvailable} Kg</strong>
          </div>
          {product.farmer?.name && (
            <div style={styles.dealRow}>
              <span>Farmer</span>
              <strong>👨‍🌾 {product.farmer.name}</strong>
            </div>
          )}
        </div>
        {error && <div style={styles.errorBox}>⚠️ {error}</div>}
        <div className="two-col">
          <div className="form-group">
            <label className="form-label">Quantity (Kg)</label>
            <input
              className="form-input"
              type="number"
              placeholder="e.g. 500"
              value={form.quantity}
              onChange={(e) =>
                setForm((f) => ({ ...f, quantity: e.target.value }))
              }
            />
          </div>
          <div className="form-group">
            <label className="form-label">Your Offer (₹/kg)</label>
            <input
              className="form-input"
              type="number"
              placeholder={product.pricePerKg}
              value={form.proposedPrice}
              onChange={(e) =>
                setForm((f) => ({ ...f, proposedPrice: e.target.value }))
              }
            />
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            className="btn btn-primary"
            style={{ flex: 1 }}
            onClick={submit}
            disabled={loading}
          >
            {loading ? "⏳ Sending..." : "📨 Send Request"}
          </button>
          <button className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── NEGOTIATION MODAL ────────────────────────────────────────────────────────
function NegotiationModal({ request, role, onClose, onAction, token }) {
  const [counterPrice, setCounterPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const doAction = async (action) => {
    setLoading(true);
    setError("");
    try {
      const endpoint =
        role === "farmer"
          ? `${BASE}/api/bulk-requests/farmer/${request._id}`
          : `${BASE}/api/bulk-requests/customer/${request._id}`;

      const body =
        action === "counter"
          ? { action, newPrice: Number(counterPrice) }
          : { action };

      const res = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Action failed");
      onAction();
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  // ✅ FIXED: was checking "countered" — schema uses "negotiating"
  // Farmer acts on "pending" requests
  // Customer acts on "negotiating" requests where farmer last countered
  const lastBy = request.negotiationHistory?.slice(-1)[0]?.by;
  const canAct =
    (role === "farmer" && request.status === "pending") ||
    (role === "farmer" &&
      request.status === "negotiating" &&
      lastBy === "customer") ||
    (role === "customer" &&
      request.status === "negotiating" &&
      lastBy === "farmer");

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">🤝 Negotiate Deal</div>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div style={styles.dealInfo}>
          <div style={styles.dealRow}>
            <span>Crop</span>
            <strong>
              {getCropEmoji(request.product?.name)}{" "}
              {request.product?.name || "—"}
            </strong>
          </div>
          <div style={styles.dealRow}>
            <span>Quantity</span>
            <strong>{request.quantity} Kg</strong>
          </div>
          {/* ✅ FIXED: proposedPrice is always the current offer (updated on each counter) */}
          <div style={styles.dealRow}>
            <span>Current Price</span>
            <strong>₹{request.proposedPrice}/kg</strong>
          </div>
          {request.finalPrice && (
            <div style={styles.dealRow}>
              <span>Final Price</span>
              <strong style={{ color: "#065f46" }}>
                ₹{request.finalPrice}/kg
              </strong>
            </div>
          )}
          {role === "farmer" && request.customer?.name && (
            <div style={styles.dealRow}>
              <span>Buyer</span>
              <strong>
                🛒 {request.customer.name} — {request.customer.district}
              </strong>
            </div>
          )}
          {role === "customer" && request.farmer?.name && (
            <div style={styles.dealRow}>
              <span>Farmer</span>
              <strong>
                👨‍🌾 {request.farmer.name} — {request.farmer.district}
              </strong>
            </div>
          )}
          <div style={styles.dealRow}>
            <span>Status</span>
            <span
              style={{
                ...(STATUS_STYLE[request.status] || {}),
                padding: "2px 10px",
                borderRadius: 12,
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {request.status}
            </span>
          </div>
        </div>

        {/* Negotiation history */}
        {request.negotiationHistory?.length > 0 && (
          <div style={{ marginBottom: "1rem" }}>
            <div
              style={{
                fontSize: "0.78rem",
                fontWeight: 700,
                color: "var(--gray-500)",
                marginBottom: 6,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Negotiation History
            </div>
            {request.negotiationHistory.map((h, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.83rem",
                  padding: "4px 0",
                  borderBottom: "1px solid var(--gray-100)",
                }}
              >
                <span
                  style={{
                    color: h.by === "farmer" ? "#1b4332" : "#92400e",
                    fontWeight: 600,
                  }}
                >
                  {h.by === "farmer" ? "👨‍🌾 Farmer" : "🛒 Buyer"}
                </span>
                <strong>₹{h.price}/kg</strong>
              </div>
            ))}
          </div>
        )}

        {error && <div style={styles.errorBox}>⚠️ {error}</div>}

        {canAct && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
          >
            <div className="form-group">
              <label className="form-label">Counter Price (₹/kg)</label>
              <input
                className="form-input"
                type="number"
                placeholder="Your counter offer"
                value={counterPrice}
                onChange={(e) => setCounterPrice(e.target.value)}
              />
            </div>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => doAction("accept")}
                disabled={loading}
              >
                ✅ Accept ₹{request.proposedPrice}/kg
              </button>
              <button
                className="btn btn-outline btn-sm"
                style={{ color: "var(--red)", borderColor: "var(--red)" }}
                onClick={() => doAction("reject")}
                disabled={loading}
              >
                ❌ Reject
              </button>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => doAction("counter")}
                disabled={loading || !counterPrice}
              >
                ↩️ Counter
              </button>
            </div>
          </div>
        )}

        {!canAct && (
          <div
            style={{
              textAlign: "center",
              marginTop: "1rem",
              color: "var(--gray-500)",
              fontSize: "0.9rem",
            }}
          >
            {request.status === "accepted" &&
              `🎉 Deal done at ₹${request.finalPrice || request.proposedPrice}/kg! Contact details above.`}
            {request.status === "rejected" && "❌ This request was rejected."}
            {request.status === "pending" &&
              role === "customer" &&
              "⏳ Waiting for farmer's response."}
            {request.status === "negotiating" &&
              role === "farmer" &&
              "⏳ Waiting for buyer's response."}
            {request.status === "negotiating" &&
              role === "customer" &&
              "⏳ Waiting for farmer's response."}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function DirectTrade() {
  const { user } = useAuth();
  const isFarmer = user?.role === "farmer";
  const token = getToken();

  const [products, setProducts] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [showListModal, setShowListModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [activeTab, setActiveTab] = useState("products");
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      // ✅ FIXED: farmers fetch their own listings, customers fetch marketplace
      const endpoint = isFarmer
        ? `${BASE}/api/products/my`
        : `${BASE}/api/products`;
      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setProducts(Array.isArray(json) ? json : []);
    } catch {
      setProducts([]);
    }
    setLoadingProducts(false);
  };

  // ✅ FIXED: was missing entirely — now fetches from GET /api/bulk-requests
  const loadRequests = async () => {
    setLoadingRequests(true);
    try {
      const res = await fetch(`${BASE}/api/bulk-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setRequests(Array.isArray(json.requests) ? json.requests : []);
    } catch {
      setRequests([]);
    }
    setLoadingRequests(false);
  };

  // ✅ FIXED: added `isFarmer` as dependency so if user loads late from
  // localStorage, loadProducts re-runs with the correct role and endpoint
  useEffect(() => {
    if (user) {
      // wait until user is confirmed loaded
      loadProducts();
      loadRequests();
    }
  }, [isFarmer]); // re-runs when role becomes known

  useEffect(() => {
    if (activeTab === "requests") loadRequests();
  }, [activeTab]);

  // ✅ FIXED: badge counts use "negotiating" not "countered"
  const actionNeeded = requests.filter((r) => {
    const lastBy = r.negotiationHistory?.slice(-1)[0]?.by;
    if (isFarmer)
      return (
        r.status === "pending" ||
        (r.status === "negotiating" && lastBy === "customer")
      );
    return r.status === "negotiating" && lastBy === "farmer";
  }).length;

  return (
    <div>
      {toast && <div style={styles.toast}>{toast}</div>}

      <div className="page-header">
        <h1>{isFarmer ? "🤝 Direct Selling" : "🛒 Direct Buying"}</h1>
        <p>
          {isFarmer
            ? "List your crops and negotiate directly with buyers"
            : "Browse crops and send bulk purchase requests to farmers"}
        </p>
      </div>

      {/* WORKFLOW BANNER */}
      <div style={styles.workflowBanner}>
        {["List / Browse", "Send Request", "Negotiate", "Deal Done ✅"].map(
          (step, i) => (
            <div
              key={i}
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <div style={styles.workflowStep}>
                <span style={styles.stepNum}>{i + 1}</span> {step}
              </div>
              {i < 3 && <div style={styles.workflowArrow}>→</div>}
            </div>
          ),
        )}
      </div>

      {/* TABS */}
      <div style={styles.tabs}>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === "products" ? styles.tabActive : {}),
          }}
          onClick={() => setActiveTab("products")}
        >
          {isFarmer ? "🌾 My Listings" : "🛒 Available Crops"}
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === "requests" ? styles.tabActive : {}),
          }}
          onClick={() => setActiveTab("requests")}
        >
          📋 Requests & Negotiations
          {actionNeeded > 0 && <span style={styles.badge}>{actionNeeded}</span>}
        </button>
      </div>

      {/* ── PRODUCTS TAB ─────────────────────────────────────────────────────── */}
      {activeTab === "products" && (
        <div>
          {isFarmer && (
            <div style={{ marginBottom: "1.25rem" }}>
              <button
                className="btn btn-primary"
                onClick={() => setShowListModal(true)}
              >
                ➕ List New Crop
              </button>
            </div>
          )}
          {loadingProducts ? (
            <div className="loading-box">
              <div className="spinner" />
              <span>Loading products...</span>
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">{isFarmer ? "🌱" : "🛍️"}</div>
              <h3>
                {isFarmer ? "No crops listed yet" : "No products available"}
              </h3>
              <p>
                {isFarmer
                  ? "Add your first crop listing above."
                  : "Check back later for available listings."}
              </p>
            </div>
          ) : (
            <div className="product-grid">
              {products.map((p) => (
                <div key={p._id} className="product-card">
                  <div className="product-emoji">{getCropEmoji(p.name)}</div>
                  <div className="product-name">{p.name}</div>
                  <div className="product-price">₹{p.pricePerKg}/kg</div>
                  <div className="product-qty">
                    📦 {p.quantityAvailable} Kg available
                  </div>
                  {p.farmer?.name && (
                    <div className="product-farmer">👨‍🌾 {p.farmer.name}</div>
                  )}
                  {p.farmer?.district && (
                    <div
                      style={{ fontSize: "0.8rem", color: "var(--gray-500)" }}
                    >
                      📍 {p.farmer.district}
                    </div>
                  )}
                  {p.description && (
                    <div
                      style={{ fontSize: "0.8rem", color: "var(--gray-500)" }}
                    >
                      {p.description}
                    </div>
                  )}
                  <div className="product-actions">
                    {!isFarmer && (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => setSelectedProduct(p)}
                      >
                        🛒 Request Purchase
                      </button>
                    )}
                    {isFarmer && (
                      <span className="badge badge-green">Your Listing</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── REQUESTS TAB ─────────────────────────────────────────────────────── */}
      {activeTab === "requests" && (
        <div>
          {loadingRequests ? (
            <div className="loading-box">
              <div className="spinner" />
              <span>Loading requests...</span>
            </div>
          ) : requests.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3>No requests yet</h3>
              <p>
                {isFarmer
                  ? "Buyer requests will appear here once customers send them."
                  : "Send a purchase request from the Available Crops tab."}
              </p>
            </div>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              {requests.map((r) => {
                const lastBy = r.negotiationHistory?.slice(-1)[0]?.by;
                // ✅ FIXED: uses "negotiating" not "countered"
                const myTurn =
                  (isFarmer &&
                    (r.status === "pending" ||
                      (r.status === "negotiating" && lastBy === "customer"))) ||
                  (!isFarmer &&
                    r.status === "negotiating" &&
                    lastBy === "farmer");
                return (
                  <div
                    key={r._id}
                    style={{
                      ...styles.requestCard,
                      borderLeft: myTurn
                        ? "4px solid #2d6a4f"
                        : "4px solid transparent",
                    }}
                  >
                    <div style={styles.requestLeft}>
                      <span style={{ fontSize: "2rem" }}>
                        {getCropEmoji(r.product?.name)}
                      </span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "1rem" }}>
                          {r.product?.name}
                        </div>
                        <div
                          style={{
                            fontSize: "0.83rem",
                            color: "var(--gray-500)",
                          }}
                        >
                          {r.quantity} Kg &nbsp;•&nbsp; Current: ₹
                          {r.proposedPrice}/kg
                          {r.negotiationHistory?.length > 1 && (
                            <span style={{ color: "#3730a3" }}>
                              {" "}
                              &nbsp;•&nbsp; {r.negotiationHistory.length} rounds
                            </span>
                          )}
                        </div>
                        <div
                          style={{
                            fontSize: "0.8rem",
                            color: "var(--gray-500)",
                            marginTop: 2,
                          }}
                        >
                          {isFarmer
                            ? `🛒 From: ${r.customer?.name || "—"} (${r.customer?.district || ""})`
                            : `👨‍🌾 Farmer: ${r.farmer?.name || "—"} (${r.farmer?.district || ""})`}
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                      }}
                    >
                      <span
                        style={{
                          ...(STATUS_STYLE[r.status] || {}),
                          padding: "4px 12px",
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        {r.status}
                      </span>
                      <button
                        className={
                          myTurn
                            ? "btn btn-primary btn-sm"
                            : "btn btn-outline btn-sm"
                        }
                        onClick={() => setSelectedRequest(r)}
                      >
                        {myTurn ? "🤝 Respond" : "View"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODALS */}
      {showListModal && (
        <ListProductModal
          token={token}
          onClose={() => setShowListModal(false)}
          onSuccess={() => {
            setShowListModal(false);
            loadProducts();
            showToast("✅ Crop listed!");
          }}
        />
      )}
      {selectedProduct && (
        <BulkRequestModal
          product={selectedProduct}
          token={token}
          onClose={() => setSelectedProduct(null)}
          onSuccess={() => {
            setSelectedProduct(null);
            loadRequests();
            showToast("📨 Request sent to farmer!");
          }}
        />
      )}
      {selectedRequest && (
        <NegotiationModal
          request={selectedRequest}
          role={user?.role}
          token={token}
          onClose={() => setSelectedRequest(null)}
          onAction={() => {
            setSelectedRequest(null);
            loadRequests();
            showToast("✅ Action completed!");
          }}
        />
      )}
    </div>
  );
}

const styles = {
  errorBox: {
    background: "#fce4ec",
    border: "1px solid #ef9a9a",
    borderRadius: "8px",
    padding: "0.75rem 1rem",
    color: "var(--red)",
    marginBottom: "1rem",
    fontSize: "0.88rem",
  },
  workflowBanner: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    flexWrap: "wrap",
    background: "var(--green-pale)",
    border: "1px solid var(--green-soft)",
    borderRadius: "8px",
    padding: "1rem 1.5rem",
    marginBottom: "1.5rem",
  },
  workflowStep: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.85rem",
    fontWeight: 600,
    color: "var(--green-dark)",
  },
  stepNum: {
    background: "var(--green-main)",
    color: "white",
    borderRadius: "50%",
    width: 22,
    height: 22,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.75rem",
    fontWeight: 800,
  },
  workflowArrow: { color: "var(--green-mid)", fontWeight: 700 },
  tabs: {
    display: "flex",
    gap: "0.5rem",
    marginBottom: "1.25rem",
    borderBottom: "2px solid var(--gray-200)",
    paddingBottom: "0.25rem",
  },
  tab: {
    padding: "0.55rem 1.2rem",
    border: "none",
    background: "none",
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: "0.88rem",
    fontWeight: 600,
    color: "var(--gray-500)",
    borderRadius: "8px 8px 0 0",
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  tabActive: {
    color: "var(--green-dark)",
    background: "var(--green-pale)",
    borderBottom: "2px solid var(--green-main)",
  },
  badge: {
    background: "#ef4444",
    color: "white",
    borderRadius: "50%",
    width: 18,
    height: 18,
    fontSize: 11,
    fontWeight: 800,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  dealInfo: {
    background: "var(--gray-50)",
    borderRadius: "8px",
    padding: "0.85rem 1rem",
    marginBottom: "1rem",
  },
  dealRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.3rem 0",
    fontSize: "0.87rem",
    color: "var(--gray-700)",
  },
  requestCard: {
    background: "#fff",
    border: "1px solid var(--gray-200)",
    borderRadius: 12,
    padding: "1rem 1.25rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
  },
  requestLeft: { display: "flex", alignItems: "center", gap: "1rem" },
  toast: {
    position: "fixed",
    top: "80px",
    right: "24px",
    background: "var(--green-main)",
    color: "white",
    padding: "0.75rem 1.5rem",
    borderRadius: "8px",
    fontWeight: 600,
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
    zIndex: 999,
    fontSize: "0.9rem",
  },
};
