import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "shopifyTheme" model, go to https://refine-page-builder.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v2",
  storageKey: "DataModel-Shopify-Theme",
  fields: {},
  searchIndex: false,
  shopify: {
    fields: {
      name: { filterIndex: false, searchIndex: false },
      prefix: { filterIndex: false, searchIndex: false },
      previewable: { filterIndex: false, searchIndex: false },
      processing: { filterIndex: false, searchIndex: false },
      processingFailed: { filterIndex: false, searchIndex: false },
      role: { filterIndex: false, searchIndex: false },
      shop: { searchIndex: false },
      shopifyCreatedAt: { filterIndex: false, searchIndex: false },
      shopifyUpdatedAt: { filterIndex: false, searchIndex: false },
      themeStoreId: { filterIndex: false, searchIndex: false },
    },
  },
};
