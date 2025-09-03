import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';

const client = generateClient<Schema>();

type Todo = Schema['Todo']['type'];

@Component({
  selector: 'app-todos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './todos.component.html',
  styleUrls: ['./todos.component.css'], // <— array form is safest
})
export class TodosComponent implements OnInit, OnDestroy {
  todos: Todo[] = [];
  private todosSub: { unsubscribe: () => void } | null = null;

  ngOnInit(): void {
    // One live subscription that streams updates
    this.todosSub = client.models.Todo.observeQuery().subscribe({
      next: ({ items }) => (this.todos = items),
      error: (err) => console.error('observeQuery error:', err),
    });
  }

  ngOnDestroy(): void {
    this.todosSub?.unsubscribe();
  }

  async createTodo() {
    const content = window.prompt('Todo content')?.trim();
    if (!content) return;
    try {
      await client.models.Todo.create({ content });
      // No manual refresh needed; observeQuery will emit.
    } catch (error) {
      console.error('error creating todo', error);
    }
  }

  async deleteTodo(id: string) {
    try {
      await client.models.Todo.delete({ id });
      // observeQuery will update the list automatically.
    } catch (error) {
      console.error('error deleting todo', error);
    }
  }

  trackById(_: number, t: Todo) { return t.id; }
}
