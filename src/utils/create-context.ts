import React from "react";

export function createContext<T>(initialValue?: T) {
  const context = React.createContext<T | undefined>(initialValue);

  const useContextConsumer = () => {
    const c = React.useContext(context);
    if (!c) {
      throw new Error("Component must be wrapped with <Container.Provider>");
    }
    return c;
  };

  return [useContextConsumer, context.Provider] as const;
}
