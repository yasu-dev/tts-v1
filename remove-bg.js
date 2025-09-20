async function removeBackground() {
  const Jimp = (await import('jimp')).default;

  try {
    // Read the image
    const image = await Jimp.read('./public/fulfilment-logo.png');

    // Get the background color from the top-left corner
    const bgColor = image.getPixelColor(0, 0);

    // Scan through all pixels
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
      // Get the current pixel color
      const pixelColor = this.getPixelColor(x, y);

      // Calculate color distance (simple RGB distance)
      const rDiff = Math.abs(Jimp.intToRGBA(pixelColor).r - Jimp.intToRGBA(bgColor).r);
      const gDiff = Math.abs(Jimp.intToRGBA(pixelColor).g - Jimp.intToRGBA(bgColor).g);
      const bDiff = Math.abs(Jimp.intToRGBA(pixelColor).b - Jimp.intToRGBA(bgColor).b);

      // If the color is close to the background color, make it transparent
      if (rDiff < 20 && gDiff < 20 && bDiff < 20) {
        this.bitmap.data[idx + 3] = 0; // Set alpha to 0 (transparent)
      }
    });

    // Save the modified image
    await image.writeAsync('./public/fulfilment-logo.png');
    console.log('Background removed successfully!');
  } catch (error) {
    console.error('Error processing image:', error);
  }
}

removeBackground();