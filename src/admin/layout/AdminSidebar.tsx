// src/components/layout/AdminSidebar.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { SideNav, SideNavItems, SideNavLink, SideNavMenu, SideNavMenuItem } from "@carbon/react";
import { 
  IoStatsChart,
  IoSettings,
  IoPeople,
  IoDocumentText,
  IoCard,
  IoBusiness,
  IoSchool,
  IoBarChart
} from "react-icons/io5";
import "@carbon/styles/css/styles.css";

const AdminSidebar = () => {
  const [expanded, setExpanded] = useState(false);
  const pathname = usePathname();
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

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isHovered) return;
      
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
        top: 48,
        backgroundColor: "var(--cds-layer)",
        borderRight: "1px solid var(--cds-border-subtle)",
      }}
    >
      <SideNav isRail={!expanded} expanded={expanded} aria-label="Admin navigation">
        <SideNavItems>
          <SideNavLink 
            renderIcon={IoStatsChart} 
            href="/dashboard"
            isActive={pathname === "/dashboard"}
          >
            Dashboard
          </SideNavLink>

          <SideNavLink 
            renderIcon={IoCard} 
            href="/payments"
            isActive={pathname === "/payments"}
          >
            Payments
          </SideNavLink>

          <SideNavMenu renderIcon={IoPeople} title="User Management">
            <SideNavMenuItem href="/admin" isActive={pathname === "/admin"}>
              Admin Users
            </SideNavMenuItem>
            <SideNavMenuItem href="/schools" isActive={pathname === "/schools"}>
              Schools
            </SideNavMenuItem>
          </SideNavMenu>

          <SideNavLink 
            renderIcon={IoDocumentText} 
            href="/reports"
            isActive={pathname === "/reports"}
          >
            Reports
          </SideNavLink>

          <SideNavLink 
            renderIcon={IoBarChart} 
            href="/analytics"
            isActive={pathname === "/analytics"}
          >
            Analytics
          </SideNavLink>

          <SideNavLink 
            renderIcon={IoSettings} 
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

export default AdminSidebar;
