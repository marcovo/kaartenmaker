cd /var/www/html/

chmod +x ./docker/wait-for-it/wait-for-it.sh
./docker/wait-for-it/wait-for-it.sh mysql:3306 -- echo 'database initialized'

mysql -hmariadb-server-10-2 -ukaartenmaker -psecret kaartenmaker < ./docker/db_structure.sql
