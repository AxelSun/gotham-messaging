import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { trpc } from "@/services/trpc";

interface AuthState {
  uid: number | null;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<any>;
  logout: () => void;
  error: string;
  isPending: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuth] = useState<AuthState>({
    uid: null,
    isAuthenticated: false,
  });

  const loginMutation = trpc.auth.login.useMutation();

  useEffect(() => {
    const storedUid = sessionStorage.getItem("uid");
    setAuth({
      uid: storedUid ? parseInt(storedUid) : null,
      isAuthenticated: !!storedUid,
    });
  }, []);

  const login = useCallback(
    async (username: string, password: string) => {
      const res = await loginMutation.mutateAsync({ username, password });
      const uid = res.id.toString();
      sessionStorage.setItem("uid", uid);
      setAuth({
        uid: res.id,
        isAuthenticated: true,
      });
      return res;
    },
    [loginMutation],
  );

  const logout = useCallback(() => {
    sessionStorage.removeItem("uid");
    setAuth({
      uid: null,
      isAuthenticated: false,
    });
  }, []);

  const value = {
    ...auth,
    login,
    logout,
    error: loginMutation.error?.message ?? "",
    isPending: loginMutation.isPending,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
