require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

const products = [
  { name: "Oakview Sofa", price: 899, category: "Sofas", image: "/products/sofa-oakview.svg" },
  { name: "Willow Armchair", price: 349, category: "Chairs", image: "/products/chair-willow.svg" },
  { name: "Birchcroft Dining Table", price: 620, category: "Tables", image: "/products/table-birchcroft.svg" },
  { name: "Maple Bookshelf", price: 275, category: "Storage", image: "/products/shelf-maple.svg" },
  { name: "Hollis Bed Frame", price: 540, category: "Bedroom", image: "/products/bed-hollis.svg" },
  { name: "Fenwick Coffee Table", price: 210, category: "Tables", image: "/products/table-fenwick.svg" },
  { name: "Cedar Desk", price: 380, category: "Office", image: "/products/desk-cedar.svg" },
  { name: "Linley Bar Stool", price: 95, category: "Chairs", image: "/products/stool-linley.svg" },
  { name: "Ashgrove Wardrobe", price: 710, category: "Bedroom", image: "/products/wardrobe-ashgrove.svg" },
  { name: "Nova Floor Lamp", price: 120, category: "Lighting", image: "/products/lamp-nova.svg" },
  { name: "Bramble Rug (5x7)", price: 165, category: "Decor", image: "/products/rug-bramble.svg" },
  { name: "Elmridge TV Stand", price: 310, category: "Storage", image: "/products/tvstand-elmridge.svg" },
];

async function main() {
  await db.product.deleteMany();
  await db.product.createMany({ data: products });
  console.log(`Seeded ${products.length} products.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
