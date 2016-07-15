//  ------------------------ // ------------------- // -----------------
// Author : Abhishek Singh
// USF-ID : 20363537
// Lab 5 Submission
// Implementing Classification in Lower Mekong Region (Bangkok)
// for Identifying Vegetation. 

//  ------------------------ // ------------------- // -----------------
// Lets get started with the JS code : Classification
//  ------------------------ // ------------------- // -----------------

// Display the image with the default visualization.  
Map.centerObject(mypoint, 6);

// Importing the mod44 dataset
var tree = ee.Image(mod44b.sort('system:time_start',false)
  .first());
  
// Replacing water from 200 to 0
var percentTree = tree.select('Percent_Tree_Cover')
  .where(tree.select('Percent_Tree_Cover')
  .eq(200),0);

// Adding a layer to this
// Map.addLayer(percentTree,{max:100},'percent tree cover')

var l5filtered = l5raw.filterDate('2010-01-01','2010-12-31')
  .filterBounds(mypoint);
  
// Package for classification
var landsat = ee.Algorithms.Landsat.simpleComposite(
  {collection : l5filtered, asFloat : true});

Map.addLayer(landsat,{bands:['B4','B3','B2'],max:0.3},'composite');

// Defining Prediction bands
var predictionBands = ['B1','B2','B3','B4','B5','B6','B7'];

// Making a Training set
var trainingFeatures = bare.merge(vegetation).merge(water);

var classifierTraining = landsat.select(predictionBands)
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
var classified = landsat.select(predictionBands).classify(classifier); 

// Sampling the data
var trainingTesting = classifierTraining.randomColumn(); 

// 40% training set
var trainingSet = trainingTesting.filter(ee.Filter.lessThan('random',0.6)); 

// 40% test set
var testingSet = trainingTesting.filter(ee.Filter.greaterThanOrEquals('random',0.6));

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
print('Confusionmatrix:',confusionMatrix); 
print('OverallAccuracy:',confusionMatrix.accuracy()); 
print('ProducersAccuracy:',confusionMatrix.producersAccuracy()); 
print('ConsumersAccuracy:',confusionMatrix.consumersAccuracy());