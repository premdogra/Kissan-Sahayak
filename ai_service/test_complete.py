import os
import sys
import pandas as pd
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

print("=" * 60)
print("MarketPulse AI - Google Gemini Test")
print("=" * 60)

# Import chatbot
try:
    from chatbot_llm import MarketPulseLLM
    print("✅ Successfully imported chatbot_llm")
except ImportError as e:
    print(f"❌ Import error: {e}")
    sys.exit(1)

# Check Gemini API key
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("\n❌ GEMINI_API_KEY not found in .env file")
    print("💡 Please add your Google Gemini API key to .env file:")
    print("   GEMINI_API_KEY=your-gemini-api-key-here")
    print("\nGet your free API key from: https://makersuite.google.com/app/apikey")
    sys.exit(1)
else:
    print(f"✅ Gemini API key found: {api_key[:8]}...")

# Create empty DataFrame for mandis
empty_df = pd.DataFrame()

# Initialize chatbot
print("\n🤖 Initializing chatbot with Gemini...")
try:
    chatbot = MarketPulseLLM(api_key=api_key, mandis_df=empty_df)
    print("✅ Chatbot initialized successfully")
except Exception as e:
    print(f"❌ Failed to initialize chatbot: {e}")
    sys.exit(1)

# Test queries
test_queries = [
    {
        "name": "English greeting",
        "query": "Hello, what can you help me with?"
    },
    {
        "name": "Hindi price query", 
        "query": "जम्मू में केले का भाव क्या है?"
    },
    {
        "name": "Punjabi query",
        "query": "ਲੁਧਿਆਣੇ ਵਿੱਚ ਆਲੂ ਦਾ ਕੀ ਭਾਅ ਹੈ?" 
    },
    {
        "name": "Nearby mandis",
        "query": "Find nearby mandis",
        "lat": 31.6340,
        "lon": 74.8723
    }
]

print("\n🔍 Testing chatbot responses:")
print("-" * 60)

for test in test_queries:
    print(f"\n📝 Test: {test['name']}")
    print(f"   Query: {test['query']}")
    if 'lat' in test:
        print(f"   Location: {test['lat']}, {test['lon']}")
    print("-" * 40)
    
    try:
        response = chatbot.process_text_query(
            query=test['query'],
            user_id="test_user",
            lat=test.get('lat'),
            lon=test.get('lon')
        )
        
        if response['success']:
            print(f"✅ Success!")
            print(f"💬 Response: {response['response']}")
            print(f"🌐 Language: {response['language']}")
        else:
            print(f"❌ Error: {response.get('error', 'Unknown error')}")
            
    except Exception as e:
        print(f"❌ Exception: {e}")
    
    print("-" * 40)

print("\n✅ Test complete!")
print("\n💡 Next steps:")
print("1. Make sure your Gemini API key is correct")
print("2. Run the FastAPI server: uvicorn main:app --reload")
print("3. Test the API with curl commands")