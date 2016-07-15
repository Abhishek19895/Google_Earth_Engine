//  ------------------------ // ------------------- // -----------------
//Author : Abhishek Singh
//USF-ID : 20363537
//Lab 2 Submission
//Annual product (2000, 2005, 2010, 2015) at moderate spatial resolution.
//Script that maps out two image collections for 2000, 2005, 2010, and 2013 
//for a location in the Lower Mekong in falseColor
//The script also identifies the spatial (Scale) and temporal resolution 
//for each element 

//  ------------------------ // ------------------- // -----------------
// Starting with Spatial Resolution
//  ------------------------ // ------------------- // -----------------

//Hardcoding a specific point :: Lower Mekong
 var sfoPoint = ee.Geometry.Point(122.3774, 37.6194); 
Map.centerObject(sfoPoint, 16); 
//Use these MODIS bands for red, green, blue, respectively. 
var modisBands = ['sur_refl_b01', 'sur_refl_b04', 'sur_refl_b03']; 
//Define visualization parameters for MODIS. 
var modisVis = {bands: modisBands, min: 0, max: 3000}; 
//Define False color template for 2000
var falseColor = {
 bands: ['B3', 'B2', 'B1'],
 min: 0,
 max: 100
 };

//Get a surface reflectance image from the 2000 Year. 
var modisImage2000 = ee.Image(landsat
 .filterDate('2000-01-01', '2000-12-31')
 .filterBounds(sfoPoint) // location of the point
 .sort('CLOUD_COVER')
 .first());
 
//Add the MODIS image to the map.
Map.addLayer(modisImage2000, falseColor, 'MODIS for 2000'); 

// Get the scale of the data from the first band's projection:
var modisScale2000 = modisImage2000.select('B2')
.projection().nominalScale();

print('MODIS scale for Year 2000:', modisScale2000);


//Extracting Image for Year 2005
var modisImage2005 = ee.Image(myd09
 .filterDate('2005-01-01', '2005-12-31')
 .filterBounds(Map.getCenter()) // location of the point
 .sort('CLOUD_COVER')
 .first());
 
//Add the MODIS image to the map.
Map.addLayer(modisImage2005, modisVis, 'MODIS for 2005'); 
 
// Get the scale of the data from the first band's projection:
var modisScale2005 = modisImage2005.select('sur_refl_b01')
.projection().nominalScale();

print('MODIS scale for Year 2005:', modisScale2005);

//Extracting Image for Year 2010
var modisImage2010 = ee.Image(myd09
 .filterDate('2010-01-01', '2010-12-31')
 .filterBounds(Map.getCenter()) // location of the point
 .sort('CLOUD_COVER')
 .first());
 
//Add the MODIS image to the map.
Map.addLayer(modisImage2010, modisVis, 'MODIS for 2010'); 
 
// Get the scale of the data from the first band's projection:
var modisScale2010 = modisImage2010.select('sur_refl_b01')
.projection().nominalScale();

print('MODIS scale for Year 2010:', modisScale2010);
 
//Extracting Image for Year 2010
var modisImage2015 = ee.Image(myd09
 .filterDate('2015-01-01', '2015-12-31')
 .filterBounds(Map.getCenter()) // location of the point
 .sort('CLOUD_COVER')
 .first());
 
//Add the MODIS image to the map.
Map.addLayer(modisImage2015, modisVis, 'MODIS for 2015'); 
 
// Get the scale of the data from the first band's projection:
var modisScale2015 = modisImage2015.select('sur_refl_b01')
.projection().nominalScale();

print('MODIS scale for Year 2015:', modisScale2015);


//  ------------------------ // ------------------- // -----------------
// Starting the part of TM datasets
//  ------------------------ // ------------------- // -----------------

// Filter TM imagery by location, date and cloudiness for 2000.
var tmImage2000 = ee.Image(tm
.filterBounds(Map.getCenter())
.filterDate('2000-01-01','2000-12-31')
.sort('CLOUD_COVER')
.first());

// Display the TM image as a Falsecolor composite.
Map.addLayer(tmImage2000, {bands: ['B4', 'B3', 'B2'], min: 0, max: 0.4}
, 'TM for Year 2000');

//Get the scale of the TM data from its projection:
var tmScale2000 = tmImage2000.select('B1')
.projection().nominalScale()
 
print('TM Scale for Year 2000:', tmScale2000);


