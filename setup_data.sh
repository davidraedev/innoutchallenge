#!/bin/bash 
node --trace-warnings app/store/update_stores.js;
sleep 1;
node --trace-warnings app/import_old_site/import.js;
sleep 1;
node --trace-warnings app/import_old_site/refetch_tweets.js;
sleep 1;
node --trace-warnings app/import_old_site/post_cleanup.js;
sleep 1;
node --trace-warnings app/twitter/parse_unparsed_tweets.js;
sleep 1;
node --trace-warnings app/store/get_and_parse_tweets_search.js;
sleep 1;
node --trace-warnings app/store/find_stores_from_tweets.js;
sleep 1;
node --trace-warnings app/user/update_totals.js;
