const copyConfig = require('../node_modules/@ionic/app-scripts/config/copy.config');
copyConfig.copyFlagIcon = {
  src: ['{{ROOT}}/node_modules/flag-icon-css/flags/**/de.svg',
        '{{ROOT}}/node_modules/flag-icon-css/flags/**/gb.svg',
        '{{ROOT}}/node_modules/flag-icon-css/flags/**/ir.svg'],
  dest: '{{WWW}}/flags'
};
