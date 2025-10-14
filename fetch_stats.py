# fetch_stats.py

import os
import json
import requests

# --- Configuration ---
# Usernames and IDs for the services. We'll get these from GitHub Secrets.
THM_USERNAME = os.environ.get("THM_USERNAME")
HTB_API_KEY = os.environ.get("HTB_API_KEY") # We need API key for HTB
HTB_USER_ID = os.environ.get("HTB_USER_ID") # You need to find your user ID
LEETCODE_USERNAME = os.environ.get("LEETCODE_USERNAME")
# Monkeytype is difficult to scrape reliably without heavy tools like Selenium.
# For now, we'll use placeholder/manual values.
MONKEYTYPE_15S_WPM = "120+" # Manually update this value
MONKEYTYPE_60S_WPM = "110+" # Manually update this value


def fetch_tryhackme_stats():
    """Fetches user stats from TryHackMe."""
    if not THM_USERNAME:
        return None
    try:
        # Using an unofficial but public API endpoint
        response = requests.get(f"https://tryhackme.com/api/user/rank/{THM_USERNAME}")
        response.raise_for_status()
        data = response.json()
        
        # Another endpoint for badges and completed rooms
        badges_response = requests.get(f"https://tryhackme.com/api/user/badges/{THM_USERNAME}")
        badges_response.raise_for_status()
        badges_data = badges_response.json()

        return {
            "rank": f"Top {data.get('rank', 'N/A')}%" if data.get('rank') else 'N/A',
            "badges": len(badges_data) if isinstance(badges_data, list) else 0,
            "rooms": data.get("completedRooms", 0)
        }
    except Exception as e:
        print(f"Error fetching TryHackMe stats: {e}")
        return None

def fetch_hackthebox_stats():
    """Fetches user stats from Hack The Box API."""
    if not HTB_API_KEY or not HTB_USER_ID:
        return None
    try:
        headers = {
            "Authorization": f"Bearer {HTB_API_KEY}",
            "Content-Type": "application/json"
        }
        # Using the official HTB API v4
        response = requests.get(f"https://www.hackthebox.com/api/v4/user/profile/basic/{HTB_USER_ID}", headers=headers)
        response.raise_for_status()
        data = response.json().get('profile', {})
        
        return {
            "rank": data.get('rank', 'N/A'),
            "owns": data.get('owns', {}).get('user', 0) + data.get('owns', {}).get('system', 0),
            "solves": data.get('challenge_solves', 0),
        }
    except Exception as e:
        print(f"Error fetching Hack The Box stats: {e}")
        return None

def fetch_leetcode_stats():
    """Fetches user stats from LeetCode using its GraphQL API."""
    if not LEETCODE_USERNAME:
        return None
    try:
        url = "https://leetcode.com/graphql"
        query = """
        query getUserProfile($username: String!) {
          allQuestionsCount {
            difficulty
            count
          }
          matchedUser(username: $username) {
            submitStats: submitStatsGlobal {
              acSubmissionNum {
                difficulty
                count
              }
            }
            profile {
              ranking
            }
          }
        }
        """
        variables = {"username": LEETCODE_USERNAME}
        response = requests.post(url, json={'query': query, 'variables': variables})
        response.raise_for_status()
        data = response.json().get('data', {})
        
        user_data = data.get('matchedUser', {})
        solved_stats = user_data.get('submitStats', {}).get('acSubmissionNum', [])
        
        total_solved = 0
        for item in solved_stats:
            if item['difficulty'] == 'All':
                total_solved = item['count']
                break
        
        return {
            "solved": total_solved,
            "rank": "{:,}".format(user_data.get('profile', {}).get('ranking', 0))
        }
    except Exception as e:
        print(f"Error fetching LeetCode stats: {e}")
        return None


def main():
    """Main function to fetch all stats and write to a JSON file."""
    stats = {
        "tryhackme": fetch_tryhackme_stats(),
        "hackthebox": fetch_hackthebox_stats(),
        "leetcode": fetch_leetcode_stats(),
        "monkeytype": { # Using manual values for Monkeytype
            "wpm_15s": MONKEYTYPE_15S_WPM,
            "wpm_60s": MONKEYTYPE_60S_WPM
        }
    }
    
    # Write the stats to a file
    with open("stats.json", "w") as f:
        json.dump(stats, f, indent=4)
    print("Stats successfully fetched and written to stats.json")

if __name__ == "__main__":
    main()