// Filter TM imagery by location, date and cloudiness for 2005.
var tmImage2005 = ee.Image(tm
.filterBounds(Map.getCenter())
.filterDate('2005-01-01','2005-12-31')
.sort('CLOUD_COVER')
.first());


// Display the TM image as a Falsecolor composite.
Map.addLayer(tmImage2005, {bands: ['B4', 'B3', 'B2'], min: 0, max: 0.4}
, 'TM for Year 2005');

//Get the scale of the TM data from its projection:
var tmScale2005 = tmImage2005.select('B1')
.projection().nominalScale()
 
print('TM Scale for Year 2005:', tmScale2005);
 
// Filter TM imagery by location, date and cloudiness for 2010.
var tmImage2010 = ee.Image(tm
.filterBounds(Map.getCenter())
.filterDate('2010-01-01','2010-12-31')
.sort('CLOUD_COVER')
.first());


// Display the TM image as a Falsecolor composite.
Map.addLayer(tmImage2010, {bands: ['B4', 'B3', 'B2'], min: 0, max: 0.4}
, 'TM for Year 2010');

//Get the scale of the TM data from its projection:
var tmScale2010 = tmImage2010.select('B1')
.projection().nominalScale()
 
print('TM Scale for Year 2010:', tmScale2010);


// Filter TM imagery by location, date and cloudiness for 2015.
var tmImage2015 = ee.Image(landsat
.filterBounds(Map.getCenter())
.filterDate('2015-01-01', '2015-12-31')
.sort('CLOUD_COVER')
.first());

// Display the TM image as a Falsecolor composite.
Map.addLayer(tmImage2015, {bands: ['B4', 'B3', 'B2'], min: 0, max: 0.4}
, 'TM for Year 2015');

//Get the scale of the TM data from its projection:
var tmScale2015 = tmImage2015.select('B1')
.projection().nominalScale()
 
print('TM Scale for Year 2015:', tmScale2015);


//  ------------------------ // ------------------- // -----------------
// Starting the part of Temporal Resolution
//  ------------------------ // ------------------- // -----------------

// Filter the MODIS mosaics for 2000
var modisSeries2000 = landsat
.filterBounds(Map.getCenter()) // location of the point
.filterDate('2000-01-01','2000-12-31');
// Print the filtered MODIS ImageCollection.
print('MODIS series 2000:', modisSeries2000);

// Filter the MODIS mosaics for 2005
var modisSeries2005 = myd09
.filterBounds(Map.getCenter()) // location of the point
.filterDate('2005-01-01','2005-12-31');
// Print the filtered MODIS ImageCollection.
print('MODIS series 2005:', modisSeries2005);

// Filter the MODIS mosaics for 2010
var modisSeries2010 = myd09
.filterBounds(Map.getCenter()) // location of the point
.filterDate('2010-01-01','2010-12-31');
// Print the filtered MODIS ImageCollection.
print('MODIS series 2010:', modisSeries2010);

// Filter the MODIS mosaics for 2015
var modisSeries2015 = myd09
.filterBounds(Map.getCenter()) // location of the point
.filterDate('2015-01-01','2015-12-31');
// Print the filtered MODIS ImageCollection.
print('MODIS series 2015:', modisSeries2015);

// Filter to get a year's worth of TM scenes for 2000.
var tmSeries2000 = landsat
.filterBounds(Map.getCenter())
.filterDate('2000-01-01','2000-12-31');

// Print the filtered TM ImageCollection.
print('TM series for 2000:', tmSeries2000);

// Filter to get a year's worth of TM scenes for 2005.
var tmSeries2005 = tm
.filterBounds(Map.getCenter())
.filterDate('2005-01-01','2005-12-31');

// Print the filtered TM ImageCollection.
print('TM series for 2005:', tmSeries2005);

// Filter to get a year's worth of TM scenes for 2010.
var tmSeries2010 = tm
.filterBounds(Map.getCenter())
.filterDate('2010-01-01','2010-12-31');

// Print the filtered TM ImageCollection.
print('TM series for 2010:', tmSeries2010);

// Filter to get a year's worth of TM scenes for 2015.
var tmSeries2015 = landsat
.filterBounds(Map.getCenter())
.filterDate('2015-01-01','2015-12-31');

// Print the filtered TM ImageCollection.
print('TM series for 2015:', tmSeries2015);

//Project Topic:
// Hi David, I will be predicting the presence of Meadows
// using some of the classification alogorithms such as
// SVM, Logistic Regression ect
