"""
IMPROVED Visual API Testing using Selenium
More reliable element detection with better waits and error handling
"""
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.options import Options
import random


def test_swagger_ui_simple():
    """
    Simplified visual test - just opens Swagger and demonstrates one API
    """
    print("\n" + "="*70)
    print("🎯 Visual API Testing Demo - Improved Version")
    print("="*70 + "\n")
    
    # Setup Chrome
    chrome_options = Options()
    chrome_options.add_argument("--start-maximized")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_experimental_option("excludeSwitches", ["enable-logging"])
    
    driver = None
    
    try:
        print("🚀 Launching Chrome browser...")
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=chrome_options)
        
        # Navigate to Swagger
        url = "http://localhost:8000/docs"
        print(f"📖 Opening Swagger UI at {url}...")
        driver.get(url)
        
        # Wait for page to load
        print("⏳ Waiting for Swagger UI to load...")
        wait = WebDriverWait(driver, 10)
        wait.until(EC.presence_of_element_located((By.CLASS_NAME, "swagger-ui")))
        time.sleep(2)  # Extra wait for full render
        
        print("✅ Swagger UI loaded successfully!\n")
        
        # Test 1: Show all available API sections
        print("📋 API Sections Available:")
        print("-" * 70)
        
        try:
            # Find all API tag sections
            sections = driver.find_elements(By.CSS_SELECTOR, "h3.opblock-tag")
            for i, section in enumerate(sections, 1):
                section_name = section.text.strip()
                if section_name:
                    print(f"   {i}. {section_name}")
            
            if not sections:
                print("   ❌ No API sections found. Showing page source...")
                print(driver.page_source[:500])
        except Exception as e:
            print(f"   ⚠️  Could not list sections: {e}")
        
        # Test 2: Try to interact with GET /temples (simplest endpoint)
        print("\n🏛️  Demonstrating GET /temples/ API:")
        print("-" * 70)
        
        try:
            # Method 1: Try clicking by text
            print("   📍 Looking for 'Temples' section...")
            temples_header = None
            
            # Try different selectors
            selectors = [
                (By.XPATH, "//span[contains(text(),'Temples')]"),
                (By.XPATH, "//h3[contains(text(),'Temples')]"),
                (By.CSS_SELECTOR, "h3.opblock-tag"),
            ]
            
            for by, selector in selectors:
                try:
                    elements = driver.find_elements(by, selector)
                    for elem in elements:
                        if 'Temples' in elem.text:
                            temples_header = elem
                            break
                    if temples_header:
                        break
                except:
                    continue
            
            if temples_header:
                print(f"   ✅ Found Temples section at: {temples_header.tag_name}")
                
                # Scroll to make it visible
                driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", temples_header)
                time.sleep(1)
                
                # Click to expand
                temples_header.click()
                print("   ✅ Clicked Temples section")
                time.sleep(1)
                
                # Look for GET endpoint
                get_buttons = driver.find_elements(By.CSS_SELECTOR, "button.opblock-summary-get")
                print(f"   📍 Found {len(get_buttons)} GET endpoints")
                
                if get_buttons:
                    # Click first GET endpoint (should be /temples/)
                    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", get_buttons[0])
                    time.sleep(0.5)
                    get_buttons[0].click()
                    print("   ✅ Opened GET /temples/ endpoint")
                    time.sleep(1)
                    
                    # Try to click "Try it out"
                    try_buttons = driver.find_elements(By.XPATH, "//button[contains(text(),'Try it out')]")
                    if try_buttons:
                        try_buttons[0].click()
                        print("   ✅ Clicked 'Try it out'")
                        time.sleep(1)
                        
                        # Click Execute
                        execute_buttons = driver.find_elements(By.XPATH, "//button[contains(text(),'Execute')]")
                        if execute_buttons:
                            execute_buttons[0].click()
                            print("   ✅ Clicked 'Execute' - API request sent!")
                            time.sleep(2)
                            
                            # Try to find response
                            try:
                                response_body = driver.find_element(By.CSS_SELECTOR, ".response-col_status")
                                status_code = response_body.text
                                print(f"   ✅ Response Status: {status_code}")
                            except:
                                print("   ℹ️  Response received (status not visible)")
            else:
                print("   ❌ Could not find Temples section")
                print("   💡 Available page text:", driver.page_source[:1000])
                
        except Exception as e:
            print(f"   ⚠️  Demo interaction failed: {e}")
        
        print("\n" + "="*70)
        print("✅ Visual Demo Complete!")
        print("="*70)
        print("\n💡 The browser window will stay open for 10 seconds so you can see")
        print("   the Swagger UI. Feel free to click around and explore!")
        print("\n⏰ Closing in 10 seconds...")
        
        time.sleep(10)
        
    except Exception as e:
        print(f"\n❌ Error during demo: {e}")
        print("\n💡 Troubleshooting:")
        print("   1. Ensure API server is running: uvicorn main:app --reload")
        print("   2. Check http://localhost:8000/docs opens in your browser")
        print("   3. Try closing other Chrome instances")
        
    finally:
        if driver:
            driver.quit()
        print("\n🎬 Demo finished!")


if __name__ == "__main__":
    print("""
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║         Visual API Testing - Improved Selenium Version            ║
║                                                                    ║
║   This will open Chrome and show you the Swagger UI with your     ║
║   APIs. You can watch the automation happen and then explore!     ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
    """)
    
    print("✅ Requirements Check:")
    print("   • Selenium: Installed")
    print("   • Chrome: Required (or Edge)")
    print("   • API Server: Should be running on http://localhost:8000\n")
    
    test_swagger_ui_simple()
