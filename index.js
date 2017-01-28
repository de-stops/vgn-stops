const Jsonix = require('jsonix').Jsonix;
const proj4 = require('proj4');
const json2csv = require('json2csv');
const iconvlite = require('iconv-lite');
const fs = require('fs');
const got = require('got');

const vgn = {
	name: 'vgn',
	typeInfos: [{
		localName: 'gpx',
		propertyInfos: [{
			type: 'attribute',
			name: 'projection'
		}, {
			name: 'wpt',
			collection: true,
			typeInfo: '.wpt'
		}]
	}, {
		localName: 'wpt',
		propertyInfos: [{
			type: 'attribute',
			name: 'lat',
			typeInfo: 'Integer'
		}, {
			type: 'attribute',
			name: 'lon',
			typeInfo: 'Integer'
		}, {
			name: 'efaType'
		}, {
			name: 'efaId'
		}, {
			name: 'efaOMC'
		}, {
			name: 'name'
		}, {
			name: 'desc'
		}, {
			name: 'sym'
		}]
	}],
	elementInfos: [{
		elementName: 'gpx',
		typeInfo: '.gpx'
	}]
};


var context = new Jsonix.Context([vgn]);
var unmarshaller = context.createUnmarshaller();

const url = "http://www.vgn.de/ib/site/tools/VN_Interface_EFAList.php?zoom=30&bbox=0,0,100000000,100000000"

got(url, {encoding: null}).then(response => {
	var content = iconvlite.decode(response.body, "ISO-8859-1"); 
	var data = unmarshaller.unmarshalString(content);
	var stops = data.value.wpt
		.filter(wpt => wpt.efaType === 'stop')
		.map(function(wpt) {
			var lonLat = proj4("+proj=tmerc +lat_0=0 +lon_0=12 +k=1 +x_0=4500000 +y_0=0 +datum=potsdam +units=m +no_defs", "EPSG:4326", {x: wpt.lon, y: wpt.lat})
			return {
				stop_id: wpt.efaId,
				stop_name: wpt.name,
				stop_lon: lonLat.x,
				stop_lat: lonLat.y,
			}
		});
	process.stdout.write(json2csv({ data: stops, fields: ["stop_id", "stop_name", "stop_lon", "stop_lat"] }));
});
