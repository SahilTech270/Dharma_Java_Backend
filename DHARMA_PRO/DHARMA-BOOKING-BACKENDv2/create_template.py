from PIL import Image, ImageDraw

def create_base_ticket():
    # A4-ish ratio but smaller, or just a long receipt style
    # Let's go with 600px width and 900px height for good resolution
    W, H = 600, 900
    img = Image.new('RGB', (W, H), color='white')
    draw = ImageDraw.Draw(img)
    
    # Add a border
    draw.rectangle([10, 10, W-10, H-10], outline="black", width=2)
    
    # Add a header placeholder area
    # draw.rectangle([20, 20, W-20, 150], outline="gray", width=1)
    
    # Save
    import os
    if not os.path.exists("static"):
        os.makedirs("static")
        
    img.save("static/template_ticket.jpg")
    print("Created static/template_ticket.jpg")

if __name__ == "__main__":
    create_base_ticket()
