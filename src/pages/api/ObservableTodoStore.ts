import { action, autorun, computed, makeObservable, observable } from "mobx";

export type Assignee = {
  name: string;
  email: string;
};

export type Todo = {
  completed: boolean;
  task: string;
  assignee?: Assignee;
};

export class ObservableTodoStore {
  todos: Todo[] = [];
  pendingRequests: number = 0;

  constructor() {
    makeObservable(this, {
      todos: observable,
      pendingRequests: observable,
      completedTodosCount: computed,
      report: computed,
      addTodo: action,
    });
    autorun(() => console.log(this.report));
  }

  get completedTodosCount() {
    return this.todos.filter((todo) => todo.completed === true).length;
  }

  get report() {
    if (this.todos.length === 0) {
      return "<none>";
    }

    const nextTodo = this.todos.find((todo) => todo.completed === false);
    return (
      `Next todo: "${nextTodo ? nextTodo.task : "<none>"}". ` +
      `Progress: ${this.completedTodosCount}/${this.todos.length}`
    );
  }

  addTodo(task: string) {
    this.todos.push({
      task,
      completed: false,
    });
  }
}
