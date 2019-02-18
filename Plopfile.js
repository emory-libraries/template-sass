module.exports = (plop) => {
  
  // Load dependencies.
  const slugify = require('slugify');
  const spawn = require('child_process').spawn;
  
  // Configures generators.
  const config = {
    
    // Define configurations for the pattern generator.
    pattern: {
      groups: {
        token: 10,
        atom: 20,
        molecule: 30,
        compound: 40,
        organism: 50
      },
      regex: ( group ) => new RegExp(`^(\\/\\*\\*\\* insert new ${group}s here \\*\\*\\*\\/)$`, 'mi')
    }
    
  };
  
  // Enable triggering of a grunt task.
  plop.setActionType('grunt', (answers, config) => {

    // Make it asynchronous.
    return new Promise((resolve, reject) => {
    
      // Run grunt.
      const grunt = spawn('grunt', [...config.tasks], {stdio: 'inherit'});

      // Resolve when done.
      grunt.on('close', () => resolve());
      
    });
    
  });

  // Build generator for patterns.
  plop.setGenerator('pattern', {
    description: 'Creates a new pattern',
    prompts: [
      {
        type: 'input',
        name: 'pattern',
        message: "Name of the pattern",
        filter: ( input ) => slugify(input)
      },
      {
        type: 'list',
        name: 'group',
        message: "The pattern's atomic group",
        choices: Object.keys(config.pattern.groups),
        default: Object.keys(config.pattern.groups)[0]
      }
    ],
    actions(data) { 
      
      const atomicNumber = config.pattern.groups[data.group];
      
      return [
        
        // 1. Generate the new pattern's SCSS file.
        {
          type: 'add',
          path: `scss/emory-libraries/patterns/${atomicNumber}-{{group}}s/_{{pattern}}.scss`,
          templateFile: 'templates/pattern/_pattern.scss'
        },
        
        // 2. Initialize the new pattern's structure.
        {
          type: 'add',
          path: `scss/emory-libraries/patterns/${atomicNumber}-{{group}}s/{{pattern}}/_structure.scss`,
          templateFile: 'templates/pattern/pattern/_structure.scss'
        },
        
        // 3. Initialize the new pattern's skin.
        {
          type: 'add',
          path: `scss/emory-libraries/patterns/${atomicNumber}-{{group}}s/{{pattern}}/_skin.scss`,
          templateFile: 'templates/pattern/pattern/_skin.scss'
        },
        
        // 4. Load the new pattern by importing it into our stylesheet.
        {
          type: 'modify',
          path: 'scss/emory-libraries/patterns/__master.scss',
          pattern: config.pattern.regex(data.group),
          template: `@import '${atomicNumber}-{{group}}s/{{pattern}}';\n$1`
        },
        
        // 5. Re-export all pattern statuses.
        {
          type: 'grunt',
          tasks: ['status:export']
        }
      ];
      
    }
  });
  
  // Build generator for tests.
  plop.setGenerator('test', {
    description: 'Creates a new test',
    prompts: [
      {
        type: 'input',
        name: 'test',
        message: 'Name of the test',
        filter: ( input ) => slugify(input)
      },
      {
        type: 'confirm',
        name: 'example',
        message: 'Will this test have examples?',
        default: false
      }
    ],
    actions(data) { 
      
      // Initialize actions.
      const actions = [];
      
      // 1. Create a new SCSS file for the test.
      actions.push({
        type: 'add',
        path: 'test/{{test}}.scss',
        templateFile: 'templates/test/test.scss'
      });
        
      // 2. Create a new HTML file for the test.
      if( data.example ) actions.push({
        type: 'add',
        path: 'test/{{test}}.html',
        templateFile: 'templates/test/test.html'
      });
      
      // Generate.
      return actions;
      
    }
  });
  
};