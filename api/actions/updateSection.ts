export const run = async ({ params, logger, api, connections }: any) => {
  const { sectionSlug } = params;
  const shopify = connections.shopify.current;

  const sectionMaster = await api.sectionMaster.findFirst({
    filter: { slug: { equals: sectionSlug } },
  });
  if (!sectionMaster) throw new Error("Section master not found");

  // テーマID取得（ここが抜けていました）
  const themes = await shopify.theme.list();
  const mainTheme = themes.find((t: any) => t.role === "main");
  if (!mainTheme) throw new Error("Main theme not found");
  
  // 修正箇所: assets.put → asset.create
  await shopify.asset.create(mainTheme.id, {
    key: `sections/${sectionSlug}.liquid`,
    value: sectionMaster.liquidCode,
  });

  const currentShop = await api.shopifyShop.findOne(shopify.id);
  const installation = await api.installation.findFirst({
    filter: {
      shopId: { equals: currentShop.id },
      sectionId: { equals: sectionMaster.id },
    },
  });

  if (installation) {
    await api.installation.update(installation.id, {
      installedVersion: sectionMaster.version,
    });
  }

  return { success: true };
};

export const options = {
  params: { sectionSlug: { type: "string" } },
  triggers: { api: true },
};