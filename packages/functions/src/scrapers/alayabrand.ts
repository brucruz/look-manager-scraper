// import { chromiumScraper } from "src/services/chromiumScraper";
// import { ScrapeResult } from "src/types/ProductInsertion";

// interface Variation {
//   attributes: {
//     attribute_pa_tamanhos: string;
//   };
//   display_price: number;
//   display_regular_price: number;
//   image: {
//     full_src: string;
//   };
//   is_in_stock: boolean;
//   sku: string;
// }

// export default async function fetchProduct(
//   url: string,
//   domainWithoutWWW: string
// ): Promise<ScrapeResult> {
//   try {
//     const $ = await chromiumScraper(url, domainWithoutWWW);

//     const productDiv = $(
//       "#content section:not(.elementor-hidden-desktop)"
//     ).first();
//     const variationsForm = JSON.parse(
//       $("form.variations_form").attr("data-product_variations") as string
//     ) as Variation[];

//     const name = productDiv.find("h1.product_title").text().trim();
//     const variantFullName = name;
//     const productName = name.split(" – ")[0];
//     const variantTitle = name.split(" – ")[1];

//     const sku = variationsForm[0].sku;
//     const brand = "Alaya";
//     const description = productDiv
//       .find(".woocommerce-product-details__short-description")
//       .find("br")
//       .replaceWith("\n")
//       .end()
//       .text()
//       .trim();

//     const hasPromotionalPrice =
//       variationsForm[0].display_price < variationsForm[0].display_regular_price;

//     let old_price;
//     let price;

//     if (hasPromotionalPrice) {
//       old_price = variationsForm[0].display_regular_price;
//       price = variationsForm[0].display_price;
//     } else {
//       price = variationsForm[0].display_regular_price;
//     }

//     const sizes = variationsForm.map((variation) => {
//       const size = variation.attributes.attribute_pa_tamanhos;
//       const available = variation.is_in_stock;

//       return { size, available, url };
//     });

//     const available = sizes.some((size) => size.available);

//     const images = productDiv
//       .find("div.woocommerce-gallery-images-main-carousel-cell img")
//       .map(function () {
//         return $(this).attr("src") || "not-found";
//       })
//       .get();

//     const product = {
//       name,
//       sku,
//       brand,
//       description,
//       old_price,
//       price,
//       currency: "R$",
//       available,
//       url,
//       store: brand,
//       store_url: domainWithoutWWW,
//       images,
//       sizes,
//       gender: 'female',
//     };

//     const related = $(
//       'div[data-widget_type="woocommerce-product-upsell.default"] ul li.product div.woocommerce-image__wrapper a'
//     )
//       .map(function () {
//         return $(this).attr("href");
//       })
//       .get();

//     return { product, related };
//   } catch (error: any) {
//     throw new Error(error);
//   }
// }
