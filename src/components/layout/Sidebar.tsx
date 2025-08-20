// src/components/layout/Sidebar.tsx
"use client";

import React, { useState } from "react";
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

  return (
    <div
      style={{
        width: expanded ? 256 : 64,
        transition: "width 0.2s",
        position: "fixed",
        height: "100vh",
        zIndex: 100,
        top: 48, // Account for top bar height
      }}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
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
                <SideNavMenuItem href="/school-staff" isActive={pathname === "/school-staff"}>
                  School Staff
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