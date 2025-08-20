import React from "react";
import TopBar from "./TopBar";
import Sidebar from "./Sidebar";

const MainLayout = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
    <TopBar />
    <div style={{ display: "flex", flex: 1 }}>
      <Sidebar />
      <main style={{ marginLeft: 64, padding: 24, width: "100%" }}>
        {children}
      </main>
    </div>
  </div>
);

export default MainLayout;
