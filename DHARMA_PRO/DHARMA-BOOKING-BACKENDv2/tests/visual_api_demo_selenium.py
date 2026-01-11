"""
Simplified Visual API Testing using Selenium (lighter alternative to Playwright)
This uses Chrome/Edge that's already installed on your system!
No need to download 150MB of browser files.
"""
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
import random


def test_api_through_swagger_selenium():
    """
    Visual API testing using Selenium (uses your existing Chrome browser)
    Much lighter than Playwright - no extra browser download needed!
    """
    print("\n" + "="*60)
    print("🎯 Visual API Testing Demo (Using Selenium)")
    print("="*60 + "\n")
    
    # Set up Chrome options
    chrome_options = Options()
    chrome_options.add_argument("--start-maximized")
    
    try:
        # Try Chrome first
        print("🚀 Launching Chrome browser...")
        driver = webdriver.Chrome(options=chrome_options)
    except:
        try:
            # If Chrome fails, try Edge
            print("🚀 Launching Edge browser...")
            driver = webdriver.Edge()
        except Exception as e:
            print(f"❌ Could not launch browser: {e}")
            print("\n💡 Install ChromeDriver:")
            print("   pip install webdriver-manager")
            print("   Or manually download from: https://chromedriver.chromium.org/")
            return
    
    try:
        # Navigate to Swagger UI
        print("📖 Opening Swagger UI at http://localhost:8000/docs...")
        driver.get("http://localhost:8000/docs")
        time.sleep(2)
        
        wait = WebDriverWait(driver, 10)
        
        # Test 1: User Registration
        print("\n📝 Test 1: User Registration API")
        print("-" * 40)
        
        # Find and click User Registration
        try:
            user_reg = wait.until(EC.element_to_be_clickable(
                (By.XPATH, "//span[contains(text(),'User Registration')]")
            ))
            user_reg.click()
            time.sleep(0.5)
            
            # Click POST /users/register
            post_button = driver.find_element(
                By.XPATH, 
                "//button[contains(@class, 'opblock-summary-post') and contains(., '/users/register')]"
            )
            post_button.click()
            time.sleep(0.5)
            
            # Click Try it out
            try_it_out = wait.until(EC.element_to_be_clickable(
                (By.XPATH, "//button[contains(text(),'Try it out')]")
            ))
            try_it_out.click()
            time.sleep(0.5)
            
            # Fill in request body
            rand_num = random.randint(1000, 9999)
            request_body = f'''{{
  "userName": "selenium{rand_num}",
  "firstName": "Selenium",
  "lastName": "Test",
  "mobileNumber": "98765{rand_num}",
  "email": "selenium{rand_num}@test.com",
  "gender": "Male",
  "state": "Karnataka",
  "city": "Bangalore",
  "password": "test123"
}}'''
            
            textarea = driver.find_element(By.TAG_NAME, "textarea")
            driver.execute_script("arguments[0].value = arguments[1];", textarea, request_body)
            time.sleep(0.5)
            
            # Click Execute
            print(f"   ✅ Registering user: selenium{rand_num}")
            execute_button = driver.find_element(
                By.XPATH, 
                "//button[contains(text(),'Execute')]"
            )
            execute_button.click()
            time.sleep(2)
            
            print("   ✅ User registration request sent!")
            
        except Exception as e:
            print(f"   ⚠️  User registration demo skipped: {e}")
        
        # Test 2: Get All Temples
        print("\n🏛️  Test 2: Get All Temples API")
        print("-" * 40)
        
        try:
            # Scroll to Temples
            temples_section = driver.find_element(
                By.XPATH,
                "//span[contains(text(),'Temples')]"
            )
            driver.execute_script("arguments[0].scrollIntoView(true);", temples_section)
            time.sleep(0.5)
            temples_section.click()
            time.sleep(0.5)
            
            # Click GET /temples/
            get_temples = driver.find_element(
                By.XPATH,
                "//div[contains(@id,'operations-Temples')]//button[contains(@class,'opblock-summary-get')]"
            )
            get_temples.click()
            time.sleep(0.5)
            
            # Click Try it out
            try_buttons = driver.find_elements(
                By.XPATH,
                "//button[contains(text(),'Try it out')]"
            )
            if try_buttons:
                try_buttons[-1].click()
                time.sleep(0.5)
            
            # Click Execute
            print("   ✅ Fetching all temples...")
            execute_buttons = driver.find_elements(
                By.XPATH,
                "//button[contains(text(),'Execute')]"
            )
            if execute_buttons:
                execute_buttons[-1].click()
                time.sleep(2)
            
            print("   ✅ Temples retrieved!")
            
        except Exception as e:
            print(f"   ⚠️  Temples demo skipped: {e}")
        
        print("\n" + "="*60)
        print("✅ Visual API Testing Demo Complete!")
        print("="*60)
        print("\n💡 Browser will close in 5 seconds...")
        time.sleep(5)
        
    finally:
        driver.quit()
        print("🎬 Demo finished!")


if __name__ == "__main__":
    print("""
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   Simplified Visual API Testing (Selenium Version)          ║
║                                                              ║
║   Uses your existing Chrome/Edge browser - no big downloads! ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
    """)
    
    print("📋 Requirements:")
    print("   1. Chrome or Edge browser installed")
    print("   2. pip install selenium webdriver-manager")
    print("   3. API server running: uvicorn main:app --reload\n")
    
    try:
        test_api_through_swagger_selenium()
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("\n💡 Quick fix:")
        print("   pip install selenium webdriver-manager")
