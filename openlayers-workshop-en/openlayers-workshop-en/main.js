import 'ol/ol.css';
import Map from 'ol/map';
import View from 'ol/view';
import TileLayer from 'ol/layer/tile';
import ImageLayer from 'ol/layer/image';
import XYZSource from 'ol/source/xyz';
import proj from 'ol/proj';
import VectorLayer from 'ol/layer/vector';
import VectorSource from 'ol/source/vector';
import Feature from 'ol/feature';
import Point from 'ol/geom/point';
import Style from 'ol/style/style';
import Circle from 'ol/style/style';
import Fill from 'ol/style/style';
import Stroke from 'ol/style/style';
import IconStyle from 'ol/style/icon';
import Overlay from 'ol/overlay';
import coordinate from 'ol/coordinate';
import ImageWMS from 'ol/source/imagewms';
import TileWMS from 'ol/source/tilewms';
import Draw from 'ol/interaction';
import Modify from 'ol/interaction';
import Snap from 'ol/interaction';
import Vector from 'ol/source';
import MousePosition from 'ol/control/MousePosition';
import createStringXY from 'ol/coordinate';
import BaseLayer from 'ol/layer/base';
import geojson from 'ol/format';



//define map
var map = new Map({
    target: 'map-container',
    layers: [
      new TileLayer({
          source: new XYZSource({
              url: 'http://tile.stamen.com/terrain/{z}/{x}/{y}.jpg'
          })
      })
    ],
    view: new View({
        projection:'EPSG:31370',
        center: [243000, 182000],
        zoom: 12
    })

    
});



var bron=document.getElementById('source').value;
var doel=document.getElementById('target').value;

var viewparams = 'source:' + bron+';target:' + doel;


var wmsSource = new ImageWMS({
    url: 'http://localhost:8080/geoserver/wms/cite'
    ,crossOrigin:'anonymous'
    ,params: {'LAYERS': 'cite:shortest_path',viewparams:viewparams},
    ratio: 1,
    serverType: 'geoserver'
});


var wmsLayer = new ImageLayer({
    source: wmsSource
});






const position = new VectorSource();
const vector = new VectorLayer({
    source: position
});


map.addLayer(vector);
vector.setStyle(new Style({
    image: new IconStyle({
        src: './data/marker.png'
    })
}));

//map.addLayer(wmsLayer);





var geoserverUrl = 'http://localhost:8080/geoserver';
// WFS to get the closest vertex to a point on the map
function getVertex(coordinates) {
  var url = geoserverUrl+'/wfs?service=WFS&version=1.0.0&' +
      'request=GetFeature&typeName=cite:nearest_vertex&' +
      'outputformat=application/json&' +
      'viewparams=x:' + coordinates[0] + ';y:' + coordinates[1];
  $.ajax({
     url: url,
     async: false,
     dataType: 'json',
     success: function(json) {
       loadVertex(json);
     }
  });
}

// load the response to the nearest_vertex layer
function loadVertex(response) {
  var geojson = new ol.format.GeoJSON();
  var features = geojson.readFeatures(response);
  console.log(features[0]);
  return features[0];
}








//refresh wms bij verandering source of target
function provinceselection() {
    $('input[type=number]').on('change', function () {
        console.log("change event")
        var bron=document.getElementById('source').value;
        var doel=document.getElementById('target').value;
        var viewparams = 'source:' + bron+';target:' + doel;
        wmsLayer.getSource().updateParams({'viewparams':viewparams});
        });
    }

provinceselection();








/*navigator.geolocation.getCurrentPosition(function(pos) {
const coords = proj.fromLonLat([pos.coords.longitude, pos.coords.latitude]);
map.getView().animate({center: coords, zoom: 10});
position.addFeature(new Feature(new Point(coords)));
});*/


var overlay = new Overlay({
    element: document.getElementById('popup-container'),
    positioning: 'bottom-center',
    offset: [0, -10]
});
map.addOverlay(overlay);



//bij het plaatsen van startpunt
function myFunctionstart() {
    map.on("click",function(e){
        overlay.setPosition();
        var coordinate = e.coordinate;
        console.log(coordinate);
        getVertex(coordinate);
        var features = map.getFeaturesAtPixel(e.pixel);
        //var coords = features[0].getGeometry().getCoordinates();
        //var hdms = coordinate.toStringHDMS(proj.toLonLat(coords));
        overlay.getElement().innerHTML = coordinate;
        overlay.setPosition(coordinate);
        
        //position.addFeature(new Feature(new Point(coordinate))); 
        
        //definieer beginpunt
        //bron=getVertex(coordinate)
        bron=1;
        //verander startnode naar nieuw beginpunt
        document.getElementById('source').value=bron;
        //verwijder huidige wms laag bij plaatsen van startpunt
        map.removeLayer(wmsLayer);
        //update params
        var bron=document.getElementById('source').value
        var doel=document.getElementById('target').value;
        viewparams = 'source:'+bron+';target:'+doel;
         
        console.log(viewparams);
        //maak nieuwe wms laag
        var wmsSource = new ImageWMS({
        url: 'http://localhost:8080/geoserver/wms/cite'
        ,crossOrigin:'anonymous'
        ,params: {'LAYERS': 'cite:shortest_path',viewparams:viewparams},
        ratio: 1,
        serverType: 'geoserver'
        });
        var wmsLayer = new ImageLayer({
            source: wmsSource
        });
        
        //voeg wms laag toe aan kaart
        map.addLayer(wmsLayer);
        
    })
    };

