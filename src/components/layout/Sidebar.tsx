import React, { useState } from "react";
import { SideNav, SideNavItems, SideNavLink, SideNavMenu, SideNavMenuItem } from "@carbon/react";
import { Dashboard, Settings, UserAvatarFilledAlt, Report } from "@carbon/icons-react";
import "@carbon/styles/css/styles.css";

const Sidebar = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      style={{
        width: expanded ? 256 : 64,
        transition: "width 0.2s",
        position: "fixed",
        height: "100vh",
        zIndex: 100,
      }}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <SideNav isRail={!expanded} expanded={expanded} aria-label="Side navigation">
        <SideNavItems>
          <SideNavLink renderIcon={Dashboard} href="/dashboard">
            Dashboard
          </SideNavLink>
          <SideNavMenu renderIcon={UserAvatarFilledAlt} title="Users">
            <SideNavMenuItem href="/admin">Admin</SideNavMenuItem>
            <SideNavMenuItem href="/school-staff">School Staff</SideNavMenuItem>
          </SideNavMenu>
          <SideNavLink renderIcon={Report} href="/reports">
            Reports
          </SideNavLink>
          <SideNavLink renderIcon={Settings} href="/settings">
            Settings
          </SideNavLink>
        </SideNavItems>
      </SideNav>
    </div>
  );
};

export default Sidebar;
