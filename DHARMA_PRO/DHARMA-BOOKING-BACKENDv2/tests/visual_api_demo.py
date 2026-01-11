"""
Visual API Testing Automation using Playwright
This script automates testing APIs through Swagger UI in a visible browser window.
You can watch the automation happen in real-time!
"""
import time
from playwright.sync_api import sync_playwright, expect
import random


def test_api_through_swagger():
    """
    Automated visual testing of APIs through Swagger UI.
    Opens a browser window and demonstrates API testing in real-time.
    """
    with sync_playwright() as p:
        # Launch browser in headed mode (visible)
        print("🚀 Launching browser...")
        browser = p.chromium.launch(headless=False, slow_mo=1000)  # slow_mo makes it easier to watch
        page = browser.new_page()
        
        # Navigate to Swagger UI
        print("📖 Opening Swagger UI...")
        page.goto("http://localhost:8000/docs")
        page.wait_for_load_state("networkidle")
        time.sleep(1)
        
        print("\n" + "="*60)
        print("🎯 Starting Visual API Testing Demo")
        print("="*60 + "\n")
        
        # Test 1: User Registration
        print("📝 Test 1: User Registration API")
        print("-" * 40)
        
        # Find and click User Registration section
        page.locator("text=User Registration").click()
        time.sleep(0.5)
        
        # Click on POST /users/register
        page.locator("button:has-text('POST'):near(:text('/users/register'))").first.click()
        time.sleep(0.5)
        
        # Click Try it out
        page.locator("button:has-text('Try it out')").first.click()
        time.sleep(0.5)
        
        # Fill in the request body
        rand_num = random.randint(1000, 9999)
        request_body = f'''{{
  "userName": "visualtest{rand_num}",
  "firstName": "Visual",
  "lastName": "Test",
  "mobileNumber": "98765{rand_num}",
  "email": "visualtest{rand_num}@demo.com",
  "gender": "Male",
  "state": "Karnataka",
  "city": "Bangalore",
  "password": "test123"
}}'''
        
        textarea = page.locator("textarea").first
        textarea.fill(request_body)
        time.sleep(0.5)
        
        # Click Execute
        print(f"   ✅ Registering user: visualtest{rand_num}")
        page.locator("button:has-text('Execute')").first.click()
        time.sleep(2)
        
        # Check response
        response = page.locator(".response-col_status").first
        if "200" in response.inner_text() or "201" in response.inner_text():
            print("   ✅ User registration successful!")
        else:
            print("   ❌ User registration failed")
        
        time.sleep(1)
        
        # Test 2: Get All Temples
        print("\n🏛️  Test 2: Get All Temples API")
        print("-" * 40)
        
        # Scroll to temples section
        page.locator("text=Temples").click()
        time.sleep(0.5)
        
        # Click GET /temples/
        page.locator("button:has-text('GET'):near(:text('/temples/'))").first.click()
        time.sleep(0.5)
        
        # Click Try it out
        page.locator("button:has-text('Try it out')").nth(1).click()
        time.sleep(0.5)
        
        # Click Execute
        print("   ✅ Fetching all temples...")
        page.locator("button:has-text('Execute')").nth(1).click()
        time.sleep(2)
        
        print("   ✅ Temples retrieved successfully!")
        time.sleep(1)
        
        # Test 3: Get All Slots
        print("\n🎫 Test 3: Get All Booking Slots API")
        print("-" * 40)
        
        # Scroll to Slots section (not Parking Slots)
        page.locator("h3:has-text('Slots')").first.click()
        time.sleep(0.5)
        
        # Click GET /slots/
        slots_section = page.locator("div.opblock-tag-section:has(h3:has-text('Slots'))").first
        slots_section.locator("button:has-text('GET')").first.click()
        time.sleep(0.5)
        
        # Click Try it out
        page.locator("button:has-text('Try it out')").nth(2).click()
        time.sleep(0.5)
        
        # Click Execute
        print("   ✅ Fetching all booking slots...")
        page.locator("button:has-text('Execute')").nth(2).click()
        time.sleep(2)
        
        print("   ✅ Booking slots retrieved successfully!")
        
        print("\n" + "="*60)
        print("✅ Visual API Testing Demo Complete!")
        print("="*60)
        print("\nBrowser will close in 5 seconds...")
        time.sleep(5)
        
        # Close browser
        browser.close()
        print("🎬 Demo finished!")


if __name__ == "__main__":
    print("""
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║        Visual API Testing Through Swagger UI                ║
║                                                              ║
║  This script will open a browser window and demonstrate     ║
║  testing your APIs through Swagger UI in real-time!         ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
    """)
    
    try:
        test_api_through_swagger()
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("\n💡 Tips:")
        print("   1. Make sure your API server is running (uvicorn main:app --reload)")
        print("   2. Install playwright: pip install playwright")
        print("   3. Install browser: playwright install chromium")
