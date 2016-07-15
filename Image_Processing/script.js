//  ------------------------ // ------------------- // -----------------
//Author : Abhishek Singh
//USF-ID : 20363537
//Lab 3 Submission
//Digital Image Processing 
//Drawing a Linear Filter, Non-Linear Filter, Textual Layer for a Mekong region

//  ------------------------ // ------------------- // -----------------
// Adding the Linear Layer
//  ------------------------ // ------------------- // -----------------

// Get a single landsat image over the area of interest.
var image = ee.Image(landsat
.filterBounds(mypoint)
.filterDate('2001-01-01', '2010-12-31')
.sort('CLOUD_COVER')
.first());
 
// Print the image to the console.
print('Inspect the image object in Bangkok:', image);

// Display the image with the default visualization.  
Map.centerObject(mypoint, 7);

// Adding a composite layer 
Map.addLayer(image, {}, 'Original image for 2015');

// Display the projection of band 0
print('Inspect the projection of band 0:', image.select(0).projection());

// Display gamma stretches of the input image.
Map.addLayer(image.visualize({gamma: 1.5}), {}, 'gamma = 1.5');

// Print a uniform kernel to see its weights.
print('A uniform kernel:', ee.Kernel.square(2));

// Define a square, uniform kernel.
var uniformKernel = ee.Kernel.square({
radius: 2,
units: 'meters',
});

// Filter the image by convolving with the smoothing filter.
var smoothed = image.convolve(uniformKernel);
Map.addLayer(smoothed, {min: 0, max: 255}, 'smoothed image');  
  
print('A Gaussian kernel:', ee.Kernel.gaussian(2));
// Define a square Gaussian kernel:
var gaussianKernel = ee.Kernel.gaussian({
radius: 2,
units: 'meters',
});

// Filter the image by convolving with the Gaussian filter.
var gaussian = image.convolve(gaussianKernel);
Map.addLayer(gaussian, {min: 0, max: 255}, 'Gaussian smoothed image');

var laplacianKernel = ee.Kernel.laplacian8();
// Print the kernel to see its weights.
print('A Laplacian kernel:',laplacianKernel);

// Filter the image by convolving with the Laplacian filter.
var edges = image.convolve(laplacianKernel)
.reproject('EPSG:32647', null, 1);

// Adding a map layer
Map.addLayer(edges, {min: 0, max: 127}, 'Laplacian filtered image');
 

var xyGrad = image.gradient();
// Compute the magnitude of the gradient.
var gradient = xyGrad.select('x').pow(2)
.add(xyGrad.select('y').pow(2)).sqrt()
.reproject('EPSG:32647', null, 1);

// Compute the direction of the gradient.
var direction = xyGrad.select('y').atan2(xyGrad.select('x'))
.reproject('EPSG:32647', null, 1);

// Display the results.
Map.setCenter(100.50, 13.70, 10);
Map.addLayer(direction, {min: -3, max: 3, format: 'png'}, 'direction');
Map.addLayer(gradient, {min: -10, max: 50, format: 'png'}, 'gradient');

// Doing Image Sharpening: Define a "fat" Gaussian kernel.
 var fat = ee.Kernel.gaussian({
 radius: 3,
 sigma: 3,
 magnitude: -1,
 units: 'meters'
 });
 // Define a "skinny" Gaussian kernel.
 var skinny = ee.Kernel.gaussian({
 radius: 3,
 sigma: 0.5,
 units: 'meters'
 });
 // Compute a difference-of-Gaussians (DOG) kernel.
 var dog = fat.add(skinny);
 // Add the DoG filtered image to the original image.
 var sharpened = image.add(image.convolve(dog));
 Map.addLayer(sharpened, {min: 0, max: 255}, 'Edges enhanced')

// The Linear layer would help me with image sharpening, edge detection
//and creating gradients in my image

//  ------------------------ // ------------------- // -----------------
// Adding the Non-Linear Layer
//  ------------------------ // ------------------- // -----------------

// Computng Medians
var median = image.reduceNeighborhood({
reducer: ee.Reducer.median(),
kernel: uniformKernel
});

Map.addLayer(median, {min: 0, max: 255}, 'Median');

// Computing Mode filtering
// Create and display a simple two-class image.
var veg = image.select("B5").gt(150);
// Display the two-class (binary) result.
var binaryVis = {min: 0, max: 1, palette: ['black', 'green']};
Map.addLayer(veg, binaryVis, 'veg'); 

// Compute the mode in each 5x5 neighborhood and display the result.
var mode = veg.reduceNeighborhood({
reducer: ee.Reducer.mode(),
kernel: uniformKernel
});  
 
Map.addLayer(mode, binaryVis, 'mode'); 

// The Non Linear layer would help get rid of all the noise fromy image
// this shall give me images with higher clarity so as to enhance the focus 
// on the theme for the viewer.

//  ------------------------ // ------------------- // -----------------
// Adding the Textual Layer
//  ------------------------ // ------------------- // -----------------

// Define a big neighborhood with a 7-meter radius kernel.
var bigKernel = ee.Kernel.square({
radius: 7,
units: 'meters'
});

// Compute SD in a neighborhood.
var sd = image.reduceNeighborhood({
reducer: ee.Reducer.stdDev(),
kernel: bigKernel
});

Map.addLayer(sd, {min: 0, max: 70}, 'SD');

// Compute entropy in a neighborhood.
var entropy = image.entropy(bigKernel);
Map.addLayer(entropy, {min: 1, max: 5}, 'entropy');

// Use the GLCM to compute a large number of texture measures.
var glcmTexture = image.glcmTexture(7);
// Display the 'contrast' results for the red, green and blue bands.
var contrastVis = {
bands: ['B1_asm', 'B1_contrast', 'B1_corr'],
min: 40,
max: 2000
};

Map.addLayer(glcmTexture, contrastVis, 'GLCM contrast');

// Computing Spatial Statistics 
// Create a list of weights for a 9x9 kernel.
var list = [1, 1, 1, 1, 1, 1, 1, 1, 1];
// The center of the kernel is zero.
var centerList = [1, 1, 1, 1, 0, 1, 1, 1, 1];
// Assemble a list of lists: the 9x9 kernel weights as a 2-D matrix.
var lists = [list, list, list, list, centerList, list, list, list, list];
// Create the kernel from the weights.
// Non-zero weights represent the spatial neighborhood.
var kernel = ee.Kernel.fixed(9, 9, lists, -4, -4, false);
// Use the max among bands as the input.
var maxBands = image.reduce(ee.Reducer.max());
// Convert the neighborhood into multiple bands.
var neighs = maxBands.neighborhoodToBands(kernel);
// Compute local Geary's C, a measure of spatial association.
var gearys = maxBands.subtract(neighs).pow(2).reduce(ee.Reducer.sum())
.divide(Math.pow(9, 2));
Map.addLayer(gearys, {min: 20, max: 2500}, "Geary's C");

// I am still not sure of employing Textual layers to my project.
// Possible benefits would be to get spatial statistics & Entropy