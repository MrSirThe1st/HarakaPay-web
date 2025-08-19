"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDualAuth } from "@/hooks/useDualAuth";
import { useEffect, useState } from "react";

export function DashboardNavigation() {
  const pathname = usePathname();
  const { user, isAdmin, isSchoolStaff, signOut } = useDualAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <nav style={{
        background: "#fff",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        borderBottom: "1px solid var(--color-base-bg-alt)",
        fontFamily: "var(--font-family-base)",
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 var(--space-lg)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: "64px" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <span style={{ fontSize: "1.25rem", fontWeight: "var(--font-weight-bold)", color: "var(--color-primary)" }}>
                HarakaPay
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div style={{ background: "var(--color-base-bg-alt)", height: "32px", width: "80px", borderRadius: "var(--radius-md)", animation: "pulse 2s infinite" }}></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  const navigationItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6a2 2 0 01-2 2H10a2 2 0 01-2-2V5z"
          />
        </svg>
      ),
    },
    ...(isSchoolStaff
      ? [
          {
            name: "Students",
            href: "/students",
            icon: (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                />
              </svg>
            ),
          },
        ]
      : []),
    {
      name: "Payments",
      href: "/payments",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
          />
        </svg>
      ),
    },
    ...(isAdmin
      ? [
          {
            name: "Reports",
            href: "/reports",
            icon: (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            ),
          },
          {
            name: "Settings",
            href: "/settings",
            icon: (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            ),
          },
        ]
      : []),
  ];

  const adminActions = isAdmin
    ? [
        {
          name: "Create School",
          href: "/create-school",
          icon: (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          ),
        },
        {
          name: "Create Admin",
          href: "/create-admin",
          icon: (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          ),
        },
      ]
    : [];

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <nav style={{
      background: "#fff",
      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      borderBottom: "1px solid var(--color-base-bg-alt)",
      fontFamily: "var(--font-family-base)",
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 var(--space-lg)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: "64px" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{ fontSize: "1.25rem", fontWeight: "var(--font-weight-bold)", color: "var(--color-primary)" }}>
              HarakaPay
            </span>
            <div style={{ marginLeft: "var(--space-lg)", display: "flex", gap: "var(--space-md)" }}>
              {navigationItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "0 var(--space-sm)",
                      borderBottom: isActive ? "2px solid var(--color-primary)" : "2px solid transparent",
                      color: isActive ? "var(--color-text-main)" : "var(--color-text-muted)",
                      fontWeight: "var(--font-weight-normal)",
                      fontSize: "1rem",
                      textDecoration: "none",
                      transition: "color 0.2s, border-bottom 0.2s",
                    }}
                  >
                    <span style={{ marginRight: "8px" }}>{item.icon}</span>
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-md)" }}>
            {/* Admin Actions Dropdown */}
            {isAdmin && (
              <div style={{ position: "relative" }}>
                <button style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "var(--space-sm) var(--space-md)",
                  border: "1px solid var(--color-base-bg-alt)",
                  fontSize: "1rem",
                  fontWeight: "var(--font-weight-normal)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--color-text-main)",
                  background: "#fff",
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}>
                  Admin Actions
                  <svg
                    style={{ marginLeft: "8px", width: "16px", height: "16px" }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {/* Dropdown menu can be implemented with a state for visibility if needed */}
              </div>
            )}
            {/* User info and sign out */}
            <span style={{ fontSize: "1rem", color: "var(--color-text-main)" }}>
              {user?.name || user?.email}
            </span>
            <button
              onClick={handleSignOut}
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "var(--space-sm) var(--space-md)",
                border: "none",
                fontSize: "1rem",
                fontWeight: "var(--font-weight-bold)",
                borderRadius: "var(--radius-md)",
                color: "#fff",
                background: "var(--color-primary)",
                cursor: "pointer",
                transition: "background 0.2s",
              }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
