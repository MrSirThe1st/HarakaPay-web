// src/app/(dashboard)/settings/page.tsx
"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useDualAuth } from "@/hooks/useDualAuth";
import { useClientTranslations } from "@/hooks/useClientTranslations";
import { useLanguage } from "@/hooks/useLanguage";
import { useState } from "react";
import { 
  Grid, 
  Column, 
  Tile, 
  Button,
  RadioButtonGroup,
  RadioButton,
  InlineNotification,
  Tabs,
  Tab,
  TabList,
  TabPanels,
  TabPanel,
  TextInput,
  Toggle,
  Select,
  SelectItem
} from "@carbon/react";
import { 
  Settings, 
  Language as LanguageIcon,
  User,
  Security,
  Notification,
  Save,
  UserAvatarFilledAlt
} from "@carbon/icons-react";

function SettingsContent() {
  const { user, signOut, profile, isAdmin, isSchoolStaff } = useDualAuth();
  const { t } = useClientTranslations();
  const { currentLanguage, changeLanguage, availableLanguages } = useLanguage();
  const [preferencesSaved, setPreferencesSaved] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // Settings state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(false);
  const [theme, setTheme] = useState("system");

  const handleSignOut = async () => {
    await signOut();
  };

  const handleSavePreferences = () => {
    // Here you could save language preference to user profile
    setPreferencesSaved(true);
    setTimeout(() => setPreferencesSaved(false), 3000);
  };

  const getUserRole = () => {
    if (isAdmin) return "Platform Administrator";
    if (isSchoolStaff) return "School Staff Member";
    return "User";
  };

  return (
    <div style={{ padding: "2rem 0" }}>
      {/* Page Header */}
      <div style={{ marginBottom: "3rem" }}>
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          marginBottom: "1rem" 
        }}>
          <Settings 
            size={32} 
            style={{ 
              marginRight: "1rem", 
              color: "var(--cds-icon-primary)" 
            }} 
          />
          <div>
            <h1 style={{ 
              fontSize: "2.5rem", 
              fontWeight: 600, 
              margin: 0,
              color: "var(--cds-text-primary)"
            }}>
              {t('settings.title')}
            </h1>
            <p style={{ 
              fontSize: "1.125rem", 
              color: "var(--cds-text-secondary)",
              margin: "0.5rem 0 0 0"
            }}>
              {t('settings.subtitle')}
            </p>
          </div>
        </div>

        {/* User Info Card */}
        <Tile style={{ 
          padding: "1.5rem",
          marginBottom: "2rem",
          border: "1px solid var(--cds-border-subtle)"
        }}>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "1rem" 
          }}>
            <div style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: "var(--cds-layer-accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid var(--cds-border-subtle)"
            }}>
              <UserAvatarFilledAlt size={32} style={{ color: "var(--cds-icon-primary)" }} />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ 
                fontSize: "1.25rem", 
                fontWeight: 600, 
                margin: "0 0 0.25rem 0",
                color: "var(--cds-text-primary)"
              }}>
                {user?.name || user?.email}
              </h3>
              <p style={{ 
                color: "var(--cds-text-secondary)", 
                margin: "0 0 0.5rem 0" 
              }}>
                {user?.email}
              </p>
              <div style={{ 
                display: "inline-flex",
                padding: "0.25rem 0.75rem",
                background: "var(--cds-layer-accent)",
                borderRadius: "1rem",
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "var(--cds-text-primary)",
                border: "1px solid var(--cds-border-subtle)"
              }}>
                {getUserRole()}
              </div>
            </div>
          </div>
        </Tile>
      </div>

      {/* Settings Tabs */}
      <Tabs>
        <TabList aria-label="Settings categories">
          <Tab>
            <LanguageIcon size={16} style={{ marginRight: "0.5rem" }} />
            Language & Localization
          </Tab>
          <Tab>
            <Notification size={16} style={{ marginRight: "0.5rem" }} />
            Notifications
          </Tab>
          <Tab>
            <Security size={16} style={{ marginRight: "0.5rem" }} />
            Security
          </Tab>
          <Tab>
            <User size={16} style={{ marginRight: "0.5rem" }} />
            Profile
          </Tab>
        </TabList>

        <TabPanels>
          {/* Language Settings Tab */}
          <TabPanel>
            <Grid>
              <Column lg={8} md={6} sm={4}>
                <Tile style={{ 
                  padding: "2rem",
                  border: "1px solid var(--cds-border-subtle)"
                }}>
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    marginBottom: "1.5rem" 
                  }}>
                    <LanguageIcon 
                      size={24} 
                      style={{ 
                        marginRight: "1rem", 
                        color: "var(--cds-icon-primary)" 
                      }} 
                    />
                    <h3 style={{ 
                      fontSize: "1.25rem", 
                      fontWeight: 600, 
                      margin: 0,
                      color: "var(--cds-text-primary)"
                    }}>
                      {t('settings.language')}
                    </h3>
                  </div>
                  
                  <p style={{ 
  color: "var(--cds-text-secondary)", 
  marginBottom: "2rem" 
}}>
                    {t('settings.languageDescription')}
                  </p>

                  <div style={{ marginBottom: "2rem" }}>
                    <RadioButtonGroup
                      legendText={t('settings.currentLanguage')}
                      name="language-selection"
                      value={currentLanguage}
                      onChange={(value) => changeLanguage(value as 'en' | 'fr')}
                    >
                      {availableLanguages.map((lang) => (
                        <RadioButton
                          key={lang.code}
                          labelText={`${lang.flag} ${lang.name}`}
                          value={lang.code}
                          id={`lang-${lang.code}`}
                        />
                      ))}
                    </RadioButtonGroup>
                  </div>

                  <Button 
                    kind="primary" 
                    size="md"
                    renderIcon={Save}
                    onClick={handleSavePreferences}
                  >
                    Save Language Preferences
                  </Button>

                  {preferencesSaved && (
                    <InlineNotification
                      kind="success"
                      title="Settings saved"
                      subtitle="Your language preferences have been updated successfully."
                      style={{ marginTop: "1rem" }}
                    />
                  )}
                </Tile>
              </Column>
            </Grid>
          </TabPanel>

          {/* Notifications Tab */}
          <TabPanel>
            <Grid>
              <Column lg={8} md={6} sm={4}>
                <Tile style={{ 
                  padding: "2rem",
                  border: "1px solid var(--cds-border-subtle)"
                }}>
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    marginBottom: "1.5rem" 
                  }}>
                    <Notification 
                      size={24} 
                      style={{ 
                        marginRight: "1rem", 
                        color: "var(--cds-icon-primary)" 
                      }} 
                    />
                    <h3 style={{ 
                      fontSize: "1.25rem", 
                      fontWeight: 600, 
                      margin: 0,
                      color: "var(--cds-text-primary)"
                    }}>
                      Notification Preferences
                    </h3>
                  </div>

                  <div style={{ 
                    display: "flex", 
                    flexDirection: "column", 
                    gap: "1.5rem" 
                  }}>
                    <Toggle
                      labelText="Email Notifications"
                      labelA="Disabled"
                      labelB="Enabled"
                      id="email-notifications"
                      toggled={emailNotifications}
                      onToggle={(checked) => setEmailNotifications(checked)}
                    />

                    <Toggle
                      labelText="Push Notifications"
                      labelA="Disabled"
                      labelB="Enabled"
                      id="push-notifications"
                      toggled={pushNotifications}
                      onToggle={(checked) => setPushNotifications(checked)}
                    />

                    <Toggle
                      labelText="Weekly Reports"
                      labelA="Disabled"
                      labelB="Enabled"
                      id="weekly-reports"
                      toggled={weeklyReports}
                      onToggle={(checked) => setWeeklyReports(checked)}
                    />
                  </div>

                  <Button 
                    kind="primary" 
                    size="md"
                    renderIcon={Save}
                    style={{ marginTop: "2rem" }}
                  >
                    Save Notification Settings
                  </Button>
                </Tile>
              </Column>
            </Grid>
          </TabPanel>

          {/* Security Tab */}
          <TabPanel>
            <Grid>
              <Column lg={8} md={6} sm={4}>
                <Tile style={{ 
                  padding: "2rem",
                  border: "1px solid var(--cds-border-subtle)"
                }}>
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    marginBottom: "1.5rem" 
                  }}>
                    <Security 
                      size={24} 
                      style={{ 
                        marginRight: "1rem", 
                        color: "var(--cds-icon-primary)" 
                      }} 
                    />
                    <h3 style={{ 
                      fontSize: "1.25rem", 
                      fontWeight: 600, 
                      margin: 0,
                      color: "var(--cds-text-primary)"
                    }}>
                      Security Settings
                    </h3>
                  </div>

                  <div style={{ 
                    display: "flex", 
                    flexDirection: "column", 
                    gap: "1.5rem" 
                  }}>
                    <TextInput
                      id="current-password"
                      labelText="Current Password"
                      type="password"
                      placeholder="Enter current password"
                    />

                    <TextInput
                      id="new-password"
                      labelText="New Password"
                      type="password"
                      placeholder="Enter new password"
                    />

                    <TextInput
                      id="confirm-password"
                      labelText="Confirm New Password"
                      type="password"
                      placeholder="Confirm new password"
                    />
                  </div>

                  <div style={{ 
                    display: "flex", 
                    gap: "1rem", 
                    marginTop: "2rem" 
                  }}>
                    <Button kind="primary" size="md">
                      Update Password
                    </Button>
                    <Button 
                      kind="danger" 
                      size="md"
                      onClick={handleSignOut}
                    >
                      Sign Out
                    </Button>
                  </div>
                </Tile>
              </Column>
            </Grid>
          </TabPanel>

          {/* Profile Tab */}
          <TabPanel>
            <Grid>
              <Column lg={8} md={6} sm={4}>
                <Tile style={{ 
                  padding: "2rem",
                  border: "1px solid var(--cds-border-subtle)"
                }}>
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    marginBottom: "1.5rem" 
                  }}>
                    <User 
                      size={24} 
                      style={{ 
                        marginRight: "1rem", 
                        color: "var(--cds-icon-primary)" 
                      }} 
                    />
                    <h3 style={{ 
                      fontSize: "1.25rem", 
                      fontWeight: 600, 
                      margin: 0,
                      color: "var(--cds-text-primary)"
                    }}>
                      Profile Information
                    </h3>
                  </div>

                  <div style={{ 
                    display: "flex", 
                    flexDirection: "column", 
                    gap: "1.5rem" 
                  }}>
                    <TextInput
                      id="display-name"
                      labelText="Display Name"
                      placeholder="Enter your display name"
                      defaultValue={user?.name || ''}
                    />

                    <TextInput
                      id="email"
                      labelText="Email Address"
                      placeholder="Enter your email"
                      defaultValue={user?.email || ''}
                      disabled
                    />

                    <Select
                      id="theme"
                      labelText="Theme Preference"
                      value={theme}
                      onChange={(e) => setTheme(e.target.value)}
                    >
                      <SelectItem value="light" text="Light" />
                      <SelectItem value="dark" text="Dark" />
                      <SelectItem value="system" text="System Default" />
                    </Select>
                  </div>

                  <Button 
                    kind="primary" 
                    size="md"
                    renderIcon={Save}
                    style={{ marginTop: "2rem" }}
                  >
                    Update Profile
                  </Button>
                </Tile>
              </Column>
            </Grid>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <ProtectedRoute requiredRole={["admin", "school_staff"]}>
      <SettingsContent />
    </ProtectedRoute>
  );
}