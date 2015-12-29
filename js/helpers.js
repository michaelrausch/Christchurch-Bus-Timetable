//Returns the value of a parameter, if not specified returns false
function getURLParameter(parameter){
  var pageUrl = window.location.search.substring(1);
  var urlVariables = pageUrl.split('&');

  for (var i = 0; i < urlVariables.length; i++) {
    var parameterFromUrl = urlVariables[i].split('=');
    if(parameterFromUrl[0] == parameter){
      //Parameter was found, return value
      return parameterFromUrl[1];
    }
  }
  //Parameter was not specified
  return false;
}

//Returns the platform ID if it has been specified, false if it wasn't
function getPlatformId(){
  return getURLParameter('platform');
}

//Returns true if the platform has been specified, false if not
function checkPlatformIdExists(){
  if(getURLParameter('platform') == false){
    return false;
  }
  return true;
}

function getPlatformName(xml){
  return $(xml).find('Platform').attr('Name');
}

function getRoutes(xml){
  return $(xml).find('Route');
}

function getRouteDestinationName(routeXml){
  return $(routeXml).find('Destination').attr('Name');
}

function getRouteNumber(routeXml){
  return $(routeXml).attr('RouteNo');
}

function getEtaArray(routeXml){
  var trips = $(routeXml).find('Trip');
  var etaArray = [];

  for (var i = 0; i < trips.length; i++) {
    var eta = $(trips[i]).attr('ETA');
    etaArray.push(eta);
  }
  return etaArray;
}

function combineRouteInfo(destination, routeNumber, etaArray){
  var routeInfoArray = []

  for (var i = 0; i < etaArray.length; i++) {
    var routeObject = {};
    routeObject.destination = destination;
    routeObject.routeNumber = routeNumber;
    routeObject.eta = etaArray[i];
    routeInfoArray.push(routeObject);
  }
  return routeInfoArray;
}

//Downloads XML
function downloadFromUrl(url, type, success, error, callback){
  $.ajax({
    url: url,
    datatype: type,
    success: function(data){
      var parsed = parseXmlForBusTimetable(data);
      callback(parsed);
    },
    error: error
  });
}

function downloadBusXmlFromUrl(url, callback){
  downloadFromUrl(url, 'xml', parseXmlForBusTimetable, handleXmlDownloadError, callback);
}

function parseXmlForBusTimetable(xml){
  var platformName = getPlatformName(xml);
  var routes = getRoutes(xml);
  var routesToDisplay = [platformName];

  for (var i = 0; i < routes.length; i++) {
    var route = routes[i];
    var routeNumber = getRouteNumber(route);
    var destination = getRouteDestinationName(route);
    var etas = getEtaArray(route);
    var displayRoute = combineRouteInfo(destination, routeNumber, etas);
    routesToDisplay.push(displayRoute);
  }
  return routesToDisplay;
}

function removePlatformNameFromParsedRoutes(parsedRoutes){
  return parsedRoutes.splice(1);
}

function cleanBusRoutes(parsedRoutes){
  var cleanedBusRoutes = [];
  for (var i = 0; i < parsedRoutes.length; i++) {
    var secondaryBusses = parsedRoutes[i];
    for (var j = 0; j < secondaryBusses.length; j++) {
      cleanedBusRoutes.push(secondaryBusses[j]);
    }
  }
  return cleanedBusRoutes;
}

function compareEtas(route1, route2){
  var eta1 = parseInt(route1.eta);
  var eta2 = parseInt(route2.eta);

  if(eta1 < eta2){
    return -1;
  }
  else if(eta1 > eta2){
    return 1;
  }
  else{
    return 0;
  }
}

function sortBusRoutes(parsedRoutes){
  var cleanedBusRoutes = cleanBusRoutes(parsedRoutes);
  console.log(cleanedBusRoutes);
  cleanedBusRoutes.sort(compareEtas);

  return cleanedBusRoutes;
}

function displayBusRoutes(sortedRoutes, max){
  removeAllBusses();

  if(sortedRoutes.length >= max){
    var maxDisplay = max;
  }
  else{
    var maxDisplay = sortedRoutes.length;
  }

  for (var i = 0; i < maxDisplay ; i++) {
    appendNewBus(sortedRoutes[i].routeNumber, sortedRoutes[i].destination, sortedRoutes[i].eta);
  }
}

function handleXmlDownloadError(){
  console.log("Something Went Wrong :(");
  updatePlatformName("Something went wrong :(");
  hideTimetable();
}

function updatePlatformName(platformName){
  $('.platform-name').html(platformName);
}

function appendNewBus(route, destination, eta){
  $('.bus-timetable table tbody').append('<tr><td>' + route + '</td><td>' + destination + '</td><td>' + eta + '</td></tr>')
}

function removeAllBusses(){
  $('.bus-timetable table tbody').html('');
}

function hideTimetable(){
  $('.bus-timetable').hide();
}

function showTimetable(){
  $('.bus-timetable').show();
}
