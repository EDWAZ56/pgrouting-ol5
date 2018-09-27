--postgis version
SELECT PostGIS_Version();
--pgr version
SELECT pgr_version();

--als pgrouting nog niet geinstalleerd is, installeer pgrouting op deze manier
create extension pgrouting;
--update pgrouting
ALTER EXTENSION pgrouting UPDATE TO "2.3.1";