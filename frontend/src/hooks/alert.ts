import { useState, useCallback } from "react";

export type AlertType = "success" | "error" | "info" | "warning";

export interface AlertState {
  msg: string;
  type?: AlertType;
}

export function useAlert() {
  const [alert, setAlert] = useState<AlertState | null>(null);

  const handleAlert = useCallback((newAlert: AlertState) => {
    setAlert(newAlert);
  }, []);

  const clearAlert = useCallback(() => {
    setAlert(null);
  }, []);

  return {
    alert,
    handleAlert,
    clearAlert,
  };
}
