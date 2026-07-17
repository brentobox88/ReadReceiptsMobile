// scripts/test_api.js
// Run with: node scripts/test_api.js

const axios = require("axios");

const API_URL = "http://localhost:8000";

async function testAPI() {
  console.log("🧪 Testing ReadReceipts API...");
  console.log("========================================");
  
  // Test health
  try {
    console.log("📊 Testing /health...");
    const health = await axios.get(API_URL + "/health");
    console.log("✅ Health check passed!");
    console.log("   Status: " + health.data.status);
    console.log("   OCR: " + health.data.ocr);
  } catch (error) {
    console.error("❌ Health check failed:", error.message);
    console.log("   Make sure the backend is running: python main.py");
    return;
  }
  
  // Test create test receipts
  try {
    console.log("\n📊 Testing /test/receipts...");
    const test = await axios.get(API_URL + "/test/receipts");
    console.log("✅ Test receipts created!");
    console.log("   Created: " + test.data.message);
    if (test.data.receipts) {
      console.log("   Receipts:");
      test.data.receipts.forEach(function(r) {
        console.log("     - " + r.merchant + ": $" + r.total + " (" + r.confidence + ")");
      });
    }
  } catch (error) {
    console.error("❌ Test receipts failed:", error.message);
    if (error.response) {
      console.error("   Status: " + error.response.status);
      console.error("   Data: " + JSON.stringify(error.response.data));
    }
  }
  
  // Test get receipts
  try {
    console.log("\n📊 Testing /receipts...");
    const receipts = await axios.get(API_URL + "/receipts");
    console.log("✅ Get receipts passed!");
    console.log("   Total receipts: " + receipts.data.count);
    if (receipts.data.receipts && receipts.data.receipts.length > 0) {
      console.log("   Latest receipts:");
      receipts.data.receipts.slice(0, 3).forEach(function(r) {
        console.log("     - " + r.merchant + ": $" + r.total + " (" + r.date + ")");
      });
    }
  } catch (error) {
    console.error("❌ Get receipts failed:", error.message);
  }
  
  // Test upload with a simple image
  try {
    console.log("\n📊 Testing /upload...");
    console.log("   Checking for test image...");
    
    const fs = require("fs");
    const path = require("path");
    const FormData = require("form-data");
    
    const testImagePath = path.join(__dirname, "..", "test_receipt.jpg");
    if (fs.existsSync(testImagePath)) {
      console.log("   Found test_receipt.jpg, uploading...");
      const formData = new FormData();
      formData.append("file", fs.createReadStream(testImagePath));
      
      const upload = await axios.post(API_URL + "/upload", formData, {
        headers: formData.getHeaders(),
      });
      console.log("✅ Upload successful!");
      console.log("   Receipt ID: " + upload.data.receipt_id);
      console.log("   Merchant: " + upload.data.data.merchant);
      console.log("   Total: " + upload.data.data.total);
      console.log("   Confidence: " + upload.data.data.confidence);
    } else {
      console.log("⚠️  No test image found. Skipping upload test.");
      console.log("   Place a test_receipt.jpg in the project root.");
    }
  } catch (error) {
    console.error("❌ Upload failed:", error.message);
    if (error.response) {
      console.error("   Status: " + error.response.status);
      console.error("   Data: " + JSON.stringify(error.response.data));
    }
  }
  
  console.log("\n========================================");
  console.log("🎉 API test complete!");
}

// Run the test
testAPI();
