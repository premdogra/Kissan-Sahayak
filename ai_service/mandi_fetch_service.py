import requests
from datetime import datetime, timedelta
from db import mandi_collection
import os
from dotenv import load_dotenv
import logging
import csv
from io import StringIO

load_dotenv()

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Update these with the correct values from your Postman
API_KEY = "579b464db66ec23bdd000001b2514d41372b43dc72bd9f48789a2d05"  # Your actual API key
RESOURCE_ID = "35985678-0d79-46b4-9ed6-6f13308a1d24"
BASE_URL = f"https://api.data.gov.in/resource/{RESOURCE_ID}"


def fetch_recent_data(commodity=None, state=None, district=None, market=None, variety=None, grade=None, days_back=150):
    """
    Fetch data from the last N days using API's date filtering with all available filters
    """
    # Calculate date range
    end_date = datetime.today()
    start_date = end_date - timedelta(days=days_back)
    
    # Format dates as DD/MM/YYYY
    start_date_str = start_date.strftime("%d/%m/%Y")
    end_date_str = end_date.strftime("%d/%m/%Y")
    
    all_records = []
    offset = 0
    page_size = 200  # Using 200 as in Postman
    
    logger.info(f"Fetching data from {start_date_str} to {end_date_str}")
    logger.info(f"Filters - State: {state}, District: {district}, Market: {market}, Commodity: {commodity}, Variety: {variety}, Grade: {grade}")
    
    while True:
        # Build params dictionary
        params = {
            "api-key": API_KEY,
            "format": "csv",
            "limit": page_size,
            "offset": offset,
            "sort[Arrival_Date]": "desc"
        }
        
        # Add filters only if they are provided
        if state:
            params["filters[State]"] = state
        if district:
            params["filters[District]"] = district
        if market:
            params["filters[Market]"] = market
        if commodity:
            params["filters[Commodity]"] = commodity
        if variety:
            params["filters[Variety]"] = variety
        if grade:
            params["filters[Grade]"] = grade
        
        # Add date filters
        params["filters[Arrival_Date][gte]"] = start_date_str
        params["filters[Arrival_Date][lte]"] = end_date_str
        
        try:
            logger.info(f"Making request with offset {offset}")
            response = requests.get(BASE_URL, params=params, timeout=60)
            response.raise_for_status()
            
            # Parse CSV response
            csv_data = StringIO(response.text)
            csv_reader = csv.DictReader(csv_data)
            records = list(csv_reader)
            
            if not records:
                logger.info(f"No more records found at offset {offset}")
                break
                
            all_records.extend(records)
            logger.info(f"Fetched {len(records)} records (Total: {len(all_records)})")
            
            # If we got less than page_size, we're done
            if len(records) < page_size:
                logger.info("Received less than page_size, assuming last page")
                break
                
            offset += page_size
            
        except requests.exceptions.RequestException as e:
            logger.error(f"API request failed: {e}")
            if hasattr(e, 'response') and e.response:
                logger.error(f"Response content: {e.response.text}")
            break
        except Exception as e:
            logger.error(f"Error parsing CSV: {e}")
            break
    
    logger.info(f"Total records fetched: {len(all_records)}")
    return all_records


def fetch_without_date_filter(commodity=None, state=None, district=None, market=None, variety=None, grade=None, limit=1000):
    """
    Fetch data without date filter as a fallback
    """
    all_records = []
    offset = 0
    page_size = 200
    
    logger.info("Fetching without date filter (will filter in Python)")
    
    while True:
        # Build params dictionary
        params = {
            "api-key": API_KEY,
            "format": "csv",
            "limit": page_size,
            "offset": offset,
            "sort[Arrival_Date]": "desc"
        }
        
        # Add filters only if they are provided
        if state:
            params["filters[State]"] = state
        if district:
            params["filters[District]"] = district
        if market:
            params["filters[Market]"] = market
        if commodity:
            params["filters[Commodity]"] = commodity
        if variety:
            params["filters[Variety]"] = variety
        if grade:
            params["filters[Grade]"] = grade
        
        try:
            response = requests.get(BASE_URL, params=params, timeout=60)
            response.raise_for_status()
            
            # Parse CSV response
            csv_data = StringIO(response.text)
            csv_reader = csv.DictReader(csv_data)
            records = list(csv_reader)
            
            if not records:
                break
                
            all_records.extend(records)
            logger.info(f"Fetched {len(records)} records (Total: {len(all_records)})")
            
            if len(records) < page_size:
                break
                
            offset += page_size
            
            if len(all_records) >= limit:
                logger.info(f"Reached limit of {limit} records")
                break
                
        except Exception as e:
            logger.error(f"Fetch error: {e}")
            break
    
    return all_records


def filter_records_by_date(records, days_back=150):
    """
    Filter records in Python by date
    """
    cutoff_date = datetime.today() - timedelta(days=days_back)
    filtered = []
    
    logger.info(f"Filtering records with cutoff date: {cutoff_date.strftime('%d/%m/%Y')}")
    
    for r in records:
        try:
            # Handle different possible field names
            date_field = r.get('Arrival_Date') or r.get('arrival_date') or r.get('Arrival Date')
            if not date_field:
                logger.debug(f"No date field found in record: {r.keys()}")
                continue
                
            arrival_date = datetime.strptime(date_field.strip(), "%d/%m/%Y")
            if arrival_date >= cutoff_date:
                filtered.append(r)
        except (ValueError, KeyError) as e:
            logger.debug(f"Skipping record due to date error: {e}")
            continue
    
    logger.info(f"Filtered {len(filtered)} records from last {days_back} days")
    return filtered


