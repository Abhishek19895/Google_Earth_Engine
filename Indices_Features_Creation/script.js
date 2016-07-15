//  ------------------------ // ------------------- // -----------------
//Author : Abhishek Singh
//USF-ID : 20363537
//Lab 4 Submission
//Implementing PCA & Spectral Unmixing to a Lower Mekong Region
// Since my project is on Meadow Detection, I shall only be using the Vegetation 
// & Wetness Indices for this lab. This is is useful for my project as 
// I shall be performing classification and these indices would be my 
// features, so as to obtain higher accuracy. More & more indices will lead to higher 
// aacuracy. Then in the end we do PCA, do reduce number of features to select
// the important features. This helps us eliminate over fitting for the classification 
// challenge in project

//  ------------------------ // ------------------- // -----------------
// Lets get started with the JS code
//  ------------------------ // ------------------- // -----------------

// Getting the cloud free image out for 2015 for a Lower Mekong Region
var image = ee.Image(landsat8 
.filterBounds(mypoint)
.filterDate('2015-01-01','2015-12-31')
.sort('CLOUD_COVER')
.first());

// Display the image with the default visualization.  
Map.centerObject(mypoint, 7);

// Creating a True color Composite
var trueColor = {bands:['B4','B3','B2'],min:0,max:0.5}; 
Map.addLayer(image, trueColor,'True Color image');

// Computing NDVI 
var ndvi = image.normalizedDifference(['B5','B4']);
// Displaying the NDVI image with a color palette 
var vegPalette = ['red','blue','yellow','green']; 
Map.addLayer(ndvi, {min : 1, max:1, palette : vegPalette},'NDVI Layer');


// Computing EVI
var evi = image.expression('2.5 * ((NIR - ­RED) / (NIR + 6 * RED - ­7.5 * BLUE + 1))',{
'NIR' : image.select('B5'), 
'RED' : image.select('B4'), 
'BLUE' : image.select('B2')});
// Adding the EVI Layer
Map.addLayer(evi, {min : -1, max : 1, palette : vegPalette},'EVI Layer');


// Computing a Wetness Indice NDWI
var ndwi = image.normalizedDifference(['B5','B6']);
// Adding the NDWI Layer
var waterPalette = ['red','yellow','green','blue'];
Map.addLayer(ndwi , {min : -1, max : 1, palette : waterPalette},'NDWI Layer');


// Computing a Wetness Indice NDWBI
var ndwbi = image.normalizedDifference(['B3','B5']); 
// Adding the NDWBI Layer
Map.addLayer(ndwbi, {min : 0.99, max : 0.5, palette : waterPalette},'NDWBI Layer');


// Doing a Linear Transform on the image : Principal Compoenent Analysis (PCA)
var bands = ['B2','B3','B4','B5','B6','B7','B10','B11'];
var arrayImage = image.select(bands).toArray();

// Co-variance matrix
var covar = arrayImage.reduceRegion({ 
  reducer:ee.Reducer.covariance(), 
  maxPixels:1e9
});

// Generating an Array from the above matrix
var covarArray = ee.Array(covar.get('array'));
// Computing Eigen values 
var eigens=covarArray.eigen();
// Computing Eigen vectors 
var eigenVectors = eigens.slice(1,1);
// Coputing Principal components
var principalComponents = ee.Image(eigenVectors)
.matrixMultiply(arrayImage.toArray(1));

var pcImage = principalComponents 
//Throw out an an un needed dimension,[[]]­>[].
.arrayProject([0]) 
// Make the one band array image a multi ­ban dimage,[ ] ­>image
.arrayFlatten([['pc1','pc2','pc3','pc4','pc5','pc6','pc7',
'pc8']]); Map.addLayer(pcImage.select('pc1'),{},'PC');
// Adding the first component of the PC layer
Map.addLayer(pcImage.select('pc1'),{},'PC 1 Layer');


// Doing Spectral Unmixing to identify the contribution of each element
var unmixImage = image.select(['B2','B3','B4','B5','B6','B7']);
// Adding a False layer
Map.addLayer(unmixImage,{bands:['B5','B4','B3'],max:0.4},'falsecolor composite');

// Printing the image
print(Chart.image.regions(unmixImage,ee.FeatureCollection([
ee.Feature(bare,{label:'bare'}), 
ee.Feature(water,{label:'water'}), 
ee.Feature(veg,{label:'vegetation'})]),
ee.Reducer.mean(),30,'label',[0.48,0.56,0.65,0.86,1.61,2.2]));

// Getting the means for the 3 points
var bareMean = unmixImage.reduceRegion(ee.Reducer.mean(),bare,30).values();
var waterMean = unmixImage.reduceRegion(ee.Reducer.mean(),water,30).values();
var vegMean = unmixImage.reduceRegion(ee.Reducer.mean(),veg,30).values();
// Array of end-members
var endmembers = ee.Array.cat([bareMean,vegMean,waterMean],1);
// Creating an array of images
var arrayImage = unmixImage.toArray().toArray(1);
// Solving to derive values
var unmixed = ee.Image(endmembers).matrixSolve(arrayImage);
// Converting a 2D Array image to a 
var unmixedImage = unmixed.arrayProject([0])
.arrayFlatten([['bare','veg','water']]);
// Adding the layer
Map.addLayer(unmixedImage,{},'Unmixed Layer');
