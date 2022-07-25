function doPost(e) {
  const body = JSON.parse(e.postData.contents)
  const output = {
      message: "",
      status: "",
  }

  try{
    // Call function that creates the require filter
    if(createFilter(body.prospect_email, body.label_id)){
      output.message = "Filter added successfully"
      output.status = "success"
    }else {
      output.message = "Filter not added"
      output.status = "failed"
    }

    // Send out response
    return ContentService.createTextOutput(JSON.stringify(output))
      .setMimeType(ContentService.MimeType.JSON);
  }catch(error){
    output.message = error.message
    output.status = "error"

    // Send out response
    return ContentService.createTextOutput(JSON.stringify(output))
      .setMimeType(ContentService.MimeType.JSON);
  }
}


function createFilter(prospect_email, label_id ){
  let userId = Session.getEffectiveUser().getEmail(),
      filter_content_one = {
          criteria: {
              from: prospect_email,
          },
          action: {
              addLabelIds: [label_id],
              removeLabelIds: ['INBOX']
          }
      }
      filter_content_two = {
          criteria: {
              to: prospect_email
          },
          action: {
              addLabelIds: [label_id],
              removeLabelIds: ['INBOX']
          }
      }
  if(Gmail.Users.Settings.Filters.create(filter_content_one, userId) && Gmail.Users.Settings.Filters.create(filter_content_two, userId)){
    return true
  }else{
    return false
  }
}

// Unused function
function listLabels() {
  try {
    // Gmail.Users.Labels.list() API returns the list of all Labels in user's mailbox
    const response = Gmail.Users.Labels.list('me');
    if (!response || response.labels.length === 0) {
      // No labels are returned from the response
      return false;
    }

    // Print the Labels that are available.
    Logger.log('Labels:');
    for (const label of response.labels ) {
      Logger.log('- %s', label.name);
      Logger.log('- %s', label.id);
    }
  } catch (err) {
    //  Handle exception on Labels.list() API
    // Dev: Logger.log('Labels.list() API failed with error %s', err.toString());

    return false
  }
}
