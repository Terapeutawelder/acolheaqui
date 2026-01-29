import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Node, Edge } from "@xyflow/react";

export interface AutomationFlow {
  id: string;
  professional_id: string;
  name: string;
  description: string | null;
  nodes: Node[];
  edges: Edge[];
  is_active: boolean;
  trigger_type: string | null;
  trigger_config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface AutomationExecution {
  id: string;
  flow_id: string;
  professional_id: string;
  trigger_data: Record<string, unknown>;
  current_node_id: string | null;
  execution_state: Record<string, unknown>;
  status: string;
  started_at: string | null;
  completed_at: string | null;
  error_message: string | null;
  created_at: string;
}

export function useAutomationFlows(professionalId: string | null) {
  return useQuery({
    queryKey: ["automation-flows", professionalId],
    queryFn: async () => {
      if (!professionalId) return [];
      
      const { data, error } = await supabase
        .from("automation_flows")
        .select("*")
        .eq("professional_id", professionalId)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return data as unknown as AutomationFlow[];
    },
    enabled: !!professionalId,
  });
}

export function useAutomationFlow(flowId: string | null) {
  return useQuery({
    queryKey: ["automation-flow", flowId],
    queryFn: async () => {
      if (!flowId) return null;
      
      const { data, error } = await supabase
        .from("automation_flows")
        .select("*")
        .eq("id", flowId)
        .maybeSingle();

      if (error) throw error;
      return data as unknown as AutomationFlow | null;
    },
    enabled: !!flowId,
  });
}

export function useCreateAutomationFlow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (flow: {
      professional_id: string;
      name: string;
      description?: string;
      nodes?: Node[];
      edges?: Edge[];
      trigger_type?: string;
      trigger_config?: Record<string, unknown>;
    }) => {
      const insertData = {
        professional_id: flow.professional_id,
        name: flow.name,
        description: flow.description || null,
        nodes: JSON.parse(JSON.stringify(flow.nodes || [])),
        edges: JSON.parse(JSON.stringify(flow.edges || [])),
        trigger_type: flow.trigger_type || null,
        trigger_config: flow.trigger_config || {},
      };
      
      const { data, error } = await supabase
        .from("automation_flows")
        .insert(insertData as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["automation-flows", variables.professional_id] });
      toast.success("Automação criada com sucesso!");
    },
    onError: (error) => {
      console.error("Error creating automation:", error);
      toast.error("Erro ao criar automação");
    },
  });
}

export function useUpdateAutomationFlow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<AutomationFlow> & { id: string }) => {
      const updateData: Record<string, unknown> = {};
      
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.nodes !== undefined) updateData.nodes = JSON.parse(JSON.stringify(updates.nodes));
      if (updates.edges !== undefined) updateData.edges = JSON.parse(JSON.stringify(updates.edges));
      if (updates.is_active !== undefined) updateData.is_active = updates.is_active;
      if (updates.trigger_type !== undefined) updateData.trigger_type = updates.trigger_type;
      if (updates.trigger_config !== undefined) updateData.trigger_config = updates.trigger_config;

      const { data, error } = await supabase
        .from("automation_flows")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["automation-flows"] });
      queryClient.invalidateQueries({ queryKey: ["automation-flow", data.id] });
    },
    onError: (error) => {
      console.error("Error updating automation:", error);
      toast.error("Erro ao salvar automação");
    },
  });
}

export function useDeleteAutomationFlow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (flowId: string) => {
      const { error } = await supabase
        .from("automation_flows")
        .delete()
        .eq("id", flowId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automation-flows"] });
      toast.success("Automação excluída com sucesso!");
    },
    onError: (error) => {
      console.error("Error deleting automation:", error);
      toast.error("Erro ao excluir automação");
    },
  });
}

export function useAutomationExecutions(flowId: string | null) {
  return useQuery({
    queryKey: ["automation-executions", flowId],
    queryFn: async () => {
      if (!flowId) return [];
      
      const { data, error } = await supabase
        .from("automation_executions")
        .select("*")
        .eq("flow_id", flowId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as unknown as AutomationExecution[];
    },
    enabled: !!flowId,
  });
}

export function useToggleAutomationFlow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { data, error } = await supabase
        .from("automation_flows")
        .update({ is_active })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["automation-flows"] });
      queryClient.invalidateQueries({ queryKey: ["automation-flow", data.id] });
      toast.success(data.is_active ? "Automação ativada!" : "Automação desativada!");
    },
    onError: (error) => {
      console.error("Error toggling automation:", error);
      toast.error("Erro ao alterar status da automação");
    },
  });
}
