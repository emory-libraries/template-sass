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
      }
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
        {
          type: 'add',
          path: `scss/patterns/${atomicNumber}-{{group}}s/_{{pattern}}.scss`,
          templateFile: 'templates/pattern/_pattern.scss'
        },
        {
          type: 'add',
          path: `scss/patterns/${atomicNumber}-{{group}}s/{{pattern}}/_structure.scss`,
          templateFile: 'templates/pattern/pattern/_structure.scss'
        },
        {
          type: 'add',
          path: `scss/patterns/${atomicNumber}-{{group}}s/{{pattern}}/_skin.scss`,
          templateFile: 'templates/pattern/pattern/_skin.scss'
        }
      ];
      
    }
  });
  
};