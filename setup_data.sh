#!/bin/bash 
node app/store/update_stores.js;
node app/import_old_site/import.js;
node app/import_old_site/refetch_tweets.js;
node app/twitter/parse_unparsed_tweets.js;
node app/store/find_stores_from_tweets.js;
node app/user/update_totals.js;
