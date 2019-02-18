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
  const statuses = {
    specification:    ['-s', '--specification'],
    construction:     ['-c', '--construction'],
    review:           ['-r', '--review'],
    complete:         ['-x', '--complete'],
    reconsideration:  ['-r', '--reconsideration'],
    deprecated:       ['-d', '--deprecated'],
  };
  
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

    // Get all valid status flags.
    const flags = Object.values(statuses).reduce((result, flags) => {

      // Combine all flags into a single array.
      result = result.concat(flags);

      // Continue reducing.
      return result;

    }, []);

    // Get the flag.
    const flag = process.argv.slice(3)[0];

    // Ignore invalid flags.
    if( !flags.includes(flag) ) return;

    // Initialize the status.
    let status;

    // Get the status,
    _.each(statuses, (flags, state) => {

      // Capture the status.
      if( flags.includes(flag) ) status = state;

    });

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