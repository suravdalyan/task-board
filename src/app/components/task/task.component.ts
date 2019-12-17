import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Task} from '../../models/task.model';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss']
})
export class TaskComponent implements OnInit {

  @Input() task: Task;
  @Input() arrows: any;
  @Output() moveTo = new EventEmitter<any>();

  constructor() {
  }

  ngOnInit() {
  }

  public move(directionNumber) {
    this.moveTo.emit(directionNumber);
  }

}
