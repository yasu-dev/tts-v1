from PIL import Image
import numpy as np

# Load the image
img = Image.open('public/fulfilment-logo.png')
img = img.convert("RGBA")

# Get image data
data = np.array(img)

# Get the background color (assuming it's the color at position 0,0)
bg_color = data[0, 0][:3]  # RGB values only

# Create a mask for pixels matching the background color
# Allow small tolerance for anti-aliasing
tolerance = 10
mask = np.all(np.abs(data[:, :, :3] - bg_color) <= tolerance, axis=2)

# Set alpha channel to 0 for background pixels
data[:, :, 3] = np.where(mask, 0, data[:, :, 3])

# Create new image from modified data
new_img = Image.fromarray(data, 'RGBA')

# Save the new image
new_img.save('public/fulfilment-logo.png')
print("Background removed successfully!")