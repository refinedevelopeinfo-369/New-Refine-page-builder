export const run = async ({ params, logger, api, connections }: any) => {
  const shopify = connections.shopify.current;
  const currentShop = await api.shopifyShop.findOne(shopify.id);

  const themes = await shopify.theme.list();
  const mainTheme = themes.find((t: any) => t.role === "main");

  const installations = await api.installation.findMany({
    filter: { shopId: { equals: currentShop.id } },
    select: { id: true, section: { slug: true } },
  });

  for (const install of installations) {
    if (install.section?.slug && mainTheme) {
      try {
        // 修正箇所: assets.delete → asset.delete
        await shopify.asset.delete(mainTheme.id, {
          asset: { key: `sections/${install.section.slug}.liquid` }
        });
      } catch (e) {
        // 無視
      }
    }
    await api.installation.delete(install.id);
  }

  return { success: true, count: installations.length };
};

export const options = {
  triggers: { api: true },
};