function myFunctionstop() {  
        map.on("click",function(e){
        overlay.setPosition();
        var coordinate = e.coordinate;
        console.log(coordinate);
        getVertex(coordinate);
        var features = map.getFeaturesAtPixel(e.pixel);
        //var coords = features[0].getGeometry().getCoordinates();
        //var hdms = coordinate.toStringHDMS(proj.toLonLat(coords));
        overlay.getElement().innerHTML = coordinate;
        overlay.setPosition(coordinate);
        //position.addFeature(new Feature(new Point(coordinate)));  
        //definieer eindpunt
        //doel=getVertex(coordinate)
        doel=2;
        //verander stopnode naar nieuw eindpunt
        document.getElementById('target').value=doel;
        //verwijder huidige wms laag
        map.removeLayer(wmsLayer);
        //update params
        var bron=document.getElementById('source').value;
        var doel=document.getElementById('target').value;
        viewparams='source:'+bron+';target:'+doel;
        console.log(viewparams);
        //maak nieuwe wms laag op basis van startpunt en stoppunt
        var wmsSource = new ImageWMS({
        url: 'http://localhost:8080/geoserver/wms/cite'
        ,crossOrigin:'anonymous'
        ,params: {'LAYERS': 'cite:shortest_path',viewparams:viewparams},
        ratio: 1,
        serverType: 'geoserver'
        });
        var wmsLayer = new ImageLayer({
            source: wmsSource
        });
        /*update wms layer
        var bron=document.getElementById('source').value;
        viewparams = 'source:1;target:'+doel;
        wmsLayer.getSource().updateParams({'viewparams':viewparams});
        })  */
        //voeg laag toe aan kaart
        map.addLayer(wmsLayer);  

})        
    };
    

/*function Functionstart(){
    map.un("click",myFunctionstop(event))
    map.on("click",myFunctionstart(event))
}

function Functionstop(){
    map.un("click",myFunctionstart(event))
    map.on("click",myFunctionstop(event))
}*/




 
        map.on("click",function(e){
        var checked=$('#toggle-event').prop('checked');
        //indien nieuw startpunt
        if (checked == true){
            overlay.setPosition();
            var coordinate = e.coordinate;
            console.log(coordinate);
            getVertex(coordinate);
            var features = map.getFeaturesAtPixel(e.pixel);
            //var coords = features[0].getGeometry().getCoordinates();
            //var hdms = coordinate.toStringHDMS(proj.toLonLat(coords));
            overlay.getElement().innerHTML = coordinate;
            overlay.setPosition(coordinate);
            
            //position.addFeature(new Feature(new Point(coordinate))); 
            
            //definieer beginpunt
            //bron=getVertex(coordinate)
            bron=1;
            //verander startnode naar nieuw beginpunt
            document.getElementById('source').value=bron;
            //verwijder huidige wms laag bij plaatsen van startpunt
            map.removeLayer(wmsLayer);
            //update params
            var bron=document.getElementById('source').value
            var doel=document.getElementById('target').value;
            viewparams = 'source:'+bron+';target:'+doel;
             
            console.log(viewparams);
            //maak nieuwe wms laag
            var wmsSource = new ImageWMS({
            url: 'http://localhost:8080/geoserver/wms/cite'
            ,crossOrigin:'anonymous'
            ,params: {'LAYERS': 'cite:shortest_path',viewparams:viewparams},
            ratio: 1,
            serverType: 'geoserver'
            });
            var wmsLayer = new ImageLayer({
                source: wmsSource
            });
            
            //voeg wms laag toe aan kaart
            map.addLayer(wmsLayer);
        }
        //indien nieuw eindpunt
        else if (checked == false){
        overlay.setPosition();
        var coordinate = e.coordinate;
        console.log(coordinate);
        getVertex(coordinate);
        var features = map.getFeaturesAtPixel(e.pixel);
        //var coords = features[0].getGeometry().getCoordinates();
        //var hdms = coordinate.toStringHDMS(proj.toLonLat(coords));
        overlay.getElement().innerHTML = coordinate;
        overlay.setPosition(coordinate);
        //position.addFeature(new Feature(new Point(coordinate)));  
        //definieer eindpunt
        //doel=getVertex(coordinate)
        doel=2;
        //verander stopnode naar nieuw eindpunt
        document.getElementById('target').value=doel;
        //verwijder huidige wms laag
        map.removeLayer(wmsLayer);
        //update params
        var bron=document.getElementById('source').value;
        var doel=document.getElementById('target').value;
        viewparams='source:'+bron+';target:'+doel;
        console.log(viewparams);
        //maak nieuwe wms laag op basis van startpunt en stoppunt
        var wmsSource = new ImageWMS({
        url: 'http://localhost:8080/geoserver/wms/cite'
        ,crossOrigin:'anonymous'
        ,params: {'LAYERS': 'cite:shortest_path',viewparams:viewparams},
        ratio: 1,
        serverType: 'geoserver'
        });
        var wmsLayer = new ImageLayer({
            source: wmsSource
        });
        /*update wms layer
        var bron=document.getElementById('source').value;
        viewparams = 'source:1;target:'+doel;
        wmsLayer.getSource().updateParams({'viewparams':viewparams});
        })  */
        //voeg laag toe aan kaart
        map.addLayer(wmsLayer);  
}
});



    
//var checked=$('#toggle-event').prop('checked');

//document.getElementById("toggle-event").addEventListener("change", startstop());









