import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Trash2, Plus } from 'lucide-react';
import { Task } from '../../entities/Task';
import { auth, storage } from '../../lib/firebaseClient';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import ConfirmationModal from '../../components/ConfirmationModal';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Connector from './Connector';

const TrafficLightButton = ({ color, onClick }) => (
  <button onClick={onClick} className={`w-3 h-3 rounded-full ${color}`}></button>
);

const SortableTask = ({ task, onRun, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="p-4 bg-white rounded-lg shadow-md flex justify-between items-start cursor-pointer hover:bg-gray-50"
    >
      <div className="flex items-center">
        <button {...listeners} className="cursor-grab mr-4 text-black">
          <GripVertical />
        </button>
        <div className="flex-1" onClick={onRun}>
          <p className="font-semibold text-black">{task.description}</p>
          <div className="flex items-center mt-2">
            <div className="flex flex-wrap">
              {task.images.map((imageUrl, index) => (
                <div key={index} className="relative mr-2">
                  <img src={imageUrl} alt={`task-image-${index}`} className="w-12 h-12 rounded-lg object-cover" />
                </div>
              ))}
            </div>
            <div className="flex flex-wrap">
              {task.tags.map((tag, index) => (
                <div key={index} className="px-3 py-1 mr-2 mb-2 text-xs text-white rounded-full" style={{ backgroundColor: tag.color }}>
                  {tag.name}
                </div>
              ))}
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            <p>
              Schedule: {task.schedule}
              {task.schedule === 'scheduled' && ` at ${new Date(task.scheduled_time).toLocaleString()}`}
              {task.schedule === 'recurring' && ` with pattern ${task.recurring_pattern}`}
            </p>
            {task.return_value && (
              <p>
                Return: {task.return_value}
              </p>
            )}
            <p>
              Status: {task.status}
            </p>
          </div>
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(task.id);
        }}
        className="text-red-500 hover:text-red-700 ml-4"
      >
        <Trash2 size={20} />
      </button>
    </li>
  );
};

