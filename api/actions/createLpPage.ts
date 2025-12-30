import { ActionOptions } from "gadget-server";

// パラメータ定義
export const params = {
  title: { type: "string" },
  selectedSections: {
    type: "array",
    items: { type: "string" },
  },
};

export const run = async ({ params, logger, api, connections }: any) => {
  // 1. ショップへの接続
  const shopify = connections.shopify.current ?? await connections.shopify.forShopDomain("testrefine.myshopify.com"); 

  if (!shopify) {
    throw new Error("Shopify connection missing: Could not find shop context.");
  }

  const { title, selectedSections } = params; 
  const sectionsList = selectedSections || [];

  // ▼▼▼ 【重要】ステップ1で調べたIDをここに設定します ▼▼▼
  // 例: "shopify://apps/refine-page-builder/blocks"
  // ※ もしIDにUUIDが含まれている場合(例: apps/12345/blocks)はそれも入れてください
  const APP_BLOCK_PREFIX = "shopify://apps/refine-lp-builder/blocks"; 
  // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

  // 2. テンプレート名の決定
  const sorted = [...sectionsList].sort();
  const comboName = sorted.join("-").toLowerCase().replace(/\s+/g, '-');
  const templateSuffix = `refine-${comboName}`;
  const assetKey = `templates/page.${templateSuffix}.json`;

  logger.info({ templateSuffix }, "Checking/Creating template...");

  // 3. メインテーマを探す（ここにファイルを書き込むため）
  const themes = await shopify.theme.findMany({ role: "main" });
  if (themes.length === 0) throw new Error("No main theme found");
  const mainTheme = themes[0];

  // 4. JSONテンプレートの中身を作る
  const sectionsPayload: any = {};
  const orderPayload: string[] = [];

  sectionsList.forEach((blockName: string, index: number) => {
    const key = `section_${index}`; // ユニークなキー
    
    // ブロックIDを結合して正しい type を作る
    // 最終的に "shopify://apps/.../blocks/Premium-Features" のようになります
    sectionsPayload[key] = {
      type: `${APP_BLOCK_PREFIX}/${blockName}`, 
      settings: {}
    };
    orderPayload.push(key);
  });

  const jsonContent = {
    sections: sectionsPayload,
    order: orderPayload
  };

  try {
    // 5. Asset APIでテーマにJSONファイルを書き込む
    await shopify.asset.update(mainTheme.id, {
      key: assetKey,
      value: JSON.stringify(jsonContent, null, 2)
    });

    logger.info("Template created/updated successfully.");

    // 6. そのテンプレートを使ってページを作る
    const page = await shopify.page.create({
      title: title || "New LP",
      template_suffix: templateSuffix, 
      body_html: "", 
    });

    const shopInfo = await shopify.shop.get();
    const editorUrl = `https://${shopInfo.domain}/admin/themes/current/editor?resourceId=${page.id}&resourceType=Page`;

    return { 
      success: true, 
      editorUrl,
      message: "Page created successfully with sections!" 
    };

  } catch (error: any) {
    logger.error({ error, templateSuffix }, "Failed to create page");
    throw new Error(`Failed to create page. Error: ${error.message}`);
  }
};

export const options = {
  triggers: { api: true },
};