def store_mandi_data(records):
    """
    Store records in MongoDB maintaining existing schema
    """
    inserted = 0
    updated = 0
    skipped = 0
    
    # Get field names from first record to understand structure
    if records:
        logger.info(f"Record fields: {list(records[0].keys())}")
    
    for r in records:
        try:
            # Extract all available fields with fallbacks
            commodity = r.get('Commodity') or r.get('commodity')
            state = r.get('State') or r.get('state')
            district = r.get('District') or r.get('district')
            market = r.get('Market') or r.get('market')
            
            # New fields we're adding support for (they will be None if not present)
            variety = r.get('Variety') or r.get('variety')
            grade = r.get('Grade') or r.get('grade')
            commodity_code = r.get('Commodity_Code') or r.get('commodity_code')
            
            arrival_date_str = r.get('Arrival_Date') or r.get('arrival_date') or r.get('Arrival Date')
            min_price = r.get('Min_Price') or r.get('min_price') or r.get('Min Price')
            max_price = r.get('Max_Price') or r.get('max_price') or r.get('Max Price')
            modal_price = r.get('Modal_Price') or r.get('modal_price') or r.get('Modal Price')
            
            # Parse date
            arrival_date = datetime.strptime(arrival_date_str.strip(), "%d/%m/%Y")
            
            # Build document maintaining existing schema with new optional fields
            document = {
                "commodity": commodity,
                "state": state,
                "district": district,
                "market": market,
                "arrival_date": arrival_date,
                "min_price": float(min_price) if min_price else 0,
                "max_price": float(max_price) if max_price else 0,
                "modal_price": float(modal_price) if modal_price else 0,
                "last_updated": datetime.utcnow()
            }
            
            # Add optional fields only if they exist
            if variety:
                document["variety"] = variety
            if grade:
                document["grade"] = grade
            if commodity_code:
                document["commodity_code"] = commodity_code
            
            # Use existing unique identifier (commodity + market + arrival_date)
            # Adding variety and grade to make it more specific
            query = {
                "commodity": document["commodity"],
                "market": document["market"],
                "arrival_date": document["arrival_date"]
            }
            
            # Add variety and grade to query if they exist for more precise matching
            if variety:
                query["variety"] = variety
            if grade:
                query["grade"] = grade
            
            result = mandi_collection.update_one(
                query,
                {"$set": document},
                upsert=True
            )
            
            if result.upserted_id:
                inserted += 1
            elif result.modified_count:
                updated += 1
                
        except Exception as e:
            logger.error(f"Error processing record: {e}")
            logger.error(f"Record data: {r}")
            skipped += 1
            continue
    
    logger.info(f"Storage summary - Inserted: {inserted}, Updated: {updated}, Skipped: {skipped}")
    return inserted


def check_existing_coverage(commodity=None, state=None, district=None, market=None, variety=None, grade=None, days_back=150):
    """
    Check what data we already have in the database with all available filters
    """
    cutoff_date = datetime.today() - timedelta(days=days_back)
    
    # Build query dynamically
    query = {
        "arrival_date": {"$gte": cutoff_date}
    }
    
    if commodity:
        query["commodity"] = commodity
    if state:
        query["state"] = state
    if district:
        query["district"] = district
    if market:
        query["market"] = market
    if variety:
        query["variety"] = variety
    if grade:
        query["grade"] = grade
    
    existing_count = mandi_collection.count_documents(query)
    
    unique_dates = mandi_collection.distinct("arrival_date", query)
    
    if unique_dates:
        unique_dates.sort()
        logger.info(f"Existing data: {existing_count} records across {len(unique_dates)} unique dates")
        logger.info(f"Date range in DB: {unique_dates[0].strftime('%d/%m/%Y')} to {unique_dates[-1].strftime('%d/%m/%Y')}")
    else:
        logger.info("No existing data found")
    
    return existing_count, unique_dates


if __name__ == "__main__":
    # Example usage with all available filters
    commodity = "Potato"
    state = "Punjab"
    district = "Ludhiana"
    market = None  # Optional
    variety = None  # Optional
    grade = None  # Optional
    days_back = 150
    
    # Check existing data
    logger.info("Checking existing data...")
    existing_count, existing_dates = check_existing_coverage(commodity, state, district, market, variety, grade, days_back)
    
    # Try fetching with date filters first
    logger.info("\nTrying fetch with date filters...")
    records = fetch_recent_data(commodity, state, district, market, variety, grade, days_back)
    
    if not records:
        logger.info("\nDate-filtered fetch returned 0 records. Trying without date filters...")
        records = fetch_without_date_filter(commodity, state, district, market, variety, grade)
        
        if records:
            logger.info(f"\nFiltering {len(records)} records by date...")
            records = filter_records_by_date(records, days_back)
    
    if records:
        logger.info(f"\nProcessing {len(records)} records for storage...")
        inserted = store_mandi_data(records)
        logger.info(f"Successfully inserted {inserted} new records")
        
        # Check final coverage
        logger.info("\nChecking final coverage...")
        final_count, final_dates = check_existing_coverage(commodity, state, district, market, variety, grade, days_back)
        
        expected_days = days_back
        actual_days = len(final_dates)
        coverage = (actual_days / expected_days) * 100 if expected_days > 0 else 0
        logger.info(f"Coverage: {actual_days}/{expected_days} days ({coverage:.1f}%)")
    else:
        logger.warning("No records fetched from API")