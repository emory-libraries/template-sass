// Export `scripts` task.
module.exports = function( pattern ) {
  
  // Load dependencies.
  const grunt = require('grunt');
  const glob = require('glob').sync;
  const path = require('path');
  const fs = require('fs');
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
  
  // Get pattern file paths where statuses should be updated.
  const globs = [
    path.resolve('scss/emory-libraries/patterns/', `*-${group}/`, `_${name}.scss`)
  ];

  // Find pattern files.
  const files = globs.map((path) => glob(path)).reduce((result, files) => {

    // Combine all files into a single array.
    result = result.concat(files);
    
    // Continue reducing.
    return result;
    
  }, []);
  
  // Initialize a regex for finding a pattern's status.
  const regex = new RegExp(`^/// @status (.+)$`, 'm');
  
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
    
    // Report that the status has changed.
    grunt.log.success(`✓ ${pattern}: ${old} --> ${status}`);
    
  });
  
};