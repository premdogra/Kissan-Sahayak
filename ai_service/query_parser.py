import re

COMMODITIES = [
    "banana","apple","tomato","onion","potato",
    "wheat","rice","mango","peas","cabbage"
]

DISTRICTS = [
    "jammu","ludhiana","pathankot","kathua","amritsar"
]


def parse_query(query):

    query = query.lower()

    commodity = None
    district = None

    for c in COMMODITIES:
        if c in query:
            commodity = c.capitalize()

    for d in DISTRICTS:
        if d in query:
            district = d.capitalize()

    return commodity, district