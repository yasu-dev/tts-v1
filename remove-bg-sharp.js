const sharp = require('sharp');

async function removeBackground() {
  try {
    // Read the image and extract raw pixel data
    const image = sharp('./public/fulfilment-logo.png');
    const metadata = await image.metadata();
    const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });

    // Convert to RGBA if not already
    const channels = info.channels;
    const width = info.width;
    const height = info.height;

    // Get the background color from the top-left corner
    const bgR = data[0];
    const bgG = data[1];
    const bgB = data[2];

    // Create new buffer for RGBA data
    const outputBuffer = Buffer.alloc(width * height * 4);

    // Process each pixel
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * channels;
        const outIdx = (y * width + x) * 4;

        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const a = channels === 4 ? data[idx + 3] : 255;

        // Calculate color distance
        const rDiff = Math.abs(r - bgR);
        const gDiff = Math.abs(g - bgG);
        const bDiff = Math.abs(b - bgB);

        // If the color is close to the background color, make it transparent
        if (rDiff < 15 && gDiff < 15 && bDiff < 15) {
          outputBuffer[outIdx] = r;
          outputBuffer[outIdx + 1] = g;
          outputBuffer[outIdx + 2] = b;
          outputBuffer[outIdx + 3] = 0; // Transparent
        } else {
          outputBuffer[outIdx] = r;
          outputBuffer[outIdx + 1] = g;
          outputBuffer[outIdx + 2] = b;
          outputBuffer[outIdx + 3] = a;
        }
      }
    }

    // Save the new image
    await sharp(outputBuffer, {
      raw: {
        width: width,
        height: height,
        channels: 4
      }
    })
      .png()
      .toFile('./public/fulfilment-logo.png');

    console.log('Background removed successfully!');
  } catch (error) {
    console.error('Error processing image:', error);
  }
}

removeBackground();