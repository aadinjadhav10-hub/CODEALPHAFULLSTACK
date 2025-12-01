const mongoose = require("mongoose");
const Product = require("./models/productModel");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/ecommerce")
  .then(async () => {
    console.log("Connected to MongoDB");
    
    // Update products missing images
    const updates = [
      {
        name: "Portable Power Bank 20000mAh",
        image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500&h=500&fit=crop"
      },
      // Add more products here if needed
    ];
    
    for (const update of updates) {
      await Product.updateOne(
        { name: update.name },
        { $set: { image: update.image } }
      );
      console.log(`Updated: ${update.name}`);
    }
    
    console.log("All products updated!");
    process.exit();
  })
  .catch(err => {
    console.error("Error:", err);
    process.exit(1);
  });
