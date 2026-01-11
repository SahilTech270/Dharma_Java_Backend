import os

req_file = "requirements.txt"

try:
    # Try reading as utf-16 (since view_file failed with that hint)
    try:
        with open(req_file, "r", encoding="utf-16") as f:
            content = f.read()
            encoding = "utf-16"
    except UnicodeError:
        # Fallback to utf-8
        with open(req_file, "r", encoding="utf-8") as f:
            content = f.read()
            encoding = "utf-8"

    if "qrcode" not in content:
        print("Adding qrcode to requirements.txt")
        with open(req_file, "a", encoding=encoding) as f:
            f.write("\nqrcode\n")
    else:
        print("qrcode already in requirements.txt")

except Exception as e:
    print(f"Error updating requirements.txt: {e}")
