# AWS S3 Image Storage Setup Guide

This guide will help you configure AWS S3 for product image storage in your e-commerce application.

## Overview

The application now uses AWS S3 for storing product images instead of local file storage. This provides:

- **Scalability**: Store unlimited images without worrying about server disk space
- **Performance**: Fast image delivery through AWS infrastructure
- **Reliability**: Automatic backups and 99.999999999% durability
- **Cost-effective**: Pay only for what you use

## Prerequisites

1. An AWS account (sign up at https://aws.amazon.com/)
2. Basic understanding of AWS IAM and S3

## Step 1: Create an S3 Bucket

1. Log in to AWS Console: https://console.aws.amazon.com/
2. Navigate to **S3** service
3. Click **Create bucket**
4. Configure your bucket:
   - **Bucket name**: Choose a unique name (e.g., `thrayam-threads-products`)
   - **AWS Region**: Select your preferred region (e.g., `us-east-1`)
   - **Block Public Access settings**: Uncheck "Block all public access" (we need public read access for images)
   - Acknowledge the warning about public access
5. Click **Create bucket**

## Step 2: Configure Bucket Policy for Public Read Access

1. Go to your bucket
2. Click **Permissions** tab
3. Scroll to **Bucket policy**
4. Click **Edit**
5. Paste the following policy (replace `your-bucket-name` with your actual bucket name):

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::your-bucket-name/*"
        }
    ]
}
```

6. Click **Save changes**

## Step 3: Create IAM User for Programmatic Access

1. Navigate to **IAM** service in AWS Console
2. Click **Users** in the left sidebar
3. Click **Add users**
4. Configure user:
   - **User name**: `saree-ecommerce-s3-user`
   - **Access type**: Select "Programmatic access"
5. Click **Next: Permissions**
6. Click **Attach existing policies directly**
7. Search for and select `AmazonS3FullAccess` (or create a custom policy with limited permissions)
8. Click **Next: Tags** (optional, skip if not needed)
9. Click **Next: Review**
10. Click **Create user**

## Step 4: Save Access Keys

**IMPORTANT**: Save these credentials immediately - you won't be able to see the secret key again!

1. After creating the user, you'll see:
   - **Access key ID**: (e.g., `AKIAIOSFODNN7EXAMPLE`)
   - **Secret access key**: (e.g., `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`)
2. Download the CSV file or copy both values

## Step 5: Update Environment Variables

1. Open `backend/.env` file
2. Update the AWS S3 configuration section:

```env
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_actual_access_key_id
AWS_SECRET_ACCESS_KEY=your_actual_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=thrayam-threads-products
```

Replace:
- `your_actual_access_key_id` with your Access key ID
- `your_actual_secret_access_key` with your Secret access key
- Region with your chosen region (if different)
- Bucket name with your actual bucket name

## Step 6: Test the Integration

1. Restart your backend server:
```bash
cd backend
npm start
```

2. Try creating a new product with images through the admin panel
3. Check your S3 bucket - you should see the uploaded images in the `products/` folder

## Features Implemented

### 1. Product Creation
- When creating a product, images are uploaded to S3
- Images are stored in the `products/` folder with unique filenames
- URLs are saved in the database

### 2. Product Update
- New images are uploaded to S3
- Old images that are removed from the product are automatically deleted from S3
- Existing images are preserved

### 3. Product Deletion
- When a product is deleted, all associated images are automatically deleted from S3
- This prevents orphaned files and saves storage costs

### 4. Image Upload Routes
- `/api/upload/single` - Upload single image to S3
- `/api/upload/multiple` - Upload multiple images to S3
- `/api/upload/delete` - Delete image from S3 (requires URL or key)

## File Structure

```
backend/
├── src/
│   ├── utils/
│   │   └── s3Upload.js          # S3 upload utility functions
│   ├── middleware/
│   │   └── upload.js             # Multer configuration (uses memory storage)
│   ├── controllers/
│   │   └── productController.js  # Product CRUD with S3 integration
│   └── routes/
│       ├── uploadRoutes.js       # Upload API routes
│       └── productRoutes.js      # Product API routes
├── .env                          # Environment variables
└── S3_SETUP_GUIDE.md            # This file
```

## Security Best Practices

1. **Never commit `.env` file**: Already added to `.gitignore`
2. **Use IAM roles in production**: For EC2/ECS deployments
3. **Limit IAM permissions**: Create custom policy instead of full S3 access
4. **Enable bucket versioning**: For backup and recovery
5. **Set up lifecycle policies**: Automatically delete old/unused images

## Custom IAM Policy (Recommended for Production)

Instead of `AmazonS3FullAccess`, use this minimal policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::your-bucket-name",
                "arn:aws:s3:::your-bucket-name/*"
            ]
        }
    ]
}
```

## Troubleshooting

### Error: "Access Denied"
- Check that your AWS credentials are correct in `.env`
- Verify IAM user has S3 permissions
- Ensure bucket policy allows public read access

### Error: "Bucket not found"
- Verify bucket name in `.env` matches actual bucket name
- Check that region is correct
- Ensure bucket exists and wasn't accidentally deleted

### Images not loading in browser
- Check bucket policy allows public read access
- Verify CORS configuration if accessing from different domain
- Check that image URLs in database are correct

### Error: "Request has expired"
- Check your server's system time is correct
- AWS requires accurate time for signature validation

## CORS Configuration (if needed)

If accessing images from a different domain, add this CORS policy to your S3 bucket:

1. Go to bucket → Permissions → CORS
2. Add this configuration:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "HEAD"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": ["ETag"],
        "MaxAgeSeconds": 3000
    }
]
```

## Cost Estimation

AWS S3 pricing (approximate, as of 2024):
- **Storage**: ~$0.023 per GB/month
- **Requests**: $0.0004 per 1,000 PUT requests, $0.0004 per 10,000 GET requests
- **Data Transfer**: First 1 GB/month free, then ~$0.09/GB

Example:
- 1000 product images (~5MB each) = ~5GB storage = ~$0.12/month
- 100,000 image views/month = ~$0.04
- **Total**: ~$0.16/month for moderate usage

## Support

For issues or questions:
1. Check AWS S3 documentation: https://docs.aws.amazon.com/s3/
2. Review CloudWatch logs for detailed error messages
3. Check server logs for upload/delete operations

## Migration from Local Storage

If you have existing products with local images:

1. Manually upload old images to S3 using AWS CLI or Console
2. Update product image URLs in database
3. Keep local images as backup until verified

---

**Last Updated**: December 2024
