$(function(){
  function createUrlFromParameter(){
    var platformId = getPlatformId();
    if(platformId != false){
      return 'http://server:port/' + platformId;
    }
    else{
      return 'http://server:port/?platform=38761';
    }
  }

  function updateTimetable(dataUrl){
    downloadBusXmlFromUrl(dataUrl, function(parsed){
      if(parsed[0] == undefined){
        updatePlatformName("Invalid Bus Stop");
      }
      else{
        updatePlatformName(parsed[0]);
        parsed = removePlatformNameFromParsedRoutes(parsed);
        var sortedRoutes = sortBusRoutes(parsed);
        displayBusRoutes(sortedRoutes, 10);
        showTimetable();
      }
    });
  }

  function init(){
    hideTimetable();
    var dataUrl = createUrlFromParameter();
    updateTimetable(dataUrl);
  }

  init();
});
