from PIL import Image
import sys

def find_box(path):
    try:
        img = Image.open(path).convert('L') # Grayscale
    except Exception as e:
        print(f"Error opening image: {e}")
        return

    width, height = img.size
    pixels = img.load()
    
    # We assume the box is a black rectangle on a white background.
    # The text is at the top.
    # We can scan for the first horizonal line that is significantly wide (the top of the box)
    # But we need to skip the text.
    
    # Let's start scan from 25% down the image to skip header text
    start_y = int(height * 0.25)
    
    min_x, min_y = width, height
    max_x, max_y = 0, 0
    found = False
    
    threshold = 100 # Darkness threshold (0=black, 255=white)
    
    # Find all black pixels in the ROI
    for y in range(start_y, height):
        for x in range(width):
            if pixels[x, y] < threshold:
                if x < min_x: min_x = x
                if x > max_x: max_x = x
                if y < min_y: min_y = y
                if y > max_y: max_y = y
                found = True

    with open("box_info.txt", "w") as f:
        if found:
            box_w = max_x - min_x
            box_h = max_y - min_y
            f.write(f"Found box: x={min_x}, y={min_y}, w={box_w}, h={box_h}\n")
            f.write(f"Center: ({min_x + box_w // 2}, {min_y + box_h // 2})\n")
            f.write(f"Recommended QR Size: {min(box_w, box_h) - 20}\n")
            f.write(f"Recommended QR Position (Top-Left): ({min_x + 10}, {min_y + 10})\n")
        else:
            f.write("No box found.\n")

if __name__ == "__main__":
    find_box("static/template_ticket_v2.jpg")
