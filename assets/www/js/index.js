
var map;
var arbolPuntos;

MQA.EventUtil.observe(document, 'deviceready', function() {

        /*Create an object for options*/
    var options= {
    	elt:document.getElementById('map'),        /*ID of element on the page where you want the map added*/
        zoom:12,                                   /*initial zoom level of map*/
        latLng:{lat:6.24531, lng:-75.57363},   /*center of map in latitude/longitude*/
        mtype:'map',                               /*map type (map)*/
        bestFitMargin:0,                           /*margin offset from the map viewport when applying a bestfit on shapes*/
        zoomOnDoubleClick:true                     /*zoom in when double-clicking on map*/
    };

    arbolPuntos = CreateKdTree();

    /*Construct an instance of MQA.TileMap with the options object*/
    map = new MQA.TileMap(options);
    navigator.notification.alert("¡El mapa ha cargado correctamente!", null, "Bienvenido", "Aceptar");
    MQA.withModule("smallzoom", "geolocationcontrol", function(){
    	map.addControl(
    		new MQA.SmallZoom(),
    		new MQA.MapCornerPlacement(MQA.MapCorner.TOP_LEFT, new MQA.Size(5,5))
    	);

    	map.addControl(new MQA.GeolocationControl());
    });
});

function CreateKdTree(){


    var distancia = function(puntoA, puntoB){
        var deg2radMultiplier = Math.PI / 180;
        var punto1 = { lat : puntoA.latitud * deg2radMultiplier,
                        lng : puntoA.longitud * deg2radMultiplier };
        var punto2 = { lat : puntoB.latitud * deg2radMultiplier,
                        lng : puntoB.longitud * deg2radMultiplier };

        var radio = 6378.137;
        var dlon = punto2.lng - punto1.lng;
        var distance = Math.acos(
                        Math.sin(punto1.lat) * Math.sin(punto2.lat) + 
                        Math.cos(punto1.lat) * Math.cos(punto2.lat) *
                        Math.cos(dlon)) * radio;
        return distance;
    };
    return new kdTree(estaciones, distancia, ["longitud", "latitud", "nombre", "comentario"]);

}


function searchLocationByQuery(){
    map.removeAllShapes();
    var resultados = document.getElementById("resultados");
    var query = document.getElementById("desde").value;
    var url = "http://nominatim.openstreetmap.org/search/";
    console.log(url);
    console.log(query);
    $.get(url, {format: "json", q: query + ", medellin, colombia", limit: 1}, function(jsonResponse){
        MQA.withModule('htmlpoi', function(){
            var punto = {longitud : jsonResponse[0].lon, latitud : jsonResponse[0].lat };
            var nearest = arbolPuntos.nearest(punto, 5);
            for(mark in nearest){
                var marker = new MQA.HtmlPoi({lat: nearest[mark][0].latitud, lng: nearest[mark][0].longitud});
                marker.setHtml("<img id='marker' src='http://www.mapquestapi.com/staticmap/geticon?uri=poi-1.png' />", 0, 0, "htmlPoi");
                marker.setRolloverContent(nearest[mark][0].nombre);
                marker.setInfoContentHTML(nearest[mark][0].comentario + "<br />Distancia: " + nearest[mark][1]);
                map.addShape(marker);
                Hammer(document.getElementById("marker")).on("tap", function(){
                    alert("tapped");
                });
            }
        });
    }).done(function(){
        alert("OK");
    }).fail(function(data){
        alert("NO OK - " + JSON.stringify(data));
    });
}