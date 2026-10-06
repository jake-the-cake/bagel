import React, { createContext, useContext, useEffect, useState } from "react";

const AppContext = createContext(null);

function AppProvider({ children }) {
  const [context, setContext] = useState({
    ready: false,
    user: {
      details: null,
      companies: [],
      permissions: {},
    },
    company: null,
  });

  localStorage.setItem("JSYS_SESSION_ID", "1234567890");
  localStorage.setItem(
    "JSYS_USER_TOKEN",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
  );

  useEffect(() => {
    async function init() {
      /** Check session and user tokens */
      const sessionId = localStorage.getItem("JSYS_SESSION_ID");
      const userToken = localStorage.getItem("JSYS_USER_TOKEN");
      if (!sessionId || !userToken)
        return (window.location.href = "/app/error/401");
      try {
        const response = await fetch("/api/auth/session", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${userToken}`,
            "X-Session-ID": sessionId,
          },
        });
        if (!response.ok) return (window.location.href = "/app/error/401");
        const data = await response.json();
        setContext((current) => ({
          ...current,
          ready: true,
          user: {
            ...current.user,
            details: data.user,
            companies: data.companies ?? [],
            permissions: data.permissions ?? {},
          },
          company: data.company ?? null,
        }));
      } catch (error) {
        console.error(error);
        window.location.href = "/app/error/500";
      }
    }

    init();
  }, []);

  function updateContext(section, values) {
    setContext((current) => {
      if (typeof current[section] === "function") {
        throw new Error(`Cannot update a function: ${section}`);
      }

      return {
        ...current,

        [section]:
          typeof current[section] === "object" &&
          current[section] !== null &&
          !Array.isArray(current[section])
            ? {
                ...current[section],
                ...values,
              }
            : values,
      };
    });
  }

  return (
    <AppContext.Provider
      value={{
        ...context,
        updateContext,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

function useApp() {
  return useContext(AppContext);
}

function updateContext(section, values) {
  return useApp().updateContext(section, values);
}

export { AppProvider, useApp, updateContext };
