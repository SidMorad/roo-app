const copyConfig = require('../node_modules/@ionic/app-scripts/config/copy.config');
copyConfig.copyFlagIcon = {
  src: ['{{ROOT}}/node_modules/flag-icon-css/flags/**/de.svg',
        '{{ROOT}}/node_modules/flag-icon-css/flags/**/gb.svg',
        '{{ROOT}}/node_modules/flag-icon-css/flags/**/ir.svg',
        '{{ROOT}}/node_modules/flag-icon-css/flags/**/es.svg',
        '{{ROOT}}/node_modules/flag-icon-css/flags/**/fr.svg',
        '{{ROOT}}/node_modules/flag-icon-css/flags/**/it.svg',
        '{{ROOT}}/node_modules/flag-icon-css/flags/**/ru.svg',
        '{{ROOT}}/node_modules/flag-icon-css/flags/**/jp.svg',
        '{{ROOT}}/node_modules/flag-icon-css/flags/**/kr.svg',
        '{{ROOT}}/node_modules/flag-icon-css/flags/**/cn.svg',
        '{{ROOT}}/node_modules/flag-icon-css/flags/**/tr.svg',
        '{{ROOT}}/node_modules/flag-icon-css/flags/**/sa.svg',
        '{{ROOT}}/node_modules/flag-icon-css/flags/**/il.svg',
        '{{ROOT}}/node_modules/flag-icon-css/flags/**/pt.svg',
        '{{ROOT}}/node_modules/flag-icon-css/flags/**/nl.svg',
        '{{ROOT}}/node_modules/flag-icon-css/flags/**/se.svg',
        '{{ROOT}}/node_modules/flag-icon-css/flags/**/no.svg',
        '{{ROOT}}/node_modules/flag-icon-css/flags/**/dk.svg',
        '{{ROOT}}/node_modules/flag-icon-css/flags/**/fi.svg',
        '{{ROOT}}/node_modules/flag-icon-css/flags/**/gr.svg',
        '{{ROOT}}/node_modules/flag-icon-css/flags/**/ro.svg',
        '{{ROOT}}/node_modules/flag-icon-css/flags/**/za.svg',
        '{{ROOT}}/node_modules/flag-icon-css/flags/**/hr.svg',
        '{{ROOT}}/node_modules/flag-icon-css/flags/**/pl.svg',
        '{{ROOT}}/node_modules/flag-icon-css/flags/**/bg.svg',
        '{{ROOT}}/node_modules/flag-icon-css/flags/**/cz.svg',
        '{{ROOT}}/node_modules/flag-icon-css/flags/**/hu.svg',
        '{{ROOT}}/node_modules/flag-icon-css/flags/**/ua.svg',
        '{{ROOT}}/node_modules/flag-icon-css/flags/**/vn.svg',
        '{{ROOT}}/node_modules/flag-icon-css/flags/**/in.svg',
        '{{ROOT}}/node_modules/flag-icon-css/flags/**/id.svg',
        '{{ROOT}}/node_modules/flag-icon-css/flags/**/th.svg',
      ],
  dest: '{{WWW}}/flags'
};

copyConfig.copySilentRefresh = {
  src: '{{ROOT}}/silent-refresh.html',
  dest: '{{WWW}}/silent-refresh.html'
};