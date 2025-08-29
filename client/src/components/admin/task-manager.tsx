import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Edit, Trash2, Users, Activity, Eye } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  type: string;
  requirements: any;
  reward: number;
  isActive: boolean;
  createdAt: string;
  completions?: number;
}

export function TaskManager() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ["/api/admin/tasks"],
  });

  const createTaskMutation = useMutation({
    mutationFn: async (taskData: any) => {
      const response = await apiRequest("POST", "/api/admin/tasks", taskData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tasks"] });
      setIsCreateModalOpen(false);
      toast({
        title: "Task Created",
        description: "New task has been created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest("PUT", `/api/admin/tasks/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tasks"] });
      setEditingTask(null);
      toast({
        title: "Task Updated",
        description: "Task has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    },
  });

  const TaskForm = ({ task, onSubmit, onCancel }: { 
    task?: Task | null; 
    onSubmit: (data: any) => void; 
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState({
      title: task?.title || "",
      description: task?.description || "",
      type: task?.type || "twitter",
      reward: task?.reward || 100,
      requirements: task?.requirements || {},
      isActive: task?.isActive ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enter task title"
            required
            data-testid="task-title-input"
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Enter task description"
            required
            data-testid="task-description-input"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="type">Type</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger data-testid="task-type-select">
                <SelectValue placeholder="Select task type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="twitter">Twitter Engagement</SelectItem>
                <SelectItem value="proof_generation">Proof Generation</SelectItem>
                <SelectItem value="social">Social Interaction</SelectItem>
                <SelectItem value="milestone">Milestone</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="reward">Reward (XP)</Label>
            <Input
              id="reward"
              type="number"
              value={formData.reward}
              onChange={(e) => setFormData({ ...formData, reward: parseInt(e.target.value) })}
              placeholder="100"
              min="1"
              required
              data-testid="task-reward-input"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="rounded border-border"
            data-testid="task-active-checkbox"
          />
          <Label htmlFor="isActive">Active</Label>
        </div>

        <div className="flex gap-2 pt-4">
          <Button type="submit" disabled={createTaskMutation.isPending || updateTaskMutation.isPending}>
            {task ? "Update Task" : "Create Task"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    );
  };

  const filteredTasks = tasks?.filter(task => {
    if (filter === "active") return task.isActive;
    if (filter === "inactive") return !task.isActive;
    return true;
  }) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Task Management</CardTitle>
              <p className="text-muted-foreground">Create and manage engagement tasks</p>
            </div>
            
            <div className="flex gap-2">
              <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                <SelectTrigger className="w-32" data-testid="task-filter-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tasks</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              
              <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogTrigger asChild>
                  <Button className="zkverify-gradient" data-testid="create-task-button">
                    <Plus size={16} className="mr-2" />
                    Create Task
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Task</DialogTitle>
                  </DialogHeader>
                  <TaskForm
                    onSubmit={(data) => createTaskMutation.mutate(data)}
                    onCancel={() => setIsCreateModalOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tasks Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="loading-shimmer h-16 rounded-lg"></div>
                ))}
              </div>
            </div>
          ) : filteredTasks.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Reward</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Completions</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map((task) => (
                  <TableRow key={task.id} data-testid={`task-row-${task.id}`}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{task.title}</p>
                        <p className="text-sm text-muted-foreground truncate max-w-xs">
                          {task.description}
                        </p>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {task.type.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <span className="font-medium">+{task.reward} XP</span>
                    </TableCell>
                    
                    <TableCell>
                      <Badge className={task.isActive ? "task-active" : "bg-muted text-muted-foreground"}>
                        {task.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users size={14} className="text-muted-foreground" />
                        <span>{task.completions || 0}</span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingTask(task)}
                          data-testid={`edit-task-${task.id}`}
                        >
                          <Edit size={14} />
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          data-testid={`view-task-${task.id}`}
                        >
                          <Eye size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Activity className="mx-auto text-muted-foreground mb-4" size={48} />
              <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
              <p className="text-muted-foreground mb-4">
                Create your first task to get started
              </p>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                Create Task
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Task Modal */}
      <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <TaskForm
            task={editingTask}
            onSubmit={(data) => editingTask && updateTaskMutation.mutate({ id: editingTask.id, data })}
            onCancel={() => setEditingTask(null)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
