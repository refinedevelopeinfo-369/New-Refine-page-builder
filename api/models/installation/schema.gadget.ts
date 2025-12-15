import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "installation" model, go to https://refine-page-builder.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v2",
  storageKey: "Af0I5LFHUek5",
  fields: {
    installedVersion: { type: "string", storageKey: "QqN3jTjplYZn" },
    section: {
      type: "belongsTo",
      parent: { model: "sectionMaster" },
      storageKey: "_7ggMUnkfIVD",
    },
    shop: {
      type: "belongsTo",
      parent: { model: "shopifyShop" },
      storageKey: "BvBEm2Jz7nYe",
    },
  },
};
