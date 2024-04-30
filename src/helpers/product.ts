import { BrowserContext, Locator, Page } from "playwright";

export const extractInformationFromProduct = async (context: BrowserContext, products: Locator[]) => {
  const info = new Map<string, string>();
  for (var product of products) {
    const href = await product.getAttribute('href', { timeout: 500 });
    console.log(href)
    if (!href) continue;

    const page = await context.newPage();
    await page.waitForTimeout(5000);
    await page.goto(href);

    const details = page.locator(".spec-details");
    const title = await page.locator(".page-title").innerText();
    info.set(title ?? "Uknown", "");

    if (details) {
      console.log(title)
      const specs = (await details.allInnerTexts())[0]
      console.log(specs)
      info.set(title ?? "Uknown", specs)
    }
  }

  return info;
}

export const getProducts = async (page: Page, context: BrowserContext, products: Locator[], href?: string | undefined) => {
  await page.pause();

  if (href) await page.goto(href);
  const nextPageAnchor = page.locator("li:right-of(.current_page)").first().locator("a").first();
  // const stop = page.locator("li:right-of(.current_page)").first().locator("span").first();
  const newProducts = products.concat(await page.locator('#sku-list').getByTestId("sku-card").locator("a").all());

  if (await nextPageAnchor.isVisible()) {
    // await page.pause();

    const href = await nextPageAnchor.getAttribute('href');
    if (href == null) return;
    console.log("Navigating to ", href)
    console.log("products", JSON.stringify(products.length))

    await getProducts(page, context, newProducts, href);
  }
  return products;
}