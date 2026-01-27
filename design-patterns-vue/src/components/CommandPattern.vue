<template>
  <div class="todo-app">
    <div class="controls">
      <button @click="undo" :disabled="!canUndo" class="btn">
        ↶ Undo
      </button>
      <button @click="redo" :disabled="!canRedo" class="btn">
        ↷ Redo
      </button>
    </div>

    <div class="add-todo">
      <input 
        v-model="newTodo" 
        @keyup.enter="addTodo"
        placeholder="Add a new todo..."
        class="todo-input"
      />
      <button @click="addTodo" class="btn btn-primary">Add</button>
    </div>

    <div class="todo-list">
      <div v-for="todo in todos" :key="todo.id" class="todo-item">
        <input 
          type="checkbox" 
          :checked="todo.completed"
          @change="toggleTodo(todo.id)"
        />
        <span v-if="!editingTodo || editingTodo.id !== todo.id" 
              :class="{ completed: todo.completed }"
              @dblclick="startEditing(todo)">
          {{ todo.text }}
        </span>
        <input v-else
          v-model="editingTodo.text"
          @blur="finishEditing"
          @keyup.enter="finishEditing"
          @keyup.esc="cancelEditing"
          class="edit-input"
          ref="editInput"
        />
        <button @click="deleteTodo(todo.id)" class="btn-delete">
          Delete
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

// Command Pattern Implementation
class Command {
  execute() { throw new Error('Execute method must be implemented') }
  undo() { throw new Error('Undo method must be implemented') }
}

class AddTodoCommand extends Command {
  constructor(todos, todo) {
    super()
    this.todos = todos
    this.todo = todo
  }

  execute() {
    this.todos.value.push(this.todo)
  }

  undo() {
    const index = this.todos.value.findIndex(t => t.id === this.todo.id)
    if (index > -1) this.todos.value.splice(index, 1)
  }
}

class DeleteTodoCommand extends Command {
  constructor(todos, todoId) {
    super()
    this.todos = todos
    this.todoId = todoId
    this.deletedTodo = null
    this.deletedIndex = -1
  }

  execute() {
    this.deletedIndex = this.todos.value.findIndex(t => t.id === this.todoId)
    if (this.deletedIndex > -1) {
      this.deletedTodo = this.todos.value[this.deletedIndex]
      this.todos.value.splice(this.deletedIndex, 1)
    }
  }

  undo() {
    if (this.deletedTodo && this.deletedIndex > -1) {
      this.todos.value.splice(this.deletedIndex, 0, this.deletedTodo)
    }
  }
}

class ToggleTodoCommand extends Command {
  constructor(todos, todoId) {
    super()
    this.todos = todos
    this.todoId = todoId
  }

  execute() {
    const todo = this.todos.value.find(t => t.id === this.todoId)
    if (todo) todo.completed = !todo.completed
  }

  undo() {
    // Toggle back
    this.execute()
  }
}

class EditTodoCommand extends Command {
  constructor(todos, todoId, newText) {
    super()
    this.todos = todos
    this.todoId = todoId
    this.newText = newText
    this.oldText = null
  }

  execute() {
    const todo = this.todos.value.find(t => t.id === this.todoId)
    if (todo) {
      this.oldText = todo.text
      todo.text = this.newText
    }
  }

  undo() {
    const todo = this.todos.value.find(t => t.id === this.todoId)
    if (todo && this.oldText !== null) {
      todo.text = this.oldText
    }
  }
}

class CommandService {
  constructor() {
    this.history = []
    this.currentIndex = -1
  }

  execute(command) {
    // Remove any commands after current index (for redo functionality)
    this.history = this.history.slice(0, this.currentIndex + 1)
    
    command.execute()
    this.history.push(command)
    this.currentIndex++
  }

  undo() {
    if (this.canUndo()) {
      const command = this.history[this.currentIndex]
      command.undo()
      this.currentIndex--
    }
  }

  redo() {
    if (this.canRedo()) {
      this.currentIndex++
      const command = this.history[this.currentIndex]
      command.execute()
    }
  }

  canUndo() {
    return this.currentIndex >= 0
  }

  canRedo() {
    return this.currentIndex < this.history.length - 1
  }
}

export default {
  name: 'CommandPattern',
  setup() {
    const todos = ref([])
    const newTodo = ref('')
    const commandService = new CommandService()
    const commandState = ref({
      canUndo: false,
      canRedo: false
    })
    const editingTodo = ref(null)
    const editInput = ref(null)

    const updateCommandState = () => {
      commandState.value = {
        canUndo: commandService.canUndo(),
        canRedo: commandService.canRedo()
      }
    }

    const addTodo = () => {
      if (!newTodo.value.trim()) return
      
      const todo = {
        id: Date.now(),
        text: newTodo.value.trim(),
        completed: false
      }
      
      const command = new AddTodoCommand(todos, todo)
      commandService.execute(command)
      updateCommandState()
      newTodo.value = ''
    }

    const deleteTodo = (id) => {
      const command = new DeleteTodoCommand(todos, id)
      commandService.execute(command)
      updateCommandState()
    }

    const toggleTodo = (id) => {
      const command = new ToggleTodoCommand(todos, id)
      commandService.execute(command)
      updateCommandState()
    }

    const undo = () => {
      commandService.undo()
      updateCommandState()
    }

    const redo = () => {
      commandService.redo()
      updateCommandState()
    }

    const startEditing = (todo) => {
      editingTodo.value = { ...todo }
    }

    const finishEditing = () => {
      if (editingTodo.value && editingTodo.value.text.trim()) {
        const command = new EditTodoCommand(todos, editingTodo.value.id, editingTodo.value.text.trim())
        commandService.execute(command)
        updateCommandState()
      }
      editingTodo.value = null
    }

    const cancelEditing = () => {
      editingTodo.value = null
    }

    return {
      todos,
      newTodo,
      canUndo: computed(() => commandState.value.canUndo),
      canRedo: computed(() => commandState.value.canRedo),
      editingTodo,
      editInput,
      addTodo,
      deleteTodo,
      toggleTodo,
      undo,
      redo,
      startEditing,
      finishEditing,
      cancelEditing
    }
  }
}
</script>

<style scoped>
.todo-app { max-width: 500px; margin: 0 auto; padding: 20px; }
.controls { margin-bottom: 20px; }
.btn { padding: 8px 16px; margin-right: 10px; }
.btn:disabled { opacity: 0.5; }
.add-todo { display: flex; gap: 10px; margin-bottom: 20px; }
.todo-input { flex: 1; padding: 8px; }
.todo-item { display: flex; align-items: center; gap: 10px; padding: 10px; border: 1px solid #ccc; margin-bottom: 5px; }
.completed { text-decoration: line-through; opacity: 0.7; }
.btn-delete { background: #dc3545; color: white; border: none; padding: 4px 8px; }
.edit-input {
  flex: 1;
  padding: 4px;
  margin: 0 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>
