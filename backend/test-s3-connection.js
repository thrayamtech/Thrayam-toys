require('dotenv').config();
const { S3Client, ListBucketsCommand, PutObjectCommand } = require('@aws-sdk/client-s3');

// Configure S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

async function testS3Connection() {
  console.log('\n🔍 Testing AWS S3 Connection...\n');
  console.log('Configuration:');
  console.log('- Region:', process.env.AWS_REGION || 'us-east-1');
  console.log('- Bucket:', process.env.AWS_S3_BUCKET_NAME);
  console.log('- Access Key ID:', process.env.AWS_ACCESS_KEY_ID ? `${process.env.AWS_ACCESS_KEY_ID.substring(0, 8)}...` : 'Not set');
  console.log('- Secret Key:', process.env.AWS_SECRET_ACCESS_KEY ? '***Hidden***' : 'Not set');
  console.log('\n');

  try {
    // Test 1: List buckets (verify credentials)
    console.log('✓ Test 1: Verifying AWS credentials...');
    const listBucketsCommand = new ListBucketsCommand({});
    const bucketsResponse = await s3Client.send(listBucketsCommand);
    console.log(`  ✅ Credentials valid! Found ${bucketsResponse.Buckets.length} buckets`);

    // Check if our bucket exists
    const bucketExists = bucketsResponse.Buckets.some(
      bucket => bucket.Name === process.env.AWS_S3_BUCKET_NAME
    );

    if (bucketExists) {
      console.log(`  ✅ Bucket "${process.env.AWS_S3_BUCKET_NAME}" exists`);
    } else {
      console.log(`  ⚠️  Bucket "${process.env.AWS_S3_BUCKET_NAME}" not found`);
      console.log('  Available buckets:', bucketsResponse.Buckets.map(b => b.Name).join(', '));
    }

    // Test 2: Upload a test file
    console.log('\n✓ Test 2: Testing file upload...');
    const testFileName = `test/connection-test-${Date.now()}.txt`;
    const testContent = 'This is a test file to verify S3 upload functionality.';

    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: testFileName,
      Body: Buffer.from(testContent),
      ContentType: 'text/plain'
      // Removed ACL - bucket policy will handle public access
    });

    await s3Client.send(uploadCommand);

    const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${testFileName}`;
    console.log(`  ✅ Test file uploaded successfully!`);
    console.log(`  📎 URL: ${fileUrl}`);

    console.log('\n✅ All tests passed! S3 integration is working correctly.\n');
    console.log('🎉 You can now create products with images - they will be uploaded to S3!\n');

  } catch (error) {
    console.error('\n❌ S3 Connection Error:\n');

    if (error.name === 'CredentialsProviderError') {
      console.error('  Issue: AWS credentials are missing or invalid');
      console.error('  Fix: Check your AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in .env file');
    } else if (error.name === 'NoSuchBucket') {
      console.error('  Issue: Bucket does not exist');
      console.error('  Fix: Create the bucket in AWS S3 or update AWS_S3_BUCKET_NAME in .env');
    } else if (error.name === 'AccessDenied') {
      console.error('  Issue: Access denied - insufficient permissions');
      console.error('  Fix: Ensure your IAM user has S3 permissions (PutObject, GetObject, DeleteObject)');
    } else if (error.code === 'InvalidAccessKeyId') {
      console.error('  Issue: Access Key ID is invalid');
      console.error('  Fix: Verify AWS_ACCESS_KEY_ID in .env matches your IAM user credentials');
    } else if (error.code === 'SignatureDoesNotMatch') {
      console.error('  Issue: Secret Access Key is incorrect');
      console.error('  Fix: Verify AWS_SECRET_ACCESS_KEY in .env matches your IAM user credentials');
    } else {
      console.error('  Error:', error.message);
      console.error('  Code:', error.code || 'Unknown');
      console.error('  Name:', error.name);
    }

    console.error('\n📖 For detailed setup instructions, see: backend/S3_SETUP_GUIDE.md\n');
    process.exit(1);
  }
}

testS3Connection();
