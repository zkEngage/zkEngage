
// Twitter authentication is disabled. This is a placeholder hook.
export function useTwitterAuth() {
  return {
    isAuthenticating: false,
    isAuthenticated: false,
    user: null,
    error: 'Twitter authentication is currently disabled.',
    startTwitterAuth: async () => {},
    handleCallback: async () => {},
    logout: () => {},
  };
}
