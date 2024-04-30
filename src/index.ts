import { chromium } from "playwright";
import { extractInformationFromProduct, getProducts } from "./helpers/product";
import yargs from "yargs";
import { hideBin } from "yargs/helpers"
import { writeFile } from "fs/promises";

(async () => {
  const args = (await yargs(hideBin(process.argv)).argv)._;
  const browser = await chromium.launch({
    headless: false,
    timeout: 3_600_000,
  });
  const context = await browser.newContext({
    baseURL: 'https://www.skroutz.gr',
    locale: "en-GB",
  });
  const page = await context.newPage();
  //lg+55+inch+tv
  await page.goto(`/search?keyphrase=${args.filter(x => x !== "").join("+")}`);
  // await page.goto('/search?keyphrase=lg');
  const productsContainer = page.locator('#sku-list');
  const paginator = page.locator("xpath=ol[contains(@class, \"paginator\")]");
  const hasMultiplePages = await paginator?.first().isVisible();
  console.log(hasMultiplePages ?
    "Multiple pages detected" :
    "Single page detected");

  const productsList = await productsContainer
    .getByTestId("sku-card")
    .getByTestId("sku-pic-anchor")
    .all();

  const products = hasMultiplePages ?
    await getProducts(page, context, productsList) :
    productsList;

  if (!products) {
    console.log("No products found")
    process.exit(0);
  }

  const info = await extractInformationFromProduct(context, products);
  console.log([...info.entries()]);
  await page.pause();
})()
