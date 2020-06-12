# sdt
Software Development Template

1st: create folder log /zf/aplication (on Linux OS make it write so chomd it to 777. On Windows OS you do not need make it writabe)
2nd: open phpMyAdmin and make new database i4ware_sdt with Collation utf8_general_ci (you can altenativelly create dababase with name what ever you want)
3nd: make new user named i4ware_sdt for databese i4ware_sdt (you can altenativelly create user with name what ever you want)
4rd: run i4ware_sdt_1.0.1.sql file to your new database i.e i4ware_sdt
5ft: copy config.example.xml with naw name config.xml on folder /zf/aplication/configs
6th: make all needed changes to config.xml like change dadabase password, etc.
7th: configure your Appace VirtualHost to point directory htdocs/sdt on Windows OS if you use XAMPP and on Linux OS VirtualHost setting based to Linux Distro