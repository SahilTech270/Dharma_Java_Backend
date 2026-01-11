import sys
print(f"Python: {sys.executable}")
try:
    import PIL
    print(f"Pillow location: {PIL.__file__}")
    import qrcode
    print(f"qrcode location: {qrcode.__file__}")
    print("IMPORTS SUCCESSFUL")
except ImportError as e:
    print(f"IMPORT ERROR: {e}")
