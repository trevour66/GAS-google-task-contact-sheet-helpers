function settings(){
  
  return {
    Master_ProspectNotesSheetId: 0,
    Master_ProspectNotesSheetremarkCol: 8,
    Template_ProspectNotesSheetId: 0,
    workingDriveId: "1aj76pzNHsNtFjS0HtkW2on4wzubGxSUG",
    templateId: "1gYapxriwLiw6Z0olrUq7h1PlQelAZQYunYKU5EggrAM",
  }
}

function entryPoint() {
  var spreadsheetID = settings().Master_ProspectNotesSheetId,
      remarkCol = settings().Master_ProspectNotesSheetremarkCol
    
  var sheet = getSheetById(spreadsheetID),
      sheet_lastRow = sheet.getLastRow(),
      sheet_lastCol = sheet.getLastColumn(),
      allDataInSpreadsheet = sheet.getSheetValues(1,1,sheet_lastRow,sheet_lastCol)
  

  // remove header
  allDataInSpreadsheet.shift()

  for(let x = 0 ; x < allDataInSpreadsheet.length; x++){
    var isProcessed = allDataInSpreadsheet[x][ remarkCol - 1 ]
    if( isProcessed !== "Processed" ){
      // Get range and pass it to traditional onedit func
      let row = x + 2,
          col = remarkCol
          range = sheet.getRange(row, col)
      onEditEntryPoint(false, range)
      
    }
    if(isProcessed == "Processed"){
      continue;
    }
  }
}

function onEditEntryPoint(e, range) {
  
  if(e){
    var range = e.range
  }else if(!e && range){
    var range
  }
  
  const editedData = {
    sheetID: String(range.getSheet().getSheetId()),
    row: range.getRow(),
    data: range.getValues(),
    sheet: null,
    range: range 
  }

  editedData.sheet = getSheetById(editedData.sheetID)

  // Create subsheet and copy values
  createNewFolderInGoogleDrive(editedData.sheet, editedData.row, editedData)  

  signal_successfull_processing(editedData.sheet, editedData.row, settings().Master_ProspectNotesSheetremarkCol)  
  
}

function createNewFolderInGoogleDrive(sheet, row, editedData) {
  var fileName = sheet.getRange(row, 1).getValue() + ' ' + sheet.getRange(row, 2).getValue();
 
  if(! typeof(folderName) == 'string'){
    return
  }

  var parentFolder = DriveApp.getFolderById(settings().workingDriveId);
  
  // check if folder already exist 
  if(parentFolder.getFilesByName(fileName).hasNext()){
    
    var file = parentFolder.getFilesByName(fileName).next(); // get folder

  }else{    
    
    var file = cloneGoogleSheet(fileName, settings().workingDriveId)
    
  }


  var prospectSheetURL = file.getUrl(); // URL of newly created Prospect Sheet

  var rowToCopy = editedData.sheet.getRange(editedData.range.getRow(), 1,1,editedData.sheet.getLastColumn()-1).getA1Notation()
  rowToCopy = editedData.sheet.getSheetName() + '!' + rowToCopy

  linkCells(SpreadsheetApp.getActiveSpreadsheet(), rowToCopy, prospectSheetURL, settings().Template_ProspectNotesSheetId)

  
}
