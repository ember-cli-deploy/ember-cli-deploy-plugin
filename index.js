var CoreObject     = require('core-object');
var chalk = require('chalk');
var blue  = chalk.blue;

var DeployPluginBase = CoreObject.extend({
  context: null,
  ui: null,
  project: null,
  pluginConfig: null,
  defaultConfig: {},
  beforeHook: function(context) {
    this.context = context;
    this.ui = context.ui;
    this.project = context.project;
    context.config[this.name] = context.config[this.name] || {}
    this.pluginConfig = context.config[this.name];
  },
  configure: function(context) {
    this.log('validating config');
    var defaultProps = Object.keys(this.defaultConfig || {});
    defaultProps.forEach(this.applyDefaultConfigProperty.bind(this));
    var requiredProps = this.requiredConfig || [];
    requiredProps.forEach(this.ensureConfigPropertySet.bind(this));
    this.log('config ok');
  },
  applyDefaultConfigProperty: function(propertyName){
    if (this.pluginConfig[propertyName] === undefined) {
      var value = this.defaultConfig[propertyName];
      this.pluginConfig[propertyName] = value;
      var description = value;
      if (typeof description === "function") {
        description = "[Function]";
      }
      this.log('Missing config: `' + propertyName + '`, using default: `' + description + '`', { color: 'yellow' });
    }
  },
  ensureConfigPropertySet: function(propertyName){
    if (!this.pluginConfig[propertyName]) {
      var message = 'Missing required config: `' + propertyName + '`';
      this.log(message, { color: 'red' });
      throw new Error(message);
    }
  },
  readConfig: function(property){
    var configuredValue = this.pluginConfig[property];
    if (typeof configuredValue === 'function') {
      return configuredValue.call(this, this.context);
    }
    return configuredValue;
  },
  log: function(message, opts) {
    opts = opts || { color: 'blue' }
    opts['color'] = opts['color'] || 'blue';

    this.ui.write(blue('|    '));
    var chalkColor = chalk[opts.color];
    this.ui.writeLine(chalkColor('- ' + message));
  }
});

module.exports = DeployPluginBase;
