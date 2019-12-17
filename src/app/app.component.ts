import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {interval, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {HttpService} from './services/http.service';
import {Task} from './models/task.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit, OnDestroy {

  public actionForm: FormGroup = new FormGroup({
    group: new FormControl('status'),
    sort: new FormControl('priority'),
    search: new FormControl(null)
  });
  private data: Array<Task>;
  public decrease = true;
  public key = 'title';
  public tasks;
  public headers: Array<any> = [];
  private unsubscribe$: Subject<any> = new Subject();

  constructor(
    private api: HttpService
  ) {
  }

  ngOnInit(): void {
    this.getTasks();

    interval(15000)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => this.getTasks());

    this.actionForm.valueChanges
      .subscribe(r => {
        this.key = r.group !== 'assignee' ? 'title' : 'name';
        this.arrange(this.data);
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private getTasks() {
    return this.api.getTasks().subscribe((data: Array<Task>) => {
      this.data = data;
      this.arrange(data);
    });
  }

  private arrange(data) {
    const newData = {};
    this.headers = [];

    data.forEach(task => {

      if (!this.headers.find(h => h.id === task[this.actionForm.value.group].id)) {
        this.headers.push(task[this.actionForm.value.group]);
      }

      if (this.actionForm.get('search').value) {
        if (task.title.toLowerCase().search(this.actionForm.get('search').value.toLowerCase()) === -1 &&
          task.description.toLowerCase().search(this.actionForm.get('search').value.toLowerCase()) === -1) {
          return;
        }
      }

      if (newData[task[this.actionForm.value.group][this.key]]) {
        newData[task[this.actionForm.value.group][this.key]].push(task);
      } else {
        newData[task[this.actionForm.value.group][this.key]] = new Array(task);
      }
    });

    this.sort(newData);
    this.bubbleSort(this.headers, null);
    this.tasks = newData;
  }

  private bubbleSort(items, key) {
    const length = items.length;
    for (let i = 0; i < length; i++) {
      for (let j = 0; j < (length - i - 1); j++) {
        if (key) {
          if (items[j][this.actionForm.value.sort][key] > items[j + 1][this.actionForm.value.sort][key]) {
            const tmp = items[j];
            items[j] = items[j + 1];
            items[j + 1] = tmp;
          }
        } else {
          if (items[j][this.actionForm.value.sort === 'assignee' ? 'name' : 'id'] > items[j + 1][this.actionForm.value.sort === 'assignee' ? 'name' : 'id']) {
            const tmp = items[j];
            items[j] = items[j + 1];
            items[j + 1] = tmp;
          }
        }
      }
    }
  }

  private sort(object) {
    Object.values(object).map((tasks: Array<Task>) => {
      this.bubbleSort(tasks, this.actionForm.value.sort === 'assignee' ? 'name' : 'id');
      !this.decrease && tasks.reverse();
    });
  }

  public onMove(direction: number, index, tIndex) {
    const transfer = this.tasks[this.headers[index][this.key]].splice(tIndex, 1);
    this.tasks[this.headers[index + direction][this.key]].push(transfer[0]);
    this.bubbleSort(this.tasks[this.headers[index + direction][this.key]], this.actionForm.value.sort === 'assignee' ? 'name' : 'id');
  }

  public changeDirection() {
    this.decrease = !this.decrease;
    Object.values(this.tasks).map((tasks: Array<Task>) => {
      return tasks.reverse();
    });
  }

}
