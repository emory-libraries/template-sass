module.exports = (plop) => {
  
  // Load dependencies.
  const slugify = require('slugify');
  
  // Configures generators.
  const config = {
    
    // Define configurations for the pattern generator.
    pattern: {
      groups: {
        atom: 10,
        molecule: 20,
        compound: 30,
        organism: 40
      },
      regex: ( group ) => new RegExp(`^(\\/\\*\\*\\* insert new ${group}s here \\*\\*\\*\\/)$`, 'mi')
    }
    
  };

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
          path: `scss/patterns/${atomicNumber}-{{group}}s/_{{pattern}}.scss`,
          templateFile: 'templates/pattern/_pattern.scss'
        },
        
        // 2. Initialize the new pattern's structure.
        {
          type: 'add',
          path: `scss/patterns/${atomicNumber}-{{group}}s/{{pattern}}/_structure.scss`,
          templateFile: 'templates/pattern/pattern/_structure.scss'
        },
        
        // 3. Initialize the new pattern's skin.
        {
          type: 'add',
          path: `scss/patterns/${atomicNumber}-{{group}}s/{{pattern}}/_skin.scss`,
          templateFile: 'templates/pattern/pattern/_skin.scss'
        },
        
        // 4. Load the new pattern by importing it into our stylesheet.
        {
          type: 'modify',
          path: 'scss/patterns/__master.scss',
          pattern: config.pattern.regex(data.group),
          template: `@import '${atomicNumber}-{{group}}s/{{pattern}}';\n$1`
        }
      ];
      
    }
  });
  
};