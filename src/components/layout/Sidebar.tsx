// src/components/layout/Sidebar.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { SideNav, SideNavItems, SideNavLink, SideNavMenu, SideNavMenuItem } from "@carbon/react";
import { 
  Dashboard, 
  Settings, 
  UserAvatarFilledAlt, 
  Report, 
  Money,
  UserMultiple,
  Education,
  ChartColumn
} from "@carbon/icons-react";
import { useDualAuth } from "@/hooks/useDualAuth";
import "@carbon/styles/css/styles.css";

const Sidebar = () => {
  const [expanded, setExpanded] = useState(false);
  const pathname = usePathname();
  const { isAdmin, isSchoolStaff } = useDualAuth();
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sidebarElement = sidebarRef.current;
    if (!sidebarElement) return;

    let isHovered = false;

    const handleMouseEnter = () => {
      isHovered = true;
      setExpanded(true);
    };

    const handleMouseLeave = (e: MouseEvent) => {
      // Check if the mouse is actually leaving the sidebar area
      const rect = sidebarElement.getBoundingClientRect();
      const { clientX, clientY } = e;
      
      if (
        clientX < rect.left ||
        clientX > rect.right ||
        clientY < rect.top ||
        clientY > rect.bottom
      ) {
        isHovered = false;
        setExpanded(false);
      }
    };

    // Global mouse move handler to ensure we catch mouse leave events
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isHovered) return;
      
      const rect = sidebarElement.getBoundingClientRect();
      const { clientX, clientY } = e;
      
      // If mouse is outside sidebar bounds and we think it's hovered, close it
      if (
        clientX < rect.left ||
        clientX > rect.right ||
        clientY < rect.top ||
        clientY > rect.bottom
      ) {
        isHovered = false;
        setExpanded(false);
      }
    };

    sidebarElement.addEventListener('mouseenter', handleMouseEnter);
    sidebarElement.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mousemove', handleGlobalMouseMove);

    return () => {
      sidebarElement.removeEventListener('mouseenter', handleMouseEnter);
      sidebarElement.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mousemove', handleGlobalMouseMove);
    };
  }, []);

  return (
    <div
      ref={sidebarRef}
      style={{
        width: expanded ? 256 : 64,
        transition: "width 0.2s ease-in-out",
        position: "fixed",
        height: "100vh",
        zIndex: 100,
        top: 48, // Account for top bar height
        backgroundColor: "var(--cds-layer)",
        borderRight: "1px solid var(--cds-border-subtle)",
      }}
    >
      <SideNav isRail={!expanded} expanded={expanded} aria-label="Side navigation">
        <SideNavItems>
          <SideNavLink 
            renderIcon={Dashboard} 
            href="/dashboard"
            isActive={pathname === "/dashboard"}
          >
            Dashboard
          </SideNavLink>

          {/* Payments - Available to both admin and school staff */}
          <SideNavLink 
            renderIcon={Money} 
            href="/payments"
            isActive={pathname === "/payments"}
          >
            Payments
          </SideNavLink>

          {/* School Staff Only Navigation */}
          {isSchoolStaff && (
            <SideNavLink 
              renderIcon={Education} 
              href="/students"
              isActive={pathname === "/students"}
            >
              Students
            </SideNavLink>
          )}

          {/* Admin Only Navigation */}
          {isAdmin && (
            <>
              <SideNavMenu renderIcon={UserAvatarFilledAlt} title="User Management">
                <SideNavMenuItem href="/admin" isActive={pathname === "/admin"}>
                  Admin Users
                </SideNavMenuItem>
                <SideNavMenuItem href="/schools" isActive={pathname === "/schools"}>
                  Schools
                </SideNavMenuItem>
              </SideNavMenu>

              <SideNavLink 
                renderIcon={Report} 
                href="/reports"
                isActive={pathname === "/reports"}
              >
                Reports
              </SideNavLink>

              <SideNavLink 
                renderIcon={ChartColumn} 
                href="/analytics"
                isActive={pathname === "/analytics"}
              >
                Analytics
              </SideNavLink>
            </>
          )}

          <SideNavLink 
            renderIcon={Settings} 
            href="/settings"
            isActive={pathname === "/settings"}
          >
            Settings
          </SideNavLink>
        </SideNavItems>
      </SideNav>
    </div>
  );
};

export default Sidebar;