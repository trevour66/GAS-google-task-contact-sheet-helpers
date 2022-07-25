function doPost(e) {
  const body = JSON.parse(e.postData.contents)

  const output = {
    message: "",
    status: "",
  }

  try{
    let data = {
      First_Name: body['First_Name'],
      way_call_time: body['way_call_time'],
      date: body['date']
    }

    let emailSubject = 'New call time for Introduction to income opportunities'
    let emailBody = `
      Hi {{First_Name}},
      
      I have rescheduled our call to {{way_call_time}} on {{date}}. 
      Excited to chat then!
    `
    let receiver = body['receiver']
  
    emailBody = fillInTemplateFromObject_(emailBody, data)    
    
    GmailApp.sendEmail(receiver,emailSubject, emailBody)
    
    output.message = "Mail sent successfully"
    output.status = "success"

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

function fillInTemplateFromObject_(template, data) {
  // We have two templates one for plain text and the html body
  // Stringifing the object means we can do a global replace
  let template_string = JSON.stringify(template);

  // Token replacement
  template_string = template_string.replace(/{{[^{}]+}}/g, key => {
    return escapeData_(data[key.replace(/[{}]+/g, "")] || "");
  });
  return  JSON.parse(template_string);
}

/**
 * Escape cell data to make JSON safe
 * @see https://stackoverflow.com/a/9204218/1027723
 * @param {string} str to escape JSON special characters from
 * @return {string} escaped string
*/
function escapeData_(str) {
  return str
    .replace(/[\\]/g, '\\\\')
    .replace(/[\"]/g, '\\\"')
    .replace(/[\/]/g, '\\/')
    .replace(/[\b]/g, '\\b')
    .replace(/[\f]/g, '\\f')
    .replace(/[\n]/g, '\\n')
    .replace(/[\r]/g, '\\r')
    .replace(/[\t]/g, '\\t');
};

