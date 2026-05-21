
// src/components/LocationMap.jsx
// ReWear — Location-Based Matching with Map View

import { useState, useEffect, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";

// Fix default marker icons (leaflet issue in React)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom green marker for user's own location
const userIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Haversine formula — no extra package needed
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Recenter map when user location changes
function MapController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, 13);
  }, [center, map]);
  return null;
}

// Category emoji map
const EMOJI_MAP = {
  tops: "👚", bottoms: "👖", dresses: "👗", outerwear: "🧥",
  shoes: "👟", accessories: "🧣", activewear: "🏃", formal: "👔",
  kids: "🧒", other: "📦",
};

// Demo listings — shown when API has no data yet
const DEMO_LISTINGS = [
  { id: 1, name: "Floral Kurti", size: "M", category: "tops", user: "Priya S.", lat: 26.762, lng: 83.374 },
  { id: 2, name: "Blue Jeans", size: "L", category: "bottoms", user: "Ananya R.", lat: 26.758, lng: 83.382 },
  { id: 3, name: "Silk Saree", size: "Free", category: "dresses", user: "Meera K.", lat: 26.770, lng: 83.365 },
  { id: 4, name: "Woolen Scarf", size: "Free", category: "accessories", user: "Tanya B.", lat: 26.753, lng: 83.391 },
  { id: 5, name: "Winter Jacket", size: "XL", category: "outerwear", user: "Ritu M.", lat: 26.748, lng: 83.360 },
  { id: 6, name: "Cotton Top", size: "S", category: "tops", user: "Sneha P.", lat: 26.780, lng: 83.400 },
  { id: 7, name: "Bodycon Dress", size: "M", category: "dresses", user: "Kavya T.", lat: 26.742, lng: 83.378 },
  { id: 8, name: "Leather Gloves", size: "Free", category: "accessories", user: "Diya N.", lat: 26.766, lng: 83.355 },
];

const CATEGORIES = ["all", "tops", "bottoms", "dresses", "outerwear", "accessories", "activewear", "formal", "kids", "other"];

