# fetch_stats.py

import os
import json
import requests
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
import time

# --- Configuration ---
THM_USERNAME = os.environ.get("THM_USERNAME")
HTB_API_KEY = os.environ.get("HTB_API_KEY")
HTB_USER_ID = os.environ.get("HTB_USER_ID")
LEETCODE_USERNAME = os.environ.get("LEETCODE_USERNAME")
MONKEYTYPE_USERNAME = os.environ.get("MONKEYTYPE_USERNAME")

# --- Previous Functions (No changes needed) ---

def fetch_tryhackme_stats():
    """Fetches user stats from TryHackMe."""
    if not THM_USERNAME: return None
    try:
        response = requests.get(f"https://tryhackme.com/api/user/rank/{THM_USERNAME}")
        response.raise_for_status()
        data = response.json()
        badges_response = requests.get(f"https://tryhackme.com/api/user/badges/{THM_USERNAME}")
        badges_response.raise_for_status()
        badges_data = badges_response.json()
        return { "rank": f"Top {data.get('rank', 'N/A')}%" if data.get('rank') else 'N/A', "badges": len(badges_data) if isinstance(badges_data, list) else 0, "rooms": data.get("completedRooms", 0) }
    except Exception as e:
        print(f"Error fetching TryHackMe stats: {e}")
        return None

def fetch_hackthebox_stats():
    """Fetches user stats from Hack The Box API."""
    if not HTB_API_KEY or not HTB_USER_ID: return None
    try:
        headers = { "Authorization": f"Bearer {HTB_API_KEY}", "Content-Type": "application/json" }
        response = requests.get(f"https://www.hackthebox.com/api/v4/user/profile/basic/{HTB_USER_ID}", headers=headers)
        response.raise_for_status()
        data = response.json().get('profile', {})
        return { "rank": data.get('rank', 'N/A'), "owns": data.get('owns', {}).get('user', 0) + data.get('owns', {}).get('system', 0), "solves": data.get('challenge_solves', 0) }
    except Exception as e:
        print(f"Error fetching Hack The Box stats: {e}")
        return None

def fetch_leetcode_stats():
    """Fetches user stats from LeetCode using its GraphQL API."""
    if not LEETCODE_USERNAME: return None
    try:
        url = "https://leetcode.com/graphql"
        query = """query getUserProfile($username: String!) { allQuestionsCount { difficulty count } matchedUser(username: $username) { submitStats: submitStatsGlobal { acSubmissionNum { difficulty count } } profile { ranking } } }"""
        variables = {"username": LEETCODE_USERNAME}
        response = requests.post(url, json={'query': query, 'variables': variables})
        response.raise_for_status()
        data = response.json().get('data', {})
        user_data = data.get('matchedUser', {})
        solved_stats = user_data.get('submitStats', {}).get('acSubmissionNum', [])
        total_solved = next((item['count'] for item in solved_stats if item['difficulty'] == 'All'), 0)
        return { "solved": total_solved, "rank": "{:,}".format(user_data.get('profile', {}).get('ranking', 0)) }
    except Exception as e:
        print(f"Error fetching LeetCode stats: {e}")
        return None

# --- NEW Monkeytype Scraping Function ---

def fetch_monkeytype_stats():
    """Fetches user stats from Monkeytype by scraping their profile."""
    if not MONKEYTYPE_USERNAME:
        return None
        
    print("Setting up Selenium for Monkeytype scraping...")
    chrome_options = Options()
    chrome_options.add_argument("--headless")  # Run browser in the background
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    
    try:
        # Use webdriver-manager to handle the driver automatically
        driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
        
        url = f"https://monkeytype.com/profile/{MONKEYTYPE_USERNAME}"
        print(f"Navigating to {url}")
        driver.get(url)
        
        # Give the page a moment to load its dynamic content
        time.sleep(5)
        
        print("Scraping page for stats...")
        # Find the specific elements containing the 15s and 60s WPM scores
        wpm_15s = driver.find_element(By.css_selector, 'div[mode="time"][config="15"] .text-primary').text
        wpm_60s = driver.find_element(By.css_selector, 'div[mode="time"][config="60"] .text-primary').text
        
        driver.quit()
        print("Monkeytype stats scraped successfully.")
        
        return {
            "wpm_15s": wpm_15s,
            "wpm_60s": wpm_60s
        }
    except Exception as e:
        print(f"Error fetching Monkeytype stats: {e}")
        if 'driver' in locals():
            driver.quit()
        return None

def main():
    """Main function to fetch all stats and write to a JSON file."""
    stats = {
        "tryhackme": fetch_tryhackme_stats(),
        "hackthebox": fetch_hackthebox_stats(),
        "leetcode": fetch_leetcode_stats(),
        "monkeytype": fetch_monkeytype_stats() # Call the new function
    }
    
    with open("stats.json", "w") as f:
        json.dump(stats, f, indent=4)
    print("Stats successfully fetched and written to stats.json")

if __name__ == "__main__":
    main()