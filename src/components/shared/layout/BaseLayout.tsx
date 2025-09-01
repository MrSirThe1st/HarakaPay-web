// src/components/layout/BaseLayout.tsx
import React from "react";
import AdminTopbar from "@/components/admin/layout/AdminTopbar";
import SchoolTopbar from "@/components/school/layout/SchoolTopbar";
import { useDualAuth } from "@/hooks/shared/hooks/useDualAuth";

interface BaseLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
}

const BaseLayout = ({ children, sidebar }: BaseLayoutProps) => {
  const { canAccessAdminPanel, canAccessSchoolPanel } = useDualAuth();
  
  const renderTopbar = () => {
    if (canAccessAdminPanel) {
      return <AdminTopbar />;
    } else if (canAccessSchoolPanel) {
      return <SchoolTopbar />;
    }
    return null;
  };
  
  return (
    <div className="app-layout">
      {renderTopbar()}
      
      <div className="main-container">
        {sidebar}
        
        <main className="main-content">
          {children}
        </main>
      </div>

      <style jsx>{`
        .app-layout {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          background: var(--cds-background);
        }
        
        .main-container {
          display: flex;
          flex: 1;
          position: relative;
        }
        
        .main-content {
          margin-left: 64px; /* Collapsed sidebar width */
          margin-top: 48px;  /* Top bar height */
          padding: 24px;
          width: calc(100% - 64px);
          min-height: calc(100vh - 48px);
          background: var(--cds-background);
          transition: margin-left 0.2s ease;
          overflow-x: auto;
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
          .main-content {
            margin-left: 0;
            width: 100%;
            padding: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default BaseLayout;
