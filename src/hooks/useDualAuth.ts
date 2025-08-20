// Add this to the top of your useDualAuth hook to bypass authentication
// In src/hooks/useDualAuth.ts

export function useDualAuth() {
  // DEVELOPMENT ONLY: Return fake authenticated state
  const DEVELOPMENT_MODE = true; // Set to false to re-enable auth
  
  if (DEVELOPMENT_MODE) {
    return {
      user: { 
        id: 'dev-user', 
        email: 'dev@example.com', 
        role: 'admin' 
      },
      profile: { 
        role: 'admin', 
        first_name: 'Dev', 
        last_name: 'User' 
      },
      loading: false,
      error: null,
      isPredefinedAdmin: true,
      signIn: async () => ({ success: true, error: null, isPredefinedAdmin: true }),
      signOut: async () => ({ success: true, error: null }),
      resetPassword: async () => ({ success: true, error: null }),
      isAuthenticated: true,
      hasProfile: true,
      isAdmin: true,
      isSchoolStaff: false,
    };
  }

  // Your original hook logic continues here...
  // (rest of your existing code)
}