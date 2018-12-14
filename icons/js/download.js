// Automatically download [Material](https://material.io/tools/icons) icons.
module.exports = function() {
  
  // Load utilities.
  const download = require('download');
  const fs = require('fs');
  const _ = require('lodash');

  // Get icon data.
  const icons = require('../icons.json');

  // Set destination folder for icons.
  const dest = 'icons/svg/';

  // Initialize counters.
  let count = {
    success: 0,
    error: 0
  };

  // Initialize promises.
  let promises = [];
  
  // Initialize an error log.
  let errors = [];
  
  // Download all icons.
  _.forEach(icons.icons, (icon) => {
    
    // Save the promise.
    promises.push(
      
      // Download the icon.
      download(_.replace(icons.src, ':icon', icon))
    
      // Handle successful downloads.
      .then((data) => {
        
        // Save the file.
        fs.writeFileSync(`${dest}/${icon}.svg`, data);
        
        // Tally success.
        count.success++
        
      })
            
      // Otherwise, handle errors.
      .catch(() => {
        
        // Capture the name of the icon that could not be downloaded.
        errors.push(icon);
        
        // Tally error.
        count.error++;
        
      })
      
    );

  });
  
  // Report that downloads have started.
  console.log('Downloading icons...');
  
  // Wait for downloads to finish.
  Promise.all(promises).then(() => {
  
    // Get total count.
    count.sum = count.success + count.error;

    // Report status.
    console.log(`\nDownloaded ${count.success} / ${count.sum} icons successfully.`);
    
    // Report errors if any exist.
    if( count.errors > 0 ) {
      
      // Report errors.
      console.log(
        ` Could not download ${count.error} icon(s):\n` + 
        errors.map((e) => `- ${e}`).join('\n')
      );
      
    }
    
    // Output whitespace for clarity.
    console.log('\n');
    
  });
  
};