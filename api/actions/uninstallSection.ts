export const run = async ({ params, logger, api, connections }: any) => {
  const { sectionSlug } = params;
  const shopify = connections.shopify.current;

  const themes = await shopify.theme.list();
  const mainTheme = themes.find((t: any) => t.role === "main");
  
  if (mainTheme) {
    try {
      // 修正箇所: assets.delete → asset.delete
      await shopify.asset.delete(mainTheme.id, { 
        asset: { key: `sections/${sectionSlug}.liquid` } 
      });
    } catch (e: any) {
      if (e.response?.statusCode !== 404) {
        logger.warn("File already deleted or not found");
      }
    }
  }

  const sectionMaster = await api.sectionMaster.findFirst({
    filter: { slug: { equals: sectionSlug } },
  });
  
  if (sectionMaster) {
    const currentShop = await api.shopifyShop.findOne(shopify.id);
    const installation = await api.installation.findFirst({
      filter: {
        shopId: { equals: currentShop.id },
        sectionId: { equals: sectionMaster.id },
      },
    });

    if (installation) {
      await api.installation.delete(installation.id);
    }
  }

  return { success: true };
};

export const options = {
  params: { sectionSlug: { type: "string" } },
  triggers: { api: true },
};