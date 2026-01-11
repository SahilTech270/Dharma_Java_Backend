import base64
import sys
import os

def convert_image(image_path):
    if not os.path.exists(image_path):
        print(f"Error: File '{image_path}' not found.")
        return

    with open(image_path, "rb") as image_file:
        encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
        
    output_file = "image_base64.txt"
    with open(output_file, "w") as f:
        f.write(encoded_string)
        
    print(f"Success! Base64 string saved to '{output_file}'.")
    print("You can now copy the content of that file and paste it into Swagger.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python image_to_base64.py <path_to_image>")
    else:
        convert_image(sys.argv[1])
