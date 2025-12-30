import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "shopifyPage" model, go to https://refine-page-builder.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v2",
  storageKey: "DataModel-Shopify-Page",
  fields: {},
  searchIndex: false,
  shopify: {
    fields: {
      body: { filterIndex: false, searchIndex: false },
      bodySummary: { filterIndex: false, searchIndex: false },
      defaultCursor: { filterIndex: false, searchIndex: false },
      handle: { filterIndex: false, searchIndex: false },
      isPublished: { filterIndex: false, searchIndex: false },
      publishedAt: { filterIndex: false, searchIndex: false },
      shop: { searchIndex: false },
      shopifyCreatedAt: { filterIndex: false, searchIndex: false },
      shopifyUpdatedAt: { filterIndex: false, searchIndex: false },
      templateSuffix: { filterIndex: false, searchIndex: false },
      title: { filterIndex: false, searchIndex: false },
    },
  },
};
