// src/components/layout/MainLayout.tsx
import React from "react";
import TopBar from "./TopBar";
import Sidebar from "./Sidebar";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      minHeight: "100vh",
      background: "var(--cds-background)"
    }}>
      <TopBar />
      
      <div style={{ display: "flex", flex: 1 }}>
        <Sidebar />
        
        <main style={{ 
          marginLeft: 64, // Collapsed sidebar width
          marginTop: 48,   // Top bar height
          padding: "24px",
          width: "calc(100% - 64px)",
          minHeight: "calc(100vh - 48px)",
          background: "var(--cds-background)",
          transition: "margin-left 0.2s ease"
        }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;