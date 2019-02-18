// Export `scripts` task.
module.exports = function( pattern ) {
  
  // Load dependencies.
  const grunt = require('grunt');
  const glob = require('glob').sync;
  const path = require('path');
  const fs = require('fs');
  const chalk = require('chalk');
  const _ = require('lodash');
  
  // Set status flags.
  const statuses = [
    'specification',
    'construction',
    'review',
    'complete',
    'reconsideration',
    'deprecated'
  ];
  
  // Set the path to a JSON file that holds pattern status data.
  const json = path.resolve('pattern-status.json');
  
  // Initialize regexes for finding a pattern's status.
  const regex = new RegExp(`^/// @status (.+)$`, 'm');
  
  // Enable exporting of all pattern statuses to a JSON file.
  if( pattern == 'export' ) {
    
    // Get all patterns.
    const patterns = glob(path.resolve('scss/emory-libraries/patterns/*/_*.scss'));
    
    // Load JSON data.
    const data = fs.existsSync(json) ? require(json) : {};

    // Get status data for all patterns.
     patterns.forEach((pattern) => {

        // Get the pattern file's contents.
        const contents = fs.readFileSync(pattern, 'utf8');

        // Get pattern data.
        const name = path.basename(path.dirname(pattern)).replace(/^\d*-/, '') + '-' + path.basename(pattern, '.scss').substring(1);
        const status = contents.match(regex)[1];

        // Save the data.
        data[name] = status;

      });
    
    // Save the data to a JSON file.
    fs.writeFileSync(json, JSON.stringify(data, null, 2));
    
    // Report done.
    grunt.log.success(`Exported pattern statuses to \'${path.basename(json)}\' successfully.`);
    
  }
  
  // Enable importing of all pattern statuses from a JSON file.
  else if( pattern == 'import' ) {
    
    // Load JSON data.
    const data = fs.existsSync(json) ? require(json) : {};
    
    // Update statuses for each pattern.
    _.each(data, (status, pattern) => {
      
      // Get the pattern's atomic group and name.
      const group = pattern.substring(0, pattern.indexOf('-'));
      const name = pattern.replace(new RegExp(`^${group}[-]`, 'i'), '');
  
      // Get the pattern file.
      const file = glob(path.resolve('scss/emory-libraries/patterns/', `*-${group}/`, `_${name}.scss`))[0];

      // Get the file's contents.
      let contents = fs.readFileSync(file, 'utf8');

      // Capture the pattern's old status.
      const old = contents.match(regex)[1]; 

      // Replace the status.
      contents = contents.replace(regex, `/// @status ${status}`);

      // Update the pattern's status.
      fs.writeFileSync(file, contents);
      
      // Report that the status was changed.
      grunt.log.writeln(chalk.green('✓') + ` ${pattern}: ${old} --> ${status}`);
      
    });
    
    // Report done.
    grunt.log.success(`\nImported pattern statuses from \'${path.basename(json)}\' successfully.`);
    
  }
  
  // Enable updating of pattern statuses.
  else {

    // Get the flag.
    let flag = process.argv.slice(3);
    
    // Ignore invalid flags.
    if( flag.length === 0 ) {
      
      // Report pattern error.
      grunt.log.warn(`Missing a status flag. Please provide one as an \'--option\' then try again.`);
      
      // Exit.
      return;
      
    }
    
    // Parse the flag as a status.
    const status = flag[0].substring(2);

    // Ignore invalid flags.
    if( !statuses.includes(status) ) {
      
      // Report status error.
      grunt.log.warn(`Invalid status \'${status}\'. Please choose a status from the list below:`);
      grunt.log.warn(statuses.join('\n'));
      
      // Exit.
      return;
      
    }

    // Get the pattern's atomic group and name.
    const group = pattern.substring(0, pattern.indexOf('-'));
    const name = pattern.replace(new RegExp(`^${group}[-]`, 'i'), '');

    // Find pattern files.
    const files = glob(path.resolve('scss/emory-libraries/patterns/', `*-${group}/`, `_${name}.scss`)).reduce((result, files) => {

      // Combine all files into a single array.
      result = result.concat(files);

      // Continue reducing.
      return result;

    }, []);
    
    // Exit if the pattern couldn't be found.
    if( files.length === 0 ) {
      
      // Report pattern error.
      grunt.log.warn(`Could not find pattern \'${pattern}\'. Verify that it exists then try again.`);
      
      // Exit.
      return;
      
    }

    // Update status across files.
    files.forEach((file) => {

      // Get the file's contents.
      let contents = fs.readFileSync(file, 'utf8');

      // Capture the pattern's old status.
      const old = contents.match(regex)[1]; 

      // Replace the status.
      contents = contents.replace(regex, `/// @status ${status}`);

      // Update the pattern's status.
      fs.writeFileSync(file, contents);

      // Report that the status was changed.
      grunt.log.writeln(chalk.green('✓') + ` ${pattern}: ${old} --> ${status}`);

    });
    
    // Report done.
    grunt.log.success(`\nUpdated pattern statuses for \'${pattern}\' successfully.`);
    
  }
  
};