const styles = {
  wrapper: { fontFamily: "'Segoe UI', sans-serif", maxWidth: 900, margin: "0 auto", padding: "1rem", background: "#f8faf9", minHeight: "100vh" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" },
  logo: { fontSize: 22, fontWeight: 600, color: "#1a1a1a" },
  logoSpan: { color: "#1D9E75" },
  locPill: { display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#555", background: "#fff", border: "1px solid #ddd", borderRadius: 20, padding: "5px 14px" },
  gpsBtn: { width: "100%", padding: "10px 16px", borderRadius: 10, border: "1.5px solid #1D9E75", background: "transparent", color: "#0F6E56", fontSize: 14, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: "0.75rem" },
  statusMsg: { fontSize: 13, color: "#888", textAlign: "center", marginBottom: "0.75rem" },
  radiusRow: { display: "flex", alignItems: "center", gap: 12, marginBottom: "0.75rem" },
  radiusLabel: { fontSize: 13, color: "#555", whiteSpace: "nowrap" },
  radiusVal: { fontSize: 13, fontWeight: 600, color: "#1D9E75", minWidth: 48 },
  filters: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: "1rem" },
  filterBase: { fontSize: 13, padding: "5px 14px", borderRadius: 20, border: "1px solid #ddd", background: "transparent", color: "#555", cursor: "pointer", transition: "all 0.15s" },
  filterActive: { background: "#E1F5EE", borderColor: "#1D9E75", color: "#0F6E56", fontWeight: 500 },
  mapBox: { borderRadius: 14, overflow: "hidden", border: "1px solid #ddd", marginBottom: "1rem", height: 340 },
  sectionHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" },
  sectionTitle: { fontSize: 15, fontWeight: 600, color: "#1a1a1a" },
  badge: { fontSize: 12, padding: "3px 10px", borderRadius: 20, background: "#E6F1FB", color: "#185FA5" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10, marginBottom: "1.5rem" },
  card: { background: "#fff", border: "1px solid #e5e5e5", borderRadius: 12, overflow: "hidden", cursor: "pointer", transition: "border-color 0.15s" },
  cardHot: { borderColor: "#1D9E75" },
  cardImgBox: { height: 100, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, background: "#f4faf8" },
  cardImg: { width: "100%", height: "100%", objectFit: "cover" },
  cardBody: { padding: "10px 12px 12px" },
  cardName: { fontSize: 14, fontWeight: 600, color: "#1a1a1a", marginBottom: 2 },
  cardMeta: { fontSize: 12, color: "#888", marginBottom: 8 },
  cardFooter: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  distTag: { fontSize: 12, color: "#888" },
  swapBtn: { fontSize: 12, padding: "4px 10px", borderRadius: 6, border: "1px solid #1D9E75", color: "#0F6E56", background: "transparent", cursor: "pointer" },
  emptyMsg: { gridColumn: "1 / -1", textAlign: "center", padding: "2rem", color: "#aaa", fontSize: 14 },
  apiTag: { fontSize: 11, padding: "2px 8px", borderRadius: 10, background: "#E1F5EE", color: "#0F6E56", marginLeft: 8 },
};

export default function LocationMap() {
  const [userCoords, setUserCoords] = useState(null);
  const [locLabel, setLocLabel] = useState("Set location");
  const [statusMsg, setStatusMsg] = useState("");
  const [gpsLabel, setGpsLabel] = useState("📍 Detect my location");
  const [radius, setRadius] = useState(10);
  const [activeFilter, setActiveFilter] = useState("all");
  const [listings, setListings] = useState(DEMO_LISTINGS);
  const [isRealData, setIsRealData] = useState(false); // ← track if real API data loaded

  // ── Fetch real listings from backend when userCoords or radius changes ──────
  useEffect(() => {
    if (!userCoords) return;

    const params = new URLSearchParams({
      lat: userCoords.lat,
      lng: userCoords.lng,
      radius,
      ...(activeFilter !== "all" && { category: activeFilter }),
    });

    fetch(`/api/items/nearby?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.items && data.items.length > 0) {
          setListings(data.items);
          setIsRealData(true);
        } else {
          // No real items yet — keep demo data
          setListings(DEMO_LISTINGS);
          setIsRealData(false);
        }
      })
      .catch(() => {
        // API unreachable — keep demo data silently
        setListings(DEMO_LISTINGS);
        setIsRealData(false);
      });
  }, [userCoords, radius, activeFilter]);
  // ──────────────────────────────────────────────────────────────────────────

  // Enrich listings with distance
  const enriched = listings.map((l) => ({
    ...l,
    distKm: userCoords
      ? parseFloat(getDistanceKm(userCoords.lat, userCoords.lng, l.lat, l.lng).toFixed(1))
      : null,
  }));

  const filtered = enriched.filter(
    (l) =>
      (activeFilter === "all" || l.category === activeFilter) &&
      (l.distKm === null || l.distKm <= radius)
  );

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setStatusMsg("Geolocation not supported in this browser.");
      return;
    }
    setGpsLabel("Detecting...");
    setStatusMsg("Requesting location access...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserCoords(coords);
        setLocLabel(`${coords.lat.toFixed(3)}, ${coords.lng.toFixed(3)}`);
        setGpsLabel("✓ Location detected");
        setStatusMsg("Showing listings near your current location.");
      },
      () => {
        setStatusMsg("Location access denied. Showing demo data around Gorakhpur.");
        setGpsLabel("📍 Detect my location");
        setUserCoords({ lat: 26.762, lng: 83.373 });
        setLocLabel("Gorakhpur (demo)");
      }
    );
  }, []);

  const mapCenter = userCoords ? [userCoords.lat, userCoords.lng] : [26.762, 83.373];

  return (
    <div style={styles.wrapper}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.logo}>
          re<span style={styles.logoSpan}>wear</span>
          {isRealData && <span style={styles.apiTag}>Live data</span>}
        </div>
        <div style={styles.locPill}>📌 {locLabel}</div>
      </div>

      {/* GPS Button */}
      <button style={styles.gpsBtn} onClick={detectLocation}>
        {gpsLabel}
      </button>
      {statusMsg && <div style={styles.statusMsg}>{statusMsg}</div>}

      {/* Radius Slider */}
      <div style={styles.radiusRow}>
        <span style={styles.radiusLabel}>🔵 Radius</span>
        <input
          type="range" min={1} max={50} step={1} value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
          style={{ flex: 1 }}
        />
        <span style={styles.radiusVal}>{radius} km</span>
      </div>

      {/* Category Filters */}
      <div style={styles.filters}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            style={{ ...styles.filterBase, ...(activeFilter === cat ? styles.filterActive : {}) }}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* MAP */}
      <div style={styles.mapBox}>
        <MapContainer center={mapCenter} zoom={13} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapController center={userCoords ? [userCoords.lat, userCoords.lng] : null} />

          {userCoords && (
            <>
              <Marker position={[userCoords.lat, userCoords.lng]} icon={userIcon}>
                <Popup>📍 You are here</Popup>
              </Marker>
              <Circle
                center={[userCoords.lat, userCoords.lng]}
                radius={radius * 1000}
                pathOptions={{ color: "#1D9E75", fillColor: "#1D9E75", fillOpacity: 0.07, weight: 1.5 }}
              />
            </>
          )}

          {filtered.map((l) => (
            <Marker key={l.id} position={[l.lat, l.lng]}>
              <Popup>
                <strong>{EMOJI_MAP[l.category] || "📦"} {l.name}</strong><br />
                Size: {l.size}<br />
                By: {l.user}<br />
                {l.distKm !== null && <>Distance: {l.distKm} km</>}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Listing Cards */}
      <div style={styles.sectionHeader}>
        <div style={styles.sectionTitle}>
          Nearby listings
          {!isRealData && <span style={{ fontSize: 12, color: "#aaa", fontWeight: 400, marginLeft: 8 }}>(demo)</span>}
        </div>
        <div style={styles.badge}>{filtered.length} found</div>
      </div>

      <div style={styles.grid}>
        {filtered.length === 0 ? (
          <div style={styles.emptyMsg}>No listings in this radius. Try increasing the slider ☝️</div>
        ) : (
          filtered.map((l) => (
            <div key={l.id} style={{ ...styles.card, ...(l.distKm && l.distKm < 2 ? styles.cardHot : {}) }}>
              {/* Show real image if available, otherwise emoji */}
              <div style={styles.cardImgBox}>
                {l.image
                  ? <img src={l.image} alt={l.name} style={styles.cardImg} />
                  : EMOJI_MAP[l.category] || "📦"
                }
              </div>
              <div style={styles.cardBody}>
                <div style={styles.cardName}>{l.name}</div>
                <div style={styles.cardMeta}>Size {l.size} · {l.user}</div>
                <div style={styles.cardFooter}>
                  <span style={styles.distTag}>
                    {l.distKm !== null ? `${l.distKm} km` : "—"}
                  </span>
                  <button style={styles.swapBtn}>Swap →</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
