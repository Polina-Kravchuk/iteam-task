import {Component} from '@angular/core';
import {Subject, timer} from 'rxjs';
import {repeatWhen, takeUntil} from "rxjs/operators";
import {ConnectionService} from 'ng-connection-service';
import {HttpClient} from "@angular/common/http";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'iteam-task';

  private readonly stopSubject = new Subject<void>();
  private readonly startSubject = new Subject<void>();

  isConnected = true;
  isTabActive = true;

  invisibleTime: Date;

  foxObj: any;

  constructor(private connectionService: ConnectionService, private http: HttpClient) {
    this.SetTimer();
    this.CheckInternetConection();
    this.CheckTabActive();
    this.CallRestApi();
  }

  SetTimer() {
    timer(0, 10000)
      .pipe(
        takeUntil(this.stopSubject),
        repeatWhen(() => this.startSubject)
      ).subscribe(e => {
      this.CallRestApi();
    });
  }

  start(): void {
    if (this.isConnected && this.isTabActive) {
      this.startSubject.next();

      const now = new Date();
      const inActiveTime = 10000;

      if (this.invisibleTime && this.isTimeOut(this.invisibleTime, now, inActiveTime)) {
        this.CallRestApi();
      }
    }
  }

  isTimeOut(date1: Date, date2: Date, inActiveTime: number): boolean {
    // Convert both dates to milliseconds
    var date1_ms = date1.getTime();
    var date2_ms = date2.getTime();

    // Calculate the difference in milliseconds
    var difference_ms = date2_ms - date1_ms;

    return difference_ms > inActiveTime;
  }

  stop(): void {
    this.stopSubject.next();
  }

  CallRestApi() {
    const url = `https://randomfox.ca/floof/`;
    this.http.get(url).subscribe(obj => {
      this.foxObj = obj;
    });
  }

  CheckInternetConection() {
    this.connectionService.monitor().subscribe(isConnected => {
      this.isConnected = isConnected;
      if (this.isConnected) {
        this.isConnected = true;
        this.start();
      } else {
        this.isConnected = false;
        this.stop();
      }
    })
  }

  CheckTabActive() {
    document.addEventListener('visibilitychange', e => {
      if (document.hidden) {
        this.isTabActive = false;
        this.invisibleTime = new Date();
        this.stop();
      } else {
        this.isTabActive = true;
        this.start();
      }
    });
  }


}
