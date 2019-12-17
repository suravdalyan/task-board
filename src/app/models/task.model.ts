export interface Task {
  id: number;
  title: string;
  description: string;
  assignee: Assignee;
  priority: Priority;
  status: Status;
}

interface Assignee {
id: number;
name: string;
}

interface Priority {
  id: number;
  title: string;
}

interface Status {
  id: number;
  title: string;
}
