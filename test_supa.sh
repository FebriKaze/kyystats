#!/bin/bash
source .env
URL=$VITE_SUPABASE_URL
KEY=$VITE_SUPABASE_ANON_KEY
curl -s -X POST -H "apikey: $KEY" -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" -d '{"category":"TEST", "title":"TEST", "short_desc":"TEST", "image_url":"TEST", "challenge_text":"TEST", "sulotion_text":"TEST", "result_text":"TEST"}' "$URL/rest/v1/portfolios"
