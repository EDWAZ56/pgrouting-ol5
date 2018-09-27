--maak nieuwe kolom met geometrie in 2d en linestring ipv multilinestring (zonder z waarde)
ALTER TABLE wegenregister_selectie ADD geom2d2 geometry;
UPDATE wegenregister_selectie SET geom2d2 = ST_Force2D(ST_LineMerge(geom));

--verander coordinaatsysteem naar l72
SELECT UpdateGeometrySRID('wegenregister_selectie','geom2d2',31370);


--multilinestring naar linestring
update wegenregister_selectie 
set geom2d = (select ST_LineMerge(geom2d) from wegenregister_selectie);

--verander datatype naar linestring
ALTER TABLE wegenregister_selectie  
  ALTER COLUMN geom2d2 TYPE geometry(LINESTRING, 31370);


--rename gid to id
--alter table wegenregister_selectie
--rename column gid as id


--voeg kolom source,target,gid toe
alter table wegenregister_selectie add column source bigint;
alter table wegenregister_selectie add column target bigint;
--create network topology
select pgr_createTopology('wegenregister_selectie',3,'geom2d2','id');


--bereken kortste route van node 10 naar node 20
SELECT * FROM pgr_dijkstra('
   SELECT id, 
          source::int4 AS source, 
          target::int4 AS target, 
          ST_Length(geom2d2)::float8 AS cost
   FROM wegenregister_selectie',
10,
20,
false);


--bereken kortste route van source naar target waarbij de route als een is samengenomen
--dit is de sql view van de geoserver layer shortest_path
select 1 as route, ST_MakeLine(geom2d2) as routegeom,max(agg_cost) as afstand_m from 
(select route.*,geom2d2 from 
(SELECT * FROM pgr_dijkstra('
   SELECT id, 
          source::int4 AS source, 
          target::int4 AS target, 
          ST_Length(geom2d2)::float8 AS cost
   FROM wegenregister_selectie',
%source%,%target%,
false)) route inner join wegenregister_selectie
on (route.edge = wegenregister_selectie.id)) total
group by route;


--selecteer dichtsbijzijnde node bij een punt
select id from wegenregister2017_vertices_pgr v
order by v.the_geom <-> ST_SetSRID(ST_MakePoint(66000,217000), 31370) limit 1;

--geef meest nabije node
--dit is de sql view van de geoserver layer nearest_vertex
select v.id as vertex,v.the_geom as vertex_geom,string_agg(distinct(e.ws_uidn),',')
from wegenregister_selectie as e,wegenregister_selectie_vertices_pgr as v
where v.id=
(select id from wegenregister2017_vertices_pgr
order by the_geom <-> ST_SetSRID(ST_MakePoint(%x%, %y%), 31370) limit 1)
and (e.source=v.id or e.target=v.id)
group by v.id,v.the_geom;

--geef route van coordinaten x1,y1 naar coordinaten x2,y2
--work in progress
select v.id as vertex,v.the_geom as vertex_geom,string_agg(distinct(e.ws_uidn),',')
from wegenregister_selectie as e,wegenregister_selectie_vertices_pgr as v
where v.id=
(select id from wegenregister_selectie_vertices_pgr
order by the_geom <-> ST_SetSRID(ST_MakePoint(100000, 200000), 31370) limit 1)
and (e.source=v.id or e.target=v.id)
group by v.id,v.the_geom
union 
select v.id,v.the_geom,string_agg(distinct(e.ws_uidn),',')
from wegenregister_selectie as e,wegenregister_selectie_vertices_pgr as v
where v.id=
(select id from wegenregister_selectie_vertices_pgr
order by the_geom <-> ST_SetSRID(ST_MakePoint(66000, 205000), 31370) limit 1)
and (e.source=v.id or e.target=v.id)
group by v.id,v.the_geom;






