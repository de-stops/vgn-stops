const Jsonix = require('jsonix').Jsonix;
const proj4 = require('proj4');
const json2csv = require('json2csv');
const iconvlite = require('iconv-lite');
const fs = require('fs');
const got = require('got');
const leftPad = require('left-pad');
const RS = [
	"09176",
	"09361",
	"09371",
	"09373",
	"09375",
	"09461",
	"09462",
	"09471",
	"09472",
	"09474",
	"09477",
	"09478",
	"09561",
	"09562",
	"09563",
	"09564",
	"09565",
	"09571",
	"09572",
	"09573",
	"09574",
	"09575",
	"09576",
	"09577",
	"09674",
	"09677",
	"09779"
].reduce((rs, r) => Object.assign(rs, { [r]: true }), {});

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
        var wptByEfaId = {};
	var stops = data.value.wpt
		.filter(wpt => wpt.efaType === 'stop')
		.map(wpt => { if (wptByEfaId[wpt.efaId]) {return null;} else { wptByEfaId[wpt.efaId] = wpt; return wpt; }})
		.filter(wpt => wpt !== null)
		.map(function(wpt) {
			var lonLat = proj4("+proj=tmerc +lat_0=0 +lon_0=12 +k=1 +x_0=4500000 +y_0=0 +datum=potsdam +units=m +no_defs", "EPSG:4326", {x: wpt.lon, y: wpt.lat})
			return {
				stop_id: wpt.efaId,
				stop_code: wpt.desc,
				stop_name: wpt.name,
				stop_lon: lonLat.x,
				stop_lat: lonLat.y,
			}
		})
		.filter(stop => {
			var rs = leftPad((stop.stop_id.match(/^de:(\d+):/)||['', ''])[1], 5, '0');
			return RS[rs];
		});
	process.stdout.write(json2csv({ data: stops, fields: ["stop_id", "stop_name", "stop_lon", "stop_lat", "stop_code"] }));
});
