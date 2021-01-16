#!/bin/sh

set -e

echo 'Copy application config'
cp server-config/config.json.example server-config/config.json

echo 'Trigger init database'
sh ./docker/init-database.sh

echo 'Start apache'
exec apache2-foreground
