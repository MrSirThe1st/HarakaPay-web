import React from "react";
import { Header, HeaderName, HeaderGlobalBar, HeaderGlobalAction } from "@carbon/react";
import { Notification, UserAvatarFilledAlt } from "@carbon/icons-react";

const TopBar = () => (
  <Header aria-label="HarakaPay">
    <HeaderName href="#" prefix="HarakaPay">
      {/* Logo can be placed here */}
    </HeaderName>
    <HeaderGlobalBar>
      <HeaderGlobalAction aria-label="Notifications">
        <Notification size={20} />
      </HeaderGlobalAction>
      <HeaderGlobalAction aria-label="User Profile">
        <UserAvatarFilledAlt size={20} />
      </HeaderGlobalAction>
    </HeaderGlobalBar>
  </Header>
);

export default TopBar;
