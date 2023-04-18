export type Todo = {
  completed: boolean;
  task: string;
};

export class TodoStore {
  todos: Todo[] = [];

  get completedTodosCount() {
    return this.todos.filter((todo) => todo.completed === true).length;
  }

  report() {
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
