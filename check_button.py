from PIL import Image
import numpy as np

img = Image.open('last_frame.jpg')
arr = np.array(img)
# 960x960
# Upper middle is around x=480, y=100-300
region = arr[50:350, 380:580]
# Find dark pixels
dark_pixels = np.sum(np.mean(region, axis=2) < 50)
print(f"Dark pixels: {dark_pixels}")
