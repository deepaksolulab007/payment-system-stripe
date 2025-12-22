import Sidebar from "./Sidebar";

export default function AdminLayout({ children }) {
  return (
    <div style={{ 
      display: "flex", 
      height: "100vh", 
      background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)"
    }}>
      {/* Sidebar stays fixed width */}
      <div style={{ width: "240px" }}>
        <Sidebar />
      </div>

      {/* Main content area */}
      <div
        style={{
          flex: 1,
          padding: "30px",
          overflowY: "auto",
          color: "white",
        }}
      >
        {children}
      </div>
    </div>
  );
}
