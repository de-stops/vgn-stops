# vgn-stops

This is a simple script to download all [VGN](http://www.vgn.de/) stops as [GTFS-compatible CSV](https://developers.google.com/transit/gtfs/reference/stops-file).

The script uses the following endpoint:

```
http://www.vgn.de/ib/site/tools/VN_Interface_EFAList.php?zoom=30&bbox={minx},{miny},{maxx},{maxy}
```

The script produces CSV output in the following format:

```
"stop_id","stop_name","stop_lon","stop_lat"
"de:09472:23351","Zettlitz (Gefrees) / Abzw. Zettlitz (b. Gefrees)",11.754919765977101,50.11980505179994
```

# Usage

```
npm install
node index.js
```

# Disclaimer

Usage of this script may or may not be legal, use on your own risk.  
This repository provides only source code, no data.

# License

Source code is licensed under [BSD 2-clause license](LICENSE). No license and no guarantees implied on the produced data, produce and use on your own risk.