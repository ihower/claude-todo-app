import React, { useState, useEffect, useCallback } from 'react';
import { Trash2, Edit, Check, X } from 'lucide-react';

// 開發模式切換（true 為開發模式，false 為生產模式）
const isDev = true;

// Supabase 客戶端初始化
const supabase = !isDev ? window.supabase.createClient('YOUR_SUPABASE_URL', 'YOUR_SUPABASE_ANON_KEY') : null;

// 本地初始數據
const initialTodos = [
  {
    "id": 1,
    "task": "完成專案報告",
    "completed_at": "2024-07-20T15:30:00Z"
  },
  {
    "id": 2,
    "task": "準備團隊會議",
    "completed_at": null
  },
  {
    "id": 3,
    "task": "回覆客戶郵件",
    "completed_at": "2024-07-18T09:45:00Z"
  },
  {
    "id": 4,
    "task": "更新網站內容",
    "completed_at": null
  },
  {
    "id": 5,
    "task": "安排下週行程",
    "completed_at": "2024-07-19T17:00:00Z"
  }
];

const TodoApp = () => {
  const [todos, setTodos] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingTask, setEditingTask] = useState('');

  const fetchTodos = useCallback(async () => {
    if (isDev) {
      console.log('Fetching todos in dev mode');
      setTodos(initialTodos);
    } else {
      console.log('Fetching todos from Supabase');
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('id', { ascending: true });

      if (error) console.error('Error fetching todos:', error);
      else setTodos(data);
    }
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const addTodo = async (e) => {
    e.preventDefault();
    if (newTask.trim() !== '') {
      const newTodo = {
        id: isDev ? Date.now() : undefined, // 使用時間戳作為臨時 ID
        task: newTask,
        completed_at: null
      };

      if (isDev) {
        console.log('Adding todo in dev mode:', newTodo);
        setTodos(prevTodos => {
          const updatedTodos = [...prevTodos, newTodo];
          console.log('Updated todos:', updatedTodos);
          return updatedTodos;
        });
      } else {
        console.log('Adding todo to Supabase:', newTodo);
        const { data, error } = await supabase
          .from('todos')
          .insert([newTodo])
          .select();

        if (error) console.error('Error adding todo:', error);
        else setTodos(prevTodos => [...prevTodos, data[0]]);
      }
      setNewTask('');
    }
  };

  const deleteTodo = async (id) => {
    console.log('Deleting todo:', id);
    if (isDev) {
      setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
    } else {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id);

      if (error) console.error('Error deleting todo:', error);
      else setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
    }
  };

  const toggleComplete = async (id, completed_at) => {
    console.log('Toggling complete for todo:', id);
    const newCompletedAt = completed_at ? null : new Date().toISOString();
    if (isDev) {
      setTodos(prevTodos => prevTodos.map(todo => 
        todo.id === id ? { ...todo, completed_at: newCompletedAt } : todo
      ));
    } else {
      const { error } = await supabase
        .from('todos')
        .update({ completed_at: newCompletedAt })
        .eq('id', id);

      if (error) console.error('Error updating todo:', error);
      else {
        setTodos(prevTodos => prevTodos.map(todo => 
          todo.id === id ? { ...todo, completed_at: newCompletedAt } : todo
        ));
      }
    }
  };

  const startEditing = (id, task) => {
    console.log('Start editing todo:', id);
    setEditingId(id);
    setEditingTask(task);
  };

  const cancelEditing = () => {
    console.log('Cancel editing');
    setEditingId(null);
    setEditingTask('');
  };

  const saveEdit = async (id) => {
    console.log('Saving edit for todo:', id);
    if (editingTask.trim() !== '') {
      if (isDev) {
        setTodos(prevTodos => prevTodos.map(todo => 
          todo.id === id ? { ...todo, task: editingTask } : todo
        ));
      } else {
        const { error } = await supabase
          .from('todos')
          .update({ task: editingTask })
          .eq('id', id);

        if (error) console.error('Error updating todo:', error);
        else {
          setTodos(prevTodos => prevTodos.map(todo => 
            todo.id === id ? { ...todo, task: editingTask } : todo
          ));
        }
      }
      setEditingId(null);
      setEditingTask('');
    }
  };

  console.log('Current todos:', todos);

  return (
    <>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/supabase/2.39.3/supabase.min.js" integrity="sha512-PQCMTGGEUadDJfcP62pF4rAJwgkfuJFHG98zGaW0k2bWAcRnyOsyQoR/t6x+BUaMuikUn0KM8OYOKh5OFdbGmQ==" crossOrigin="anonymous" referrerPolicy="no-referrer"></script>
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
        <h1 className="text-2xl font-bold mb-4">待辦事項 ({isDev ? '開發模式' : '生產模式'})</h1>
        <form onSubmit={addTodo} className="mb-4">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="新增待辦事項"
            className="w-full p-2 border rounded"
          />
          <button type="submit" className="mt-2 w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
            新增
          </button>
        </form>
        <ul>
          {todos.map(todo => (
            <li key={todo.id} className="flex items-center justify-between p-2 border-b">
              {editingId === todo.id ? (
                <>
                  <input
                    type="text"
                    value={editingTask}
                    onChange={(e) => setEditingTask(e.target.value)}
                    className="flex-grow p-1 mr-2 border rounded"
                  />
                  <div>
                    <button onClick={() => saveEdit(todo.id)} className="text-green-500 mr-2">
                      <Check size={20} />
                    </button>
                    <button onClick={cancelEditing} className="text-red-500">
                      <X size={20} />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <span className={`flex-grow ${todo.completed_at ? 'line-through text-gray-500' : ''}`}>
                    {todo.task}
                  </span>
                  <div>
                    <button onClick={() => toggleComplete(todo.id, todo.completed_at)} className="text-blue-500 mr-2">
                      <Check size={20} />
                    </button>
                    <button onClick={() => startEditing(todo.id, todo.task)} className="text-yellow-500 mr-2">
                      <Edit size={20} />
                    </button>
                    <button onClick={() => deleteTodo(todo.id)} className="text-red-500">
                      <Trash2 size={20} />
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default TodoApp;
