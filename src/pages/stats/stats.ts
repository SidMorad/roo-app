import { Component, NgZone } from '@angular/core';
import { IonicPage, ViewController, NavController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { ChartOptions, Chart } from 'chart.js';

import { Api, ScoreUtil, Principal, LoginService, Settings } from '../../providers';

@IonicPage()
@Component({
  selector: 'page-stats',
  templateUrl: 'stats.html'
})
export class StatsPage {

  inProgress: boolean = true;
  total: number;
  progressLevelFrom: number;
  progressLevelTo: number;
  progressLevelValue: number;
  progressLevelMax: number;
  section: string;
  topMonthMembers: any[] = [];
  topEverMembers: any[] = [];
  currentMonth: string;

  constructor(private viewCtrl: ViewController, private ngZone: NgZone,
              private api: Api, private scoreUtil: ScoreUtil,
              private translateService: TranslateService,
              private principal: Principal, private loginService: LoginService,
              private navCtrl: NavController, private settings: Settings) {
    this.initLabelsTranslations();
    Chart.defaults.global['plugins'] = {
      datalabels: {
        color: '#333333',
        backgroundColor: '#88a4d4',
        anchor: 'end',
        align: 'start',
        offset: 10
      }
    }
    this.currentMonth = 'MONTH_' + new Date().getMonth();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.section = 'stats';
    }, 400);
  }

  ionViewWillEnter() {
    if (this.principal.isAuthenticated()) {
      this.fetchLast7dayScore();
      this.resolveScoreStats();
    }
  }

  sectionChanged($event) {
    console.log('sectionChanged(', $event, ')');
    this.inProgress = true;
    if (this.section === 'rankMonth') {
      this.api.getTop3MonthMembers(this.settings.learnDir).subscribe((res) => {
        this.topMonthMembers = res.topMembers;
        this.inProgress = false;
      });
    } else if (this.section === 'rankEver') {
      this.api.getTop3EverMembers(this.settings.learnDir).subscribe((res) => {
        this.topEverMembers = res.topMembers;
        this.inProgress = false;
      });
    } else {
      this.inProgress = false;
    }
  }

  fetchLast7dayScore() {
    this.inProgress = true;
    let daysInWeek = this.forwardDaysToToday();
    this.api.getLast7DaysScores(this.settings.learnDir).subscribe((res) => {
      // console.log('Received data: ', res);
      this.ngZone.run(() => {
        for (let i = 0; i < daysInWeek.length; i++) {
          this.datasets[0].data[i] = 0;
          this.labels[i] = this.daysOfWeekTranslations[daysInWeek[i]];
          for (let j = 0; j < res.length; j++) {
            if (daysInWeek[i] === res[j].dayOfWeek) {
              this.datasets[0].data[i] = res[j].sum;
              j = res.length;
            }
          }
        }
        this.inProgress = false;
      });
    }, (err) => {
      console.log('OOPS fetch last 7 days scores failed.', err);
      this.inProgress = false;
    });
  }

  forwardDaysToToday() {
    let todayInWeek = new Date().getDay();
    let result = [];
    for (let i = 0; i < 7; i++) {
      if (todayInWeek - i < 0) {
        result.push(this.daysOfWeek[todayInWeek - i + 7]);
      }
      else {
        result.push(this.daysOfWeek[todayInWeek - i]);
      }
    }
    return result.reverse();
  }

  resolveScoreStats() {
    this.total = this.settings.cachedScoreLookup.total;
    this.progressLevelFrom = this.scoreUtil.resolveLevelFrom(this.total);
    this.progressLevelTo = this.progressLevelFrom + 1;
    this.progressLevelValue =  this.total - this.scoreUtil.resolveMaxScoreFrom(this.progressLevelFrom-1);
    this.progressLevelMax = this.scoreUtil.determineDivider(this.total);
  }

  isAuthenticated() {
    return this.principal.isAuthenticated();
  }

  continue() {
    this.viewCtrl.dismiss({action: 'continue'});
  }

  login() {
    setTimeout(() => {
      this.navCtrl.parent.select(0);
    }, 100);
    this.loginService.appLogin((data) => {
    }, (error) => { });
  }

  initLabelsTranslations() {
    this.translateService.get(this.daysOfWeek).subscribe((values) => {
      this.daysOfWeekTranslations = values;
    });
  }

  daysOfWeek: string[] = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  daysOfWeekTranslations;
  public datasets: Array<any> = [
    { data: [] }
  ];
  public labels: string[] = [];
  public lineChartColors:Array<any> = [
  { // grey
    backgroundColor: 'rgba(148,159,177,0.2)',
    borderColor: 'orange',
    pointBackgroundColor: 'rgba(148,159,177,1)',
    pointBorderColor: '#fff',
    pointHoverBackgroundColor: '#fff',
    pointHoverBorderColor: 'rgba(148,159,177,0.8)'
  }];
  public chartOptions: ChartOptions = {
    responsive: true,
    legend: {
      display: false
    },
    elements: {
      line: {
        fill: false,
        borderColor: 'orange'
      }
    },
    tooltips: {
      enabled: false
    },
    plugins: {
      datalabels: {
        display: true,
        backgroundColor: function(context) {
          return context.dataset.backgroundColor;
        },
        borderRadius: 4,
        color: 'blue',
        font: {
          weight: 'bold'
        }
      }
    },
    scales: {
      yAxes: [{
        stacked: true
      }]
    }
  };

}