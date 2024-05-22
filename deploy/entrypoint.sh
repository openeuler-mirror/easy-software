#!/bin/bash

bash /etc/nginx/monitor.sh $DET_URL $DST_PATH &
nginx -g 'daemon off;'