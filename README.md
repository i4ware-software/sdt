# sdt
Software Development Template

1. create folder log /zf/application (on Linux OS make it writable so chmod it to 777. On Windows OS you do not need make it writabe manually)
1. open phpMyAdmin and make new database i4ware_sdt with Collation utf8_general_ci (you can altenativelly create dababase with name what ever you want)
1. make new user named i4ware_sdt for databese i4ware_sdt (you can altenativelly create user with name what ever you want)
1. run i4ware_sdt_1.0.1.sql file to your new database i.e i4ware_sdt
1. copy config.example.xml with naw name config.xml on folder /zf/application/configs
1. make all needed changes to config.xml like change dadabase password, etc.
1. configure your Appace VirtualHost to point directory htdocs/sdt on Windows OS if you use XAMPP and on Linux OS VirtualHost setting based to Linux Distro