require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./src/models/Product');
const Category = require('./src/models/Category');

async function testProductCreation() {
  try {
    console.log('🔍 Testing Product Creation Validation...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find or create a test category
    let category = await Category.findOne();
    if (!category) {
      category = await Category.create({
        name: 'Test Category',
        slug: 'test-category',
        description: 'Test category for product creation'
      });
      console.log('✅ Created test category:', category.name);
    } else {
      console.log('✅ Using existing category:', category.name);
    }

    // Test 1: Create product with minimum required fields
    console.log('\n📝 Test 1: Creating product with minimum required fields...');
    const minimalProduct = {
      name: 'Test Saree Product',
      description: 'This is a test saree for S3 integration',
      price: 1999,
      category: category._id,
      fabric: 'Cotton',
      stock: 10
    };

    console.log('Product data:', JSON.stringify(minimalProduct, null, 2));

    try {
      const product1 = await Product.create(minimalProduct);
      console.log('✅ Minimal product created successfully!');
      console.log('   Product ID:', product1._id);
      console.log('   Product Slug:', product1.slug);

      // Clean up
      await Product.findByIdAndDelete(product1._id);
      console.log('   ✓ Cleaned up test product');
    } catch (error) {
      console.log('❌ Failed to create minimal product');
      console.log('   Error:', error.message);
      if (error.errors) {
        console.log('   Validation errors:');
        Object.keys(error.errors).forEach(key => {
          console.log(`     - ${key}: ${error.errors[key].message}`);
        });
      }
    }

    // Test 2: Create product with S3 image structure
    console.log('\n📝 Test 2: Creating product with S3 image structure...');
    const productWithImages = {
      name: 'Test Saree with S3 Images',
      description: 'This is a test saree with S3 images',
      price: 2999,
      discountPrice: 2499,
      category: category._id,
      fabric: 'Silk',
      stock: 5,
      colors: [
        { name: 'Red', hexCode: '#FF0000' },
        { name: 'Blue', hexCode: '#0000FF' }
      ],
      sizes: ['Free Size'],
      images: [
        {
          url: 'https://thrayam-threads-s3.s3.ap-south-1.amazonaws.com/products/test-image-1.jpg',
          key: 'products/test-image-1.jpg',
          alt: 'Test Saree - Image 1'
        },
        {
          url: 'https://thrayam-threads-s3.s3.ap-south-1.amazonaws.com/products/test-image-2.jpg',
          key: 'products/test-image-2.jpg',
          alt: 'Test Saree - Image 2'
        }
      ],
      isFeatured: true
    };

    console.log('Product data with images:', JSON.stringify(productWithImages, null, 2));

    try {
      const product2 = await Product.create(productWithImages);
      console.log('✅ Product with S3 images created successfully!');
      console.log('   Product ID:', product2._id);
      console.log('   Product Slug:', product2.slug);
      console.log('   Number of images:', product2.images.length);
      console.log('   Images:', product2.images);

      // Clean up
      await Product.findByIdAndDelete(product2._id);
      console.log('   ✓ Cleaned up test product');
    } catch (error) {
      console.log('❌ Failed to create product with images');
      console.log('   Error:', error.message);
      if (error.errors) {
        console.log('   Validation errors:');
        Object.keys(error.errors).forEach(key => {
          console.log(`     - ${key}: ${error.errors[key].message}`);
        });
      }
    }

    console.log('\n✅ All validation tests completed!\n');

    // Show required fields
    console.log('📋 Required fields for product creation:');
    console.log('   - name (String)');
    console.log('   - description (String)');
    console.log('   - price (Number)');
    console.log('   - category (ObjectId)');
    console.log('   - fabric (Enum: Cotton, Silk, Mul Mul Cotton, etc.)');
    console.log('   - stock (Number, default: 0)\n');

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

testProductCreation();
