require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
const { MongoClient } = require("mongodb");

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

const IMAGE_DIR = path.join(__dirname, "..", "public", "products");
const MIME_EXTENSIONS = { "image/jpeg": "jpg", "image/png": "png" };

async function fetchCatalog() {
  const mongo = new MongoClient(process.env.MONGODB_URI);
  try {
    await mongo.connect();
    // The training account only has access to this one collection, so we
    // query it directly rather than listing collections first.
    return await mongo.db().collection("catalog").find({}).toArray();
  } finally {
    await mongo.close();
  }
}

function saveImage(itemId, base64Data, mimeType) {
  const extension = MIME_EXTENSIONS[mimeType] || "jpg";
  const filename = `${itemId}.${extension}`;
  fs.writeFileSync(path.join(IMAGE_DIR, filename), Buffer.from(base64Data, "base64"));
  return `/products/${filename}`;
}

async function main() {
  console.log("Fetching catalog from MongoDB...");
  const catalogItems = await fetchCatalog();
  console.log(`Fetched ${catalogItems.length} items.`);

  fs.mkdirSync(IMAGE_DIR, { recursive: true });
  for (const file of fs.readdirSync(IMAGE_DIR)) {
    fs.unlinkSync(path.join(IMAGE_DIR, file));
  }

  const products = catalogItems.map((item) => ({
    name: item.product_name,
    price: item.price,
    category: item.category,
    image: saveImage(item.item_id, item.image_url, item.image_mime_type),
  }));

  await db.product.deleteMany();
  await db.product.createMany({ data: products });
  console.log(`Seeded ${products.length} products from the hackathon catalog.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