export default function TasksWindow({ isOpen, onClose, zIndex, onClick, position, windowId, onConnectorMouseDown }) {
  const [tasks, setTasks] = useState([]);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [newTask, setNewTask] = useState({
    description: '',
    schedule: 'instant',
    scheduledTime: '',
    recurringPattern: '',
    tags: [],
    images: [],
    returnValue: '',
  });
  const [tagInput, setTagInput] = useState('');
  const [tagColor, setTagColor] = useState('#000000');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDraggable, setIsDraggable] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const colors = [
    '#FF0000', '#0000FF', '#FFFF00', '#00FF00', '#800080',
    '#FFC0CB', '#FFA500', '#A52A2A', '#000000', '#808080'
  ];

  useEffect(() => {
    if (isOpen) {
      loadTasks();
    }
  }, [isOpen]);

  const loadTasks = async () => {
    const tasks = await Task.getAll();
    setTasks(tasks);
  };

  if (!isOpen) return null;

  const handleCreateTask = async () => {
    const taskData = {
      description: newTask.description,
      schedule: newTask.schedule,
      scheduled_time: newTask.schedule === 'scheduled' ? newTask.scheduledTime : null,
      recurring_pattern: newTask.schedule === 'recurring' ? newTask.recurringPattern : null,
      tags: newTask.tags,
      images: newTask.images,
      return_value: newTask.returnValue,
      status: 'pending',
    };
    await Task.create(taskData);
    loadTasks();
    setNewTask({
      description: '',
      schedule: 'instant',
      scheduledTime: '',
      recurringPattern: '',
      tags: [],
      images: [],
      returnValue: '',
    });
    setIsCreatingTask(false);
  };

  const handleDeleteTask = async (id) => {
    await Task.delete(id);
    loadTasks();
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setTasks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleRunAll = () => {
    tasks.forEach(task => {
      window.dispatchEvent(new CustomEvent('gemini-tool-call', {
        detail: {
          name: 'automateTask',
          args: {
            tool_call: {
              name: task.description,
              args: {},
            },
          },
        },
      }));
    });
  };

  return (
    <motion.div
      drag={isDraggable}
      dragMomentum={false}
      dragHandle=".drag-handle"
      className="absolute bg-gray-100/50 backdrop-blur-xl rounded-lg shadow-2xl flex flex-col overflow-hidden border border-gray-300/20 h-full"
      style={{
        zIndex,
        width: 400,
        height: 500,
        top: position?.top,
        left: position?.left,
      }}
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <div className="drag-handle relative flex items-center justify-between p-2 bg-gray-200/80 rounded-t-lg border-b border-gray-300/40">
        <div className="flex space-x-2">
          <TrafficLightButton color="bg-red-500" onClick={onClose} />
          <TrafficLightButton color="bg-yellow-500" />
          <TrafficLightButton color="bg-green-500" />
        </div>
        <div className="font-semibold text-sm text-black">Tasks</div>
        <div></div>
        <Connector windowId={windowId} onMouseDown={onConnectorMouseDown} />
      </div>
      <div
        className="flex-grow p-4 overflow-y-auto"
        onMouseEnter={() => setIsDraggable(false)}
        onMouseLeave={() => setIsDraggable(true)}
        onTouchStart={() => setIsDraggable(false)}
        onTouchEnd={() => setIsDraggable(true)}
      >
        <div className="flex justify-end mb-4 sticky top-0 py-2">
          <button
            onClick={() => setIsCreatingTask(!isCreatingTask)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600"
          >
            {isCreatingTask ? 'Cancel' : 'Create Task'}
          </button>
        </div>

        {isCreatingTask && (
          <div className="p-4 mb-4 bg-white rounded-md shadow">
            <h3 className="text-lg font-medium mb-2">New Task</h3>
            <textarea
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              placeholder="Enter task description..."
              className="w-full p-2 border rounded-md"
            />
            <div className="mt-2">
              <label className="block text-sm font-medium">Bring me back</label>
              <input
                type="text"
                value={newTask.returnValue}
                onChange={(e) => setNewTask({ ...newTask, returnValue: e.target.value })}
                placeholder="what should the agent return"
                className="w-full p-2 mt-1 border rounded-md"
              />
            </div>
            <div className="mt-2">
              <label className="block text-sm font-medium">Schedule</label>
              <select
                value={newTask.schedule}
                onChange={(e) => setNewTask({ ...newTask, schedule: e.target.value })}
                className="w-full p-2 mt-1 border rounded-md"
              >
                <option value="instant">Instant</option>
                <option value="scheduled">Scheduled</option>
                <option value="recurring">Recurring</option>
              </select>
            </div>
            {newTask.schedule === 'scheduled' && (
              <div className="mt-2">
                <label className="block text-sm font-medium">Time</label>
                <input
                  type="datetime-local"
                  value={newTask.scheduledTime}
                  onChange={(e) => setNewTask({ ...newTask, scheduledTime: e.target.value })}
                  className="w-full p-2 mt-1 border rounded-md"
                />
              </div>
            )}
            {newTask.schedule === 'recurring' && (
              <div className="mt-2">
                <label className="block text-sm font-medium">Pattern (Cron)</label>
                <input
                  type="text"
                  value={newTask.recurringPattern}
                  onChange={(e) => setNewTask({ ...newTask, recurringPattern: e.target.value })}
                  placeholder="e.g., '0 0 * * *'"
                  className="w-full p-2 mt-1 border rounded-md"
                />
              </div>
            )}
            <div className="mt-2">
              <label className="block text-sm font-medium">Tags</label>
              <div className="flex items-center">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag..."
                  className="w-full p-2 mt-1 border rounded-md"
                />
                <button
                  onClick={() => {
                    if (tagInput.trim() !== '') {
                      setNewTask({ ...newTask, tags: [...newTask.tags, { name: tagInput, color: tagColor }] });
                      setTagInput('');
                    }
                  }}
                  className="px-4 py-2 ml-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600"
                >
                  Add
                </button>
              </div>
              <div className="flex items-center mt-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="w-6 h-6 rounded-full mr-1 border"
                    style={{ backgroundColor: color }}
                    onClick={() => setTagColor(color)}
                  />
                ))}
                <input
                  type="color"
                  value={tagColor}
                  onChange={(e) => setTagColor(e.target.value)}
                  className="w-8 h-8"
                />
              </div>
              <div className="flex flex-wrap mt-2">
                {newTask.tags.map((tag, index) => (
                  <div key={index} className="flex items-center px-2 py-1 mr-2 mb-2 text-xs text-white rounded-full" style={{ backgroundColor: tag.color }}>
                    {tag.name}
                    <button onClick={() => setNewTask({ ...newTask, tags: newTask.tags.filter((_, i) => i !== index) })} className="ml-1 text-white">
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-2">
              <label className="block text-sm font-medium">Images</label>
              <div className="flex items-center">
                <input
                  type="file"
                  multiple
                  onChange={async (e) => {
                    const files = Array.from(e.target.files);
                    const uploadedImageUrls = [];
                    for (const file of files) {
                      const storageRef = ref(storage, `tasks/${Date.now()}_${file.name}`);
                      await uploadBytes(storageRef, file);
                      const downloadURL = await getDownloadURL(storageRef);
                      uploadedImageUrls.push(downloadURL);
                    }
                    setNewTask({ ...newTask, images: [...newTask.images, ...uploadedImageUrls] });
                  }}
                  className="w-full p-2 mt-1 border rounded-md"
                />
              </div>
              <div className="flex flex-wrap mt-2">
                {newTask.images.map((imageUrl, index) => (
                  <div key={index} className="relative mr-2 mb-2">
                    <img src={imageUrl} alt={`task-image-${index}`} className="w-16 h-16 rounded-md object-cover" />
                    <button
                      onClick={() => setNewTask({ ...newTask, images: newTask.images.filter((_, i) => i !== index) })}
                      className="absolute top-0 right-0 p-1 bg-red-500 rounded-full text-white"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={handleCreateTask}
                className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600"
              >
                Save Task
              </button>
            </div>
          </div>
        )}

        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium text-black">Task List</h3>
            <button
              onClick={handleRunAll}
              className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600"
            >
              Run all in order
            </button>
          </div>
          {tasks.length === 0 ? (
            <p className="text-gray-500">No tasks yet.</p>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                <ul className="space-y-4">
                  {tasks.map((task) => (
                    <SortableTask
                      key={task.id}
                      task={task}
                      onRun={() => {
                        setSelectedTask(task);
                        setIsConfirmModalOpen(true);
                      }}
                      onDelete={handleDeleteTask}
                    />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={() => {
          if (selectedTask) {
            window.dispatchEvent(new CustomEvent('gemini-tool-call', {
              detail: {
                name: 'automateTask',
                args: {
                  tool_call: {
                    name: selectedTask.description,
                    args: {},
                  },
                },
              },
            }));
          }
          setIsConfirmModalOpen(false);
        }}
        title="Run Task"
      >
        <p>Do you want to run this task now?</p>
        <p className="font-semibold mt-2">{selectedTask?.description}</p>
      </ConfirmationModal>
    </motion.div>
  );
}
