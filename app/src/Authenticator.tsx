import {
  FC,
  Fragment,
  ReactElement,
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useConnected, useAccount } from "@raydeck/usemetamask";
import { eth_requestAccounts } from "@raydeck/metamask-ts";
import { ethers } from "ethers";
const ethereum = (window as unknown as { ethereum: any }).ethereum;
const baseUrl = "https://xw8v-tcfi-85ay.n7.xano.io/api:58vCnoV0";
const context = createContext({
  isAuthenticated: false,
  token: "",
  loginWithPassword: async (email: string, password: string) => {},
  loginWithWallet: async () => {},
  signupWithPassword: async (email: string, password: string) => {},
  signupWithWallet: async () => {},
  logout: () => {},
});
const { Provider } = context;
const Authenticator: FC<{
  children: ReactElement;
  fallback: ReactElement;
}> = ({ children, fallback }) => {
  const [token, setToken] = useState<string>("");
  useEffect(() => {
    console.log("Authenticator useEffect");
    //lets get my xano token from the localStorage
    const token = localStorage.getItem("xano-token");
    if (token) {
      setIsAuthenticated(true);
      setToken(token);
    }
  }, []);
  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setToken("");
    localStorage.removeItem("xano-token");
  }, []);
  const loginWithPassword = useCallback(
    async (email: string, password: string) => {
      //reach out to the server for a login
      console.log("I will post to ", `${baseUrl}/auth/login`);
      const response = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      if (response.status === 200) {
        const { authToken } = await response.json();
        setToken(authToken);
        setIsAuthenticated(true);
        localStorage.setItem("xano-token", authToken);
      } else {
        const body = await response.text();
        throw new Error(body);
      }
    },
    []
  );
  const loginWithWallet = useCallback(async () => {
    //Make sure the wallet is connected
    await eth_requestAccounts();
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    const message = JSON.stringify(
      { message: "Authenticate me to Nodeless", exp: Date.now() + 1000 * 60 },
      null,
      2
    );
    const signature = await signer.signMessage(message);
    const obj = { message, signature, address };
    const response = await fetch(`${baseUrl}/auth/walletlogin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token: window.btoa(JSON.stringify(obj)) }),
    });
    if (response.status === 200) {
      const { authToken } = await response.json();
      setToken(authToken);
      setIsAuthenticated(true);
      localStorage.setItem("xano-token", authToken);
    } else {
      const body = await response.text();
      throw new Error(body);
    }
  }, []);
  const signupWithPassword = useCallback(
    async (email: string, password: string) => {
      //reach out to the server for a login
      const response = await fetch(`${baseUrl}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      if (response.status === 200) {
        const { authToken } = await response.json();
        setToken(authToken);
        setIsAuthenticated(true);
        localStorage.setItem("xano-token", authToken);
      } else {
        const body = await response.text();
        throw new Error(body);
      }
    },
    []
  );
  const signupWithWallet = useCallback(async () => {
    //Make sure the wallet is connected
    await eth_requestAccounts();
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    const message = "Authenticate me to Nodeless";
    const signature = await signer.signMessage(message);
    const obj = { message, signature, address };
    const response = await fetch(`${baseUrl}/auth/walletsignup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token: window.btoa(JSON.stringify(obj)) }),
    });
    if (response.status === 200) {
      const { authToken } = await response.json();
      setToken(authToken);
      setIsAuthenticated(true);
      localStorage.setItem("xano-token", authToken);
    } else {
      const body = await response.text();
      throw new Error(body);
    }
  }, []);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const value = useMemo(() => {
    return {
      isAuthenticated,
      token,
      logout,
      loginWithPassword,
      loginWithWallet,
      signupWithPassword,
      signupWithWallet,
    };
  }, [
    isAuthenticated,
    token,
    logout,
    loginWithPassword,
    loginWithWallet,
    signupWithPassword,
    signupWithWallet,
  ]);
  if (isAuthenticated) {
    return <Provider value={value}>{children}</Provider>;
  } else {
    return <Provider value={value}>{fallback}</Provider>;
  }
};
export const useAuthentication = () => {
  const contextValue = useContext(context);
  return contextValue;
};

export default Authenticator;