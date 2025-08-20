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
  Notification, 
  UserAvatarFilledAlt, 
  Language,
  Logout
} from "@carbon/icons-react";
import { useDualAuth } from "@/hooks/useDualAuth";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const TopBar = () => {
  const { user, profile, signOut, isAdmin, isSchoolStaff } = useDualAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const getUserRole = () => {
    if (isAdmin) return "Admin";
    if (isSchoolStaff) return "School Staff";
    return "User";
  };

  return (
    <>
      <SkipToContent />
      <Header aria-label="HarakaPay Platform" style={{ zIndex: 8000 }}>
        <HeaderName href="/dashboard" prefix="">
          <span style={{ fontWeight: 600, color: "var(--cds-text-primary)" }}>
            HarakaPay
          </span>
        </HeaderName>
        
        <HeaderGlobalBar>
          {/* Language Switcher */}
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            marginRight: "1rem",
            padding: "0 0.5rem"
          }}>
            <LanguageSwitcher variant="compact" />
          </div>

          {/* Notifications */}
          <HeaderGlobalAction 
            aria-label="Notifications"
          >
            <Notification size={20} />
          </HeaderGlobalAction>

          {/* User Profile Menu */}
          <div style={{ position: "relative" }}>
            <HeaderGlobalAction 
              aria-label="User Profile"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <UserAvatarFilledAlt size={20} />
            </HeaderGlobalAction>

            {/* User Dropdown Menu */}
            {showUserMenu && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  background: "var(--cds-layer)",
                  border: "1px solid var(--cds-border-subtle)",
                  borderRadius: "4px",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                  minWidth: "200px",
                  zIndex: 9000,
                }}
                onMouseLeave={() => setShowUserMenu(false)}
              >
                <div style={{ 
                  padding: "12px 16px", 
                  borderBottom: "1px solid var(--cds-border-subtle)",
                  fontSize: "14px"
                }}>
                  <div style={{ fontWeight: 600, marginBottom: "4px" }}>
                    {user?.name || user?.email}
                  </div>
                  <div style={{ 
                    color: "var(--cds-text-secondary)", 
                    fontSize: "12px" 
                  }}>
                    {getUserRole()}
                  </div>
                </div>

                <div style={{ padding: "8px 0" }}>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      // Navigate to profile or settings
                      window.location.href = "/settings";
                    }}
                    style={{
                      width: "100%",
                      padding: "8px 16px",
                      border: "none",
                      background: "transparent",
                      textAlign: "left",
                      cursor: "pointer",
                      fontSize: "14px",
                      color: "var(--cds-text-primary)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "var(--cds-layer-hover)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    Profile Settings
                  </button>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      handleSignOut();
                    }}
                    style={{
                      width: "100%",
                      padding: "8px 16px",
                      border: "none",
                      background: "transparent",
                      textAlign: "left",
                      cursor: "pointer",
                      fontSize: "14px",
                      color: "var(--cds-text-primary)",
                      borderTop: "1px solid var(--cds-border-subtle)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "var(--cds-layer-hover)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </HeaderGlobalBar>
      </Header>
    </>
  );
};

export default TopBar;