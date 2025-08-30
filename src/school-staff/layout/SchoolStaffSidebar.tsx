// src/components/layout/SchoolStaffSidebar.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { SideNav, SideNavItems, SideNavLink } from "@carbon/react";
import { 
  IoStatsChart,
  IoSettings,
  IoCard,
  IoSchool
} from "react-icons/io5";
import "@carbon/styles/css/styles.css";

const SchoolStaffSidebar = () => {
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
        width: expanded ? 280 : 80, // Increased from 64 to 80, expanded from 256 to 280
        transition: "width 0.3s ease-in-out",
        position: "fixed",
        height: "100vh",
        zIndex: 100,
        top: 48,
        backgroundColor: "var(--cds-layer)",
        borderRight: "1px solid var(--cds-border-subtle)",
        boxShadow: "2px 0 8px rgba(0, 0, 0, 0.1)", // Added subtle shadow
      }}
    >
      <SideNav isRail={!expanded} expanded={expanded} aria-label="School Staff navigation">
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

          <SideNavLink 
            renderIcon={IoSchool} 
            href="/students"
            isActive={pathname === "/students"}
          >
            Students
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
      
      {/* Custom CSS to make sidebar content bigger and clearer */}
      <style jsx>{`
        :global(.cds--side-nav__item) {
          margin-bottom: 0.5rem !important;
        }
        
        :global(.cds--side-nav__link) {
          padding: ${expanded ? '1rem' : '0.75rem'} !important;
          min-height: ${expanded ? '3rem' : '2.5rem'} !important;
          font-size: ${expanded ? '1rem' : '0.875rem'} !important;
          border-radius: 6px !important;
          margin: 0 0.5rem !important;
          transition: all 0.2s ease !important;
        }
        
        :global(.cds--side-nav__link:hover) {
          background-color: var(--cds-layer-hover) !important;
          transform: translateX(4px) !important;
        }
        
        :global(.cds--side-nav__link--current) {
          background-color: var(--cds-layer-selected) !important;
          border-left: 3px solid var(--cds-interactive-01) !important;
        }
        
        :global(.cds--side-nav__icon) {
          width: ${expanded ? '20px' : '18px'} !important;
          height: ${expanded ? '20px' : '18px'} !important;
          margin-right: ${expanded ? '0.75rem' : '0.5rem'} !important;
        }
        
        :global(.cds--side-nav__item--icon) {
          margin: 0.25rem 0 !important;
        }
      `}</style>
    </div>
  );
};

export default SchoolStaffSidebar;
