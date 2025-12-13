import type { GadgetSettings } from "gadget-server";

export const settings: GadgetSettings = {
  type: "gadget/settings/v1",
  frameworkVersion: "v1.5.0",
  plugins: {
    connections: {
      shopify: {
        apiVersion: "2025-10",
        enabledModels: [],
        type: "partner",
        scopes: ["read_themes", "write_themes"],
      },
    },
  },
};
