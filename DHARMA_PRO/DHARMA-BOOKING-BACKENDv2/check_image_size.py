from PIL import Image
import os

path = "static/template_ticket.jpg"
if os.path.exists(path):
    with Image.open(path) as img:
        print(f"Template Size: {img.size}")
else:
    print("Template not found")
