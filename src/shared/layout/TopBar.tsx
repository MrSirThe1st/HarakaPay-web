// src/components/layout/TopBar.tsx
"use client";

import React, { useState } from "react";
import { 
  Header, 
  HeaderName, 
  HeaderGlobalBar, 
  HeaderGlobalAction,
  OverflowMenu,
  OverflowMenuItem,
  SkipToContent
} from "@carbon/react";
import { 
  IoNotifications,
  IoPerson,
  IoLanguage,
  IoLogOut,
  IoSettings
} from "react-icons/io5";
import { useDualAuth } from "@/shared/hooks/useDualAuth";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const TopBar = () => {
  const { user, profile, signOut, canAccessAdminPanel, canAccessSchoolPanel } = useDualAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const getUserRole = () => {
    if (canAccessAdminPanel) return "Admin";
    if (canAccessSchoolPanel) return "School Staff";
    return "User";
  };

  const getRoleColor = () => {
    if (canAccessAdminPanel) return "var(--cds-interactive-01)";
    if (canAccessSchoolPanel) return "var(--cds-support-success)";
    return "var(--cds-text-secondary)";
  };

  return (
    <>
      <SkipToContent />
      <Header aria-label="HarakaPay Platform" className="top-bar">
        <HeaderName href="/dashboard" prefix="" className="brand-name">
          <span className="brand-text">
            HarakaPay
          </span>
        </HeaderName>
        
        <HeaderGlobalBar className="header-actions">
          {/* Language Switcher */}
          <div className="language-switcher">
            <LanguageSwitcher variant="compact" />
          </div>

          {/* Notifications */}
          <HeaderGlobalAction 
            aria-label="Notifications"
            className="action-button"
          >
            <IoNotifications size={20} />
          </HeaderGlobalAction>

          {/* User Profile Menu */}
          <div className="user-menu-container">
            <HeaderGlobalAction 
              aria-label="User Profile"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="action-button user-button"
            >
              <IoPerson size={20} />
            </HeaderGlobalAction>

            {/* User Dropdown Menu */}
            {showUserMenu && (
              <div
                className="user-dropdown"
                onMouseLeave={() => setShowUserMenu(false)}
              >
                <div className="user-info">
                  <div className="user-name">
                    {user?.name || user?.email}
                  </div>
                  <div className="user-role" style={{ color: getRoleColor() }}>
                    {getUserRole()}
                  </div>
                </div>

                <div className="menu-actions">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      window.location.href = "/settings";
                    }}
                    className="menu-item"
                  >
                    <IoSettings size={16} />
                    Settings
                  </button>
                  
                  <button
                    onClick={handleSignOut}
                    className="menu-item signout"
                  >
                    <IoLogOut size={16} />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </HeaderGlobalBar>
      </Header>

      <style jsx>{`
        .top-bar {
          background: linear-gradient(90deg, var(--cds-layer) 0%, var(--cds-layer-02) 100%) !important;
          border-bottom: 1px solid var(--cds-border-subtle) !important;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
          z-index: 8000 !important;
        }
        
        .brand-name {
          padding: 0 1rem !important;
        }
        
        .brand-text {
          font-weight: 700 !important;
          font-size: 1.25rem !important;
          color: var(--cds-text-primary) !important;
          letter-spacing: -0.025em !important;
        }
        
        .header-actions {
          display: flex !important;
          align-items: center !important;
          gap: 0.5rem !important;
          padding-right: 1rem !important;
        }
        
        .language-switcher {
          display: flex;
          align-items: center;
          margin-right: 0.5rem;
          padding: 0 0.5rem;
        }
        
        .action-button {
          background: transparent !important;
          border: none !important;
          color: var(--cds-text-primary) !important;
          transition: all 0.2s ease !important;
          border-radius: 4px !important;
          padding: 0.5rem !important;
        }
        
        .action-button:hover {
          background-color: var(--cds-layer-hover) !important;
          color: var(--cds-interactive-01) !important;
          transform: translateY(-1px) !important;
        }
        
        .user-button {
          position: relative;
        }
        
        .user-menu-container {
          position: relative;
        }
        
        .user-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          background: var(--cds-layer);
          border: 1px solid var(--cds-border-subtle);
          border-radius: 8px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          min-width: 220px;
          z-index: 9000;
          overflow: hidden;
        }
        
        .user-info {
          padding: 1rem;
          border-bottom: 1px solid var(--cds-border-subtle);
          background: var(--cds-layer-02);
        }
        
        .user-name {
          font-weight: 600;
          margin-bottom: 0.25rem;
          color: var(--cds-text-primary);
          font-size: 0.875rem;
        }
        
        .user-role {
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .menu-actions {
          padding: 0.5rem;
        }
        
        .menu-item {
          width: 100%;
          padding: 0.75rem 1rem;
          background: transparent;
          border: none;
          border-radius: 4px;
          color: var(--cds-text-primary);
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .menu-item:hover {
          background-color: var(--cds-layer-hover);
          color: var(--cds-interactive-01);
        }
        
        .menu-item.signout:hover {
          background-color: var(--cds-support-error);
          color: white;
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
          .brand-text {
            font-size: 1rem !important;
          }
          
          .header-actions {
            gap: 0.25rem !important;
            padding-right: 0.5rem !important;
          }
        }
      `}</style>
    </>
  );
};

export default TopBar;