const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");
// Load environment variables from .env file in the project root
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

// Load environment variables from .env file
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseKey) {
  console.error(
    "Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env file"
  );
  process.exit(1);
}

// Initialize Supabase client with the service key (not anon key)
const supabase = createClient(supabaseUrl, supabaseKey);

// Path to data.json
const dataPath = path.resolve(__dirname, "../public/data.json");

/**
 * Main migration function
 */
async function migrateData() {
  try {
    // Load and parse the data.json file
    const rawData = fs.readFileSync(dataPath, "utf-8");
    const products = JSON.parse(rawData);

    // First pass: Create products
    for (const product of products) {
      await migrateProduct(product);
    }

    // Second pass: Create related products (after all products exist)
    for (const product of products) {
      await migrateRelatedProducts(product);
    }
  } catch (error) {
    console.error("Migration failed:", error.message);
    process.exit(1);
  }
}

/**
 * Migrate a single product and its associated data
 */
async function migrateProduct(product) {
  try {
    // 1. Insert into products table
    const { data: productData, error: productError } = await supabase
      .from("products")
      .insert({
        id: product.id, // Use the same IDs as in the JSON for consistency
        slug: product.slug,
        name: product.name,
        category: product.category,
        new: product.new,
        price: product.price,
        description: product.description,
        features: product.features,
      })
      .select()
      .single();

    if (productError)
      throw new Error(
        `Error inserting product ${product.name}: ${productError.message}`
      );

    const productId = productData.id;

    // 2. Insert product images
    const { error: mainImageError } = await supabase
      .from("product_images")
      .insert({
        product_id: productId,
        type: "main",
        mobile_url: product.image.mobile,
        tablet_url: product.image.tablet,
        desktop_url: product.image.desktop,
      });

    if (mainImageError)
      throw new Error(
        `Error inserting main image for ${product.name}: ${mainImageError.message}`
      );

    const { error: categoryImageError } = await supabase
      .from("product_images")
      .insert({
        product_id: productId,
        type: "category",
        mobile_url: product.categoryImage.mobile,
        tablet_url: product.categoryImage.tablet,
        desktop_url: product.categoryImage.desktop,
      });

    if (categoryImageError)
      throw new Error(
        `Error inserting category image for ${product.name}: ${categoryImageError.message}`
      );
    console.log(`- Added product images`);

    // 3. Insert included items
    const includedItems = product.includes.map((item) => ({
      product_id: productId,
      quantity: item.quantity,
      item: item.item,
    }));

    const { error: includesError } = await supabase
      .from("product_includes")
      .insert(includedItems);

    if (includesError)
      throw new Error(
        `Error inserting included items for ${product.name}: ${includesError.message}`
      );

    // 4. Insert gallery images
    const galleryImages = [
      {
        product_id: productId,
        position: "first",
        mobile_url: product.gallery.first.mobile,
        tablet_url: product.gallery.first.tablet,
        desktop_url: product.gallery.first.desktop,
      },
      {
        product_id: productId,
        position: "second",
        mobile_url: product.gallery.second.mobile,
        tablet_url: product.gallery.second.tablet,
        desktop_url: product.gallery.second.desktop,
      },
      {
        product_id: productId,
        position: "third",
        mobile_url: product.gallery.third.mobile,
        tablet_url: product.gallery.third.tablet,
        desktop_url: product.gallery.third.desktop,
      },
    ];

    const { error: galleryError } = await supabase
      .from("product_gallery")
      .insert(galleryImages);

    if (galleryError)
      throw new Error(
        `Error inserting gallery for ${product.name}: ${galleryError.message}`
      );
  } catch (error) {
    console.error(`Failed to migrate product ${product.name}:`, error.message);
    // Continue with other products even if one fails
  }
}

/**
 * Migrate related products for a product
 */
async function migrateRelatedProducts(product) {
  try {
    if (!product.others || !product.others.length) {
      console.log(`- No related products for ${product.name}`);
      return;
    }

    // Process each related product
    for (const other of product.others) {
      // Find the related product ID based on slug
      const { data: relatedProduct, error: relatedError } = await supabase
        .from("products")
        .select("id")
        .eq("slug", other.slug)
        .single();

      if (relatedError || !relatedProduct) {
        console.error(
          `Could not find related product with slug ${other.slug}:`,
          relatedError?.message || "Not found"
        );
        continue;
      }

      // Insert the relationship
      const { error: insertError } = await supabase
        .from("related_products")
        .insert({
          product_id: product.id,
          related_product_id: relatedProduct.id,
          image_mobile: other.image.mobile,
          image_tablet: other.image.tablet,
          image_desktop: other.image.desktop,
        });

      if (insertError) {
        console.error(
          `Error linking ${product.name} to ${other.name}:`,
          insertError.message
        );
      }
    }
  } catch (error) {
    console.error(
      `Failed to migrate related products for ${product.name}:`,
      error.message
    );
  }
}

// Run the migration
migrateData();
