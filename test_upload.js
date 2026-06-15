const fs = require('fs');
const path = require('path');

async function testUpload() {
  const fetch = (await import('node-fetch')).default;
  const FormData = require('form-data');
  
  // Create a dummy image
  const dummyBuffer = Buffer.from('/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=', 'base64');
  const filePath = path.join(__dirname, 'test_image.jpg');
  fs.writeFileSync(filePath, dummyBuffer);

  try {
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));

    const response = await fetch('https://workspaceapi-server-production-472f.up.railway.app/api/upload', {
      method: 'POST',
      body: form,
      headers: form.getHeaders()
    });

    const text = await response.text();
    console.log('Status:', response.status);
    console.log('Body:', text);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}

testUpload();
