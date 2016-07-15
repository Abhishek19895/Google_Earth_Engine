//  ------------------------ // ------------------- // -----------------
// Author : Abhishek Singh
// USF-ID : 20363537
// Project Submission

//  ------------------------ // ------------------- // -----------------
// Title: "Evolution of Meadows in Lower Mekong Region (Pataya)
// for Identifying Vegetation". Here are the steps for the same:
// Step 1: Select the region of interests from landsat 7 raw data
// Step 2: Select the regions of Meadows & bare lands
// Step 3: Add a Tasseled cap image
// Step 4: Build a classifier (70% Train & 30% Test) & compute accuracies
// Step 5: Summarize the findings
//  ------------------------ // ------------------- // -----------------

// Region: Pataya region, Thailand (Lower Mekong)
//  ------------------------ // ------------------- // -----------------

// Lets get started with the JS code : 15 years of Lower Mekong
//  ------------------------ // ------------------- // -----------------

// Region of interest: South of Vietnam
var focusarea = ee.Geometry.Rectangle(101.10, 12.90, 100.85, 13.28);

// Display the image with the default visualization.  
Map.centerObject(focusarea, 10);

// Create an Array of Tasseled Cap coefficients.
var coefficients = ee.Array([ // From the notes
  [0.3037, 0.2793, 0.4743, 0.5585, 0.5082, 0.1863],
  [-0.2848, -0.2435, -0.5436, 0.7243, 0.0840, -0.1800],
  [0.1509, 0.1973, 0.3279, 0.3406, -0.7112, -0.4572],
  [-0.8242, 0.0849, 0.4392, -0.0580, 0.2012, -0.2768],
  [-0.3280, 0.0549, 0.1075, 0.1855, -0.4357, 0.8085],
  [0.1084, -0.9022, 0.4120, 0.0573, -0.0251, 0.0238]
]);

// Select TC bands
  var predictionBands=['brightness', 'greenness', 'wetness', 'fourth', 'fifth', 'sixth'];

// Making a dataset for model building & testing
var trainingFeatures = bare.merge(meadow).merge(wetland);
  
function classification_algorithm(year, max_range){
  // Filter image
  var image = ee.Algorithms.Landsat.simpleComposite({
      collection: l7raw
      .filterDate(year+'-01-01', year+'-12-31')
      .filterBounds(focusarea),
    asFloat: true
  });
  
  // Clipping the image
  var image_clipped = image.clip(focusarea);
  
  // Defining a False color composite
  var falseColor = {bands: ['B5', 'B4', 'B2'], min: 0.1
  , max: 0.1*max_range, gamma: 1};

  // Adding the False composite Layer for the year
  Map.addLayer(image_clipped, falseColor, 'ORIGINAL_FALSECOLOR for '+year);
  
  // Select the bands of interest.
  var image_2 = image_clipped.select(['B1', 'B2', 'B3', 'B4', 'B5', 'B7']);
  
  // Make an Array Image, with a 1-D Array per pixel.
  var array_Image1D = image_2.toArray();
  
  // Make an Array Image with a 2-D Array per pixel, 6x1.
  var array_Image2D = array_Image1D.toArray(1);
  
  // Segregating elements
  var array1D = ee.Array([1, 2, 3]);             
  var array2D = ee.Array.cat([array1D], 1);     
  
  // Do a matrix multiplication
  var image_3 = ee.Image(coefficients)
    .matrixMultiply(array_Image2D)
    .arrayProject([0])
    .arrayFlatten(
      [['brightness', 'greenness', 'wetness', 'fourth', 'fifth', 'sixth']]);
  
  // Display the first three bands of the result and the input imagery.
  var viz_Params = {
    bands: ['brightness', 'greenness', 'wetness'],
    min: -0.3, max: 0.1*max_range
  };

  // Add layer with TC image
  Map.addLayer(image_3, viz_Params, 'TC_IMAGE '+year);

  // Building the classification set
  var classifierTraining = image_3.select(predictionBands)
    .sampleRegions({
      collection: trainingFeatures,
      properties: ['class'],
      scale:30
    });
  
  // Using the CART technique for classification
  var classifier = ee.Classifier.cart().train({
  features:classifierTraining,
  classProperty:'class',
  inputProperties:predictionBands});
  
  // Classify the image
  var classified = image_3.select(predictionBands).classify(classifier); 
  
  // Add layer with classification
  Map.addLayer(classified, {min:0,max:max_range
  ,palette:['#811111','#B5E0EE', '#104B11']},'CLASSIFIED '+year);

  // Sampling the data
  var trainingTesting = classifierTraining.randomColumn(); 
  // 70% training set
  var trainingSet = trainingTesting.filter(ee.Filter.lessThan('random',0.7)); 
  // 30% test set
  var testingSet = trainingTesting.filter(ee.Filter.greaterThanOrEquals('random',0.7));
  // Training a CART Classifier
  var trained = ee.Classifier.cart().train({
   features:trainingSet, 
   classProperty:'class', 
   inputProperties:predictionBands
  });
  
  // Computing a Confusion Matrix
  var confusionMatrix = ee.ConfusionMatrix(testingSet
  .classify(trained).errorMatrix({
  actual:'class',
  predicted:'classification'
  }));
  
  // Printing the results
  print('OverallAccuracy for '+year,confusionMatrix.accuracy()); 
  print('ProducersAccuracy for '+year,confusionMatrix.producersAccuracy()); 
  print('ConsumersAccuracy for '+year,confusionMatrix.consumersAccuracy());
}

// Classification Accuracy for any year in & including: [2001,  2015]
// function Input: (Any Year, Template range [1, 10])
classification_algorithm(2001, 2);
//classification_algorithm(2004,  3);
classification_algorithm(2007, 4);
//classification_algorithm(2010, 5);
classification_algorithm(2015, 6);
// We could run this algorithm for any years between 2001 & 2016

// Results
print("Overall Accuracy increased marginally between 2001 & 2015 for meadows")

// I read the research paper on the link for this project 
// "http://remotesensing.montana.edu/documents/baker_et_al_2007.pdf"
// I ended up not fully utilizing their formulas, as I could arrive 
// at a much nicer way to come to a conclusion. Some other things I tried
// but they didn't work for this project are:
// 1) HSV tranform