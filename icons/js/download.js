// Automatically download [Material](https://material.io/tools/icons) icons.
module.exports = function() {
  
  // Load utilities.
  const download = require('download');
  const fs = require('fs');
  const tmp = require('tmp');
  const request = require('request');
  const path = require('path');
  const parser = require('xmldom').DOMParser;
  const fontBlast = require('font-blast');
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
  
  // Report that downloads have started.
  console.log('Downloading icons...\n');
  
  // Download multiple icon sets.
  _.forEach(icons, (iconset) => { 
    
    // Report the name of the icon set that's being downloaded.
    console.log(`Retrieving ${_.capitalize(iconset.name)} icons...\n`);
    
    // Capture icon prefix/suffix to remove.
    const regex = {
      prefix: new RegExp(`^${iconset.prefix}`),
      suffix: new RegExp(`${iconset.suffix}$`)
    };
    
    // Download icons as individual files.
    if( iconset.icons ) {
      
      // Reports additional data about the icon set.
      console.log(`Found ${iconset.icons.length} available icons in the set`);
      console.log(`Generating SVG content for each icon...`);
      
      // Initialize downloads.
      const downloads = [];
      
      // Download all icons.
      _.forEach(iconset.icons, (icon) => {
        
        // Capture the promise.
        downloads.push(

          // Download the icon.
          download(_.replace(iconset.src, ':icon', icon))

          // Handle successful downloads.
          .then((data) => {

            // Create an easy-to-use icon name.
            const name = iconset.name + '-' + icon.replace(regex.prefix, '').replace(regex.suffix, '');

            // Save the file.
            fs.writeFileSync(`${dest}/${name}.svg`, data);

            // Tally success.
            count.success++;

          })

          // Otherwise, handle errors.
          .catch((e) => { 

            // Capture the name of the icon that could not be downloaded.
            errors.push(icon);

            // Tally error.
            count.error++;

          })
          
        );

      });
      
      // Report pending. downloads.
      console.log(`Saving ${downloads.length} files to ${path.resolve(dest)}\n`);
      
      // Wait for all downloads to finish.
      promises.push(Promise.all(downloads));
      
    }
    
    // Otherwise, convert an icon font into individual icon files.
    else { 
      
      // Save the promise.
      promises.push(
        
        // Initialize a new promise.
        new Promise((resolve, reject) => {
      
          // Read the remote font file.
          request.get({
            url: iconset.src,
            gzip: true
          }, async (err, response, body) => { 

            // Handle errors.
            if( err ) {

              // Capture the error.
              errors.push(iconset.name);

              // Tally error.
              count.error++;
              
              // Reject.
              reject();

            }

            // Otherwise, convert the icon font.
            else { 

              // Convert the font to a DOM object.
              const font = new parser().parseFromString(body.replace(/&#x(.*?);/g, '$1'), 'image/svg+xml').documentElement;

              // Get data about each icon within the font.
              const icons = Array.from(font.getElementsByTagName('glyph')).reduce((object, glyph) => {
                
                const code = glyph.getAttribute('unicode').replace('&#x', ''); 
                const name = glyph.getAttribute('glyph-name');

                object[code] = iconset.name + '-' + name;

                return object;

              }, {});
              
              // Create a temporary file to save the font.
              const svg = tmp.tmpNameSync();
              
              // Save the font temporarily.
              fs.writeFileSync(svg, body);

              // Extract all icons from the font.
              await fontBlast(svg, path.dirname(dest), {
                filenames: icons
              });

              // Tally success.
              count.success += Object.values(icons).length;

              // Clean up the temporary file.
              fs.unlinkSync(svg);
              
              // Resolve.
              resolve();

            }
            
          })
          
        })
        
      );
      
    }
    
  });
  
  // Wait for downloads to finish.
  Promise.all(promises).then(() => {
    
    // Identifies possible extraneous files.
    const extraneous = [
      path.join(path.dirname(dest), 'verify.html'),
      path.join(path.dirname(dest), 'source-font.ttf')
    ];
    
    // Remove any extraneous files.
    extraneous.forEach((extra) => {
      
      // Delete the file if it exists.
      if( fs.existsSync(extra) ) fs.unlinkSync(extra);
      
    });
  
    // Get total count.
    count.sum = count.success + count.error;

    // Report status.
    console.log(`\nDownloaded ${count.success} / ${count.sum} icons successfully.`);
    
    // Report errors if any exist.
    if( count.error > 0 ) {
      
      // Report errors.
      console.log(
        `\nCould not download ${count.error} icon(s):\n` + 
        errors.map((e) => `- ${e}`).join('\n')
      );
      
    }
    
    // Output whitespace for clarity.
    console.log('\n');
    
  });
  
};