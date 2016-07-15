//  ------------------------ // ------------------- // -----------------
//Author : Abhishek Singh
//USF-ID : 20363537
//Lab 1 Submission
//False color composite format of 'Mumbai' for 1989 and 2015. 
//The reflectance vs wavelength for both years are also plotted.

//  ------------------------ // ------------------- // -----------------
// Lets get started with the JS code
//  ------------------------ // ------------------- // -----------------

// Display the image with the default visualization.  
Map.centerObject(point, 8);

// Getting the cloud free image out for 2015
 var image5 = ee.Image(landsat5
 .filterDate('1989-01-01', '1989-12-31')
 .filterBounds(point) // location of the point
 .sort('CLOUD_COVER')
 .first());
  //printing the images
 print('A Landsat scene for 1989', image5);
 
 //Adding color bands to the image
 var falseColor = {
 bands: ['B3', 'B2', 'B1'],
 min: 0,
 max: 100
 };
// False color Template
 Map.addLayer(image5, falseColor, 'False-color image for 1989 Mumbai'); 
 
// Getting the cloud free image out for 2015
 var image = ee.Image(landsat
 .filterDate('2015-01-01', '2015-12-31')
 .filterBounds(point) // location of the point
 .sort('CLOUD_COVER')
 .first());
  //printing the images
 print('A Landsat scene for 2015', image);
 
 //Adding color bands to the image
 //False color template
 var falseColor = {
 bands: ['B5', 'B4', 'B3'],
 min: 4000,
 max: 13000
 };
// False color Template
 Map.addLayer(image, falseColor, 'False-color image for 2015 Mumbai'); 

 
 //Using the below bands
 var bands = ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B10', 'B11'];

 
 
 // Addding Top of Atmosphere for 2015 : Mumbai
 var toaImage = ee.Image('LANDSAT/LC8_L1T_TOA/LC81480472013323LGN00');
  // Hardcode a point in Shivaji Park.
 var sgPark = sgpark;
  // define Reflective bands
 var reflectiveBands = bands.slice(0, 7);
 // See All the Wavelengths
 var wavelengths = [0.44, 0.48, 0.56, 0.65, 0.86, 1.61, 2.2];
 // Select only the reflectance bands of interest.  
 var reflectanceImage = toaImage.select(reflectiveBands);
 // Define an object of customization parameters for the chart.
 var options = {
  title: 'Landsat 8 TOA spectrum in Mumbai in 2015',
  hAxis: {title: 'Wavelength (micrometers)'},
  vAxis: {title: 'Reflectance'},
  lineWidth: 1,
  pointSize: 4
};
// Make the chart, using a 30 meter pixel.
 var chart = Chart.image.regions(
 reflectanceImage, sgPark, null, 30, null, wavelengths)
 .setOptions(options);
 // Display the chart.
 print(chart);
 
 
 
  // Addding Top of Atmosphere for 1989 : Mumbai
 var toaImage5 = ee.Image('LANDSAT/LT5_L1T_TOA/LT51480471989305ISP00');
 // Select only the reflectance bands of interest.  
 var reflectanceImage = toaImage5.select(reflectiveBands);
 // Define an object of customization parameters for the chart.
 var options = {
  title: 'Landsat 5 TOA spectrum in Mumbai in 1989',
  hAxis: {title: 'Wavelength (micrometers)'},
  vAxis: {title: 'Reflectance'},
  lineWidth: 1,
  pointSize: 4
};
// Make the chart, using a 30 meter pixel.
 var chart = Chart.image.regions(
 reflectanceImage, sgPark, null, 30, null, wavelengths)
 .setOptions(options);
 // Display the chart.
 print(chart);


