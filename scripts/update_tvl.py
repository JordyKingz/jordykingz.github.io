#!/usr/bin/env python3

import requests
import yaml
from datetime import datetime

def fetch_tvl_data():
    """Fetch TVL data from Yala API"""
    try:
        response = requests.get('https://public.yala.org:2053/public/yalaProtocol', timeout=10)
        response.raise_for_status()
        data = response.json()
        return data['data']
    except Exception as e:
        print(f"Error fetching TVL data: {e}")
        return None

def format_tvl(tvl):
    """Format TVL value to readable format"""
    if tvl >= 1e9:
        return f"${tvl/1e9:.2f}B"
    elif tvl >= 1e6:
        return f"${tvl/1e6:.2f}M"
    elif tvl >= 1e3:
        return f"${tvl/1e3:.2f}K"
    else:
        return f"${tvl:.2f}"

def update_projects_yml(data):
    """Update _data/projects.yml with new TVL data"""
    if not data:
        return
    
    tvl = data.get('tvl', 0)
    tvl_formatted = format_tvl(tvl)
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M UTC")
    
    # Read projects.yml
    with open('_data/projects.yml', 'r') as f:
        projects = yaml.safe_load(f)
    
    # Find and update Yala project
    for project in projects:
        if project['name'] == 'Yala':
            project['tvl'] = tvl_formatted
            print(f"Updated Yala TVL to: {tvl_formatted}")
            break
    
    # Write updated projects.yml
    with open('_data/projects.yml', 'w') as f:
        yaml.dump(projects, f, default_flow_style=False, sort_keys=False, allow_unicode=True)
    
    print(f"Projects data updated with TVL: {tvl_formatted} at {timestamp}")

if __name__ == "__main__":
    data = fetch_tvl_data()
    update_projects_yml(data)