import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AutomationFlow {
  id: string;
  professional_id: string;
  name: string;
  nodes: any[];
  edges: any[];
  is_active: boolean;
  trigger_type: string;
  trigger_config: Record<string, any>;
}

interface ExecutionContext {
  executionId: string;
  flowId: string;
  professionalId: string;
  variables: Record<string, any>;
  currentNodeId: string | null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, ...params } = await req.json();

    switch (action) {
      case "trigger": {
        // Handle incoming trigger (keyword, event, webhook)
        const { professionalId, triggerType, triggerData } = params;

        // Find active flows matching this trigger
        const { data: flows, error: flowsError } = await supabase
          .from("automation_flows")
          .select("*")
          .eq("professional_id", professionalId)
          .eq("is_active", true)
          .eq("trigger_type", triggerType);

        if (flowsError) throw flowsError;

        const matchedFlows: AutomationFlow[] = [];

        for (const flow of flows || []) {
          if (matchesTrigger(flow, triggerType, triggerData)) {
            matchedFlows.push(flow);
          }
        }

        // Start executions for matched flows
        const executions = [];
        for (const flow of matchedFlows) {
          const execution = await startExecution(supabase, flow, triggerData);
          executions.push(execution);
        }

        return new Response(
          JSON.stringify({ success: true, executions }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "execute_node": {
        // Execute a specific node in a flow
        const { executionId, nodeId } = params;

        const { data: execution, error: execError } = await supabase
          .from("automation_executions")
          .select("*, automation_flows(*)")
          .eq("id", executionId)
          .single();

        if (execError) throw execError;

        const flow = execution.automation_flows as unknown as AutomationFlow;
        const node = flow.nodes.find((n: any) => n.id === nodeId);

        if (!node) {
          throw new Error(`Node ${nodeId} not found`);
        }

        const result = await executeNode(supabase, execution, node, flow);

        // Log the execution
        await supabase.from("automation_execution_logs").insert({
          execution_id: executionId,
          node_id: nodeId,
          node_type: node.type,
          input_data: execution.execution_state,
          output_data: result,
          status: result.success ? "success" : "failed",
          error_message: result.error || null,
        });

        // Find next node
        const nextEdge = flow.edges.find((e: any) => e.source === nodeId);
        if (nextEdge) {
          // Update execution state and continue
          await supabase
            .from("automation_executions")
            .update({
              current_node_id: nextEdge.target,
              execution_state: { ...execution.execution_state, ...result.data },
            })
            .eq("id", executionId);

          // Execute next node
          await fetch(`${supabaseUrl}/functions/v1/automation-engine`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${supabaseServiceKey}`,
            },
            body: JSON.stringify({
              action: "execute_node",
              executionId,
              nodeId: nextEdge.target,
            }),
          });
        } else {
          // No more nodes, complete execution
          await supabase
            .from("automation_executions")
            .update({
              status: "completed",
              completed_at: new Date().toISOString(),
            })
            .eq("id", executionId);
        }

        return new Response(
          JSON.stringify({ success: true, result }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "check_event": {
        // Check for event-based triggers (appointments, transactions)
        const { eventType, eventData, professionalId } = params;

        // Map events to trigger types
        const eventMapping: Record<string, string> = {
          appointment_created: "event",
          appointment_confirmed: "event",
          appointment_cancelled: "event",
          payment_approved: "event",
          payment_pending: "event",
          payment_refunded: "event",
        };

        const triggerType = eventMapping[eventType];
        if (!triggerType) {
          return new Response(
            JSON.stringify({ success: true, message: "Event type not mapped" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Find flows with matching event triggers
        const { data: flows } = await supabase
          .from("automation_flows")
          .select("*")
          .eq("professional_id", professionalId)
          .eq("is_active", true)
          .eq("trigger_type", "event");

        for (const flow of flows || []) {
          const config = flow.trigger_config as any;
          if (config?.event === eventType) {
            await startExecution(supabase, flow, eventData);
          }
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Automation engine error:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function matchesTrigger(flow: AutomationFlow, triggerType: string, triggerData: any): boolean {
  const config = flow.trigger_config;

  switch (triggerType) {
    case "keyword": {
      const keywords = config.keywords as string[] || [];
      const message = triggerData.message?.toLowerCase() || "";
      return keywords.some((kw: string) => message.includes(kw.toLowerCase()));
    }
    case "event": {
      return config.event === triggerData.eventType;
    }
    case "webhook": {
      return true; // Webhooks always match
    }
    default:
      return false;
  }
}

async function startExecution(supabase: any, flow: AutomationFlow, triggerData: any) {
  // Find the trigger node (first node)
  const triggerNode = flow.nodes.find((n: any) => n.type === "trigger");
  const firstEdge = flow.edges.find((e: any) => e.source === triggerNode?.id);
  const firstNodeId = firstEdge?.target || triggerNode?.id;

  // Create execution record
  const { data: execution, error } = await supabase
    .from("automation_executions")
    .insert({
      flow_id: flow.id,
      professional_id: flow.professional_id,
      trigger_data: triggerData,
      current_node_id: firstNodeId,
      execution_state: { triggerData },
      status: "running",
      started_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  // Start executing from first node after trigger
  if (firstNodeId && firstNodeId !== triggerNode?.id) {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    await fetch(`${supabaseUrl}/functions/v1/automation-engine`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({
        action: "execute_node",
        executionId: execution.id,
        nodeId: firstNodeId,
      }),
    });
  }

  return execution;
}

async function executeNode(supabase: any, execution: any, node: any, flow: AutomationFlow) {
  const nodeData = node.data || {};
  const state = execution.execution_state || {};
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  switch (node.type) {
    case "message": {
      // Send message via WhatsApp
      const message = replaceVariables(nodeData.message || nodeData.description, state);
      
      // Get WhatsApp settings
      const { data: whatsappSettings } = await supabase
        .from("whatsapp_settings")
        .select("*")
        .eq("professional_id", flow.professional_id)
        .single();

      if (whatsappSettings?.evolution_api_url) {
        // Send via Evolution API
        try {
          await fetch(`${whatsappSettings.evolution_api_url}/message/sendText/${whatsappSettings.evolution_instance_name}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: whatsappSettings.evolution_api_key,
            },
            body: JSON.stringify({
              number: state.triggerData?.phone || state.phone,
              text: message,
            }),
          });
        } catch (e) {
          console.error("WhatsApp send error:", e);
        }
      }

      return { success: true, data: { messageSent: true, message } };
    }

    case "delay": {
      // Implement delay (in production, use a queue system)
      const delayMinutes = nodeData.delayMinutes || 1;
      await new Promise((resolve) => setTimeout(resolve, Math.min(delayMinutes * 60 * 1000, 10000))); // Max 10s for demo
      return { success: true, data: { delayed: true, minutes: delayMinutes } };
    }

    case "condition": {
      // Evaluate condition
      const field = nodeData.conditionField;
      const operator = nodeData.conditionOperator;
      const value = nodeData.conditionValue;
      const fieldValue = getNestedValue(state, field);

      let result = false;
      switch (operator) {
        case "equals":
          result = fieldValue == value;
          break;
        case "not_equals":
          result = fieldValue != value;
          break;
        case "contains":
          result = String(fieldValue).includes(value);
          break;
        case "greater_than":
          result = Number(fieldValue) > Number(value);
          break;
        case "less_than":
          result = Number(fieldValue) < Number(value);
          break;
      }

      return { success: true, data: { conditionResult: result } };
    }

    case "crm": {
      // Update CRM lead
      const action = nodeData.crmAction || "update_stage";
      const phone = state.triggerData?.phone || state.phone;

      if (phone) {
        const { data: lead } = await supabase
          .from("whatsapp_crm_leads")
          .select("*")
          .eq("professional_id", flow.professional_id)
          .eq("phone", phone)
          .single();

        if (lead) {
          const updates: Record<string, any> = {};
          if (nodeData.newStage) updates.stage_id = nodeData.newStage;
          if (nodeData.addTags) {
            updates.tags = [...(lead.tags || []), ...nodeData.addTags];
          }
          if (nodeData.notes) {
            updates.notes = (lead.notes || "") + "\n" + nodeData.notes;
          }

          await supabase
            .from("whatsapp_crm_leads")
            .update(updates)
            .eq("id", lead.id);
        }
      }

      return { success: true, data: { crmUpdated: true } };
    }

    case "calendar": {
      // Create appointment
      const { data: services } = await supabase
        .from("services")
        .select("*")
        .eq("professional_id", flow.professional_id)
        .eq("is_active", true)
        .limit(1);

      if (services?.length > 0 && state.triggerData?.phone) {
        const service = services[0];
        const appointmentDate = nodeData.appointmentDate || new Date().toISOString().split("T")[0];
        const appointmentTime = nodeData.appointmentTime || "10:00";

        await supabase.from("appointments").insert({
          professional_id: flow.professional_id,
          client_name: state.triggerData?.name || "Cliente via Automação",
          client_email: state.triggerData?.email || null,
          client_phone: state.triggerData?.phone,
          appointment_date: appointmentDate,
          appointment_time: appointmentTime,
          duration_minutes: service.duration_minutes,
          amount_cents: service.price_cents,
          status: "pending",
        });
      }

      return { success: true, data: { appointmentCreated: true } };
    }

    case "checkout": {
      // Generate checkout link
      const { data: services } = await supabase
        .from("services")
        .select("*")
        .eq("professional_id", flow.professional_id)
        .eq("is_active", true)
        .limit(1);

      if (services?.length > 0) {
        const checkoutLink = `${supabaseUrl.replace("supabase.co", "lovable.app")}/checkout/${services[0].id}`;
        return { success: true, data: { checkoutLink } };
      }

      return { success: true, data: { checkoutLink: null } };
    }

    case "api": {
      // Make API request
      const url = nodeData.apiUrl;
      const method = nodeData.apiMethod || "GET";
      const headers = nodeData.apiHeaders || {};
      const body = nodeData.apiBody;

      try {
        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json", ...headers },
          body: body ? JSON.stringify(body) : undefined,
        });
        const data = await response.json();
        return { success: true, data: { apiResponse: data } };
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : "Unknown error";
        return { success: false, error: `API error: ${errorMessage}` };
      }
    }

    case "webhook": {
      // Send webhook
      const url = nodeData.webhookUrl;
      if (url) {
        try {
          await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              execution_id: execution.id,
              flow_id: flow.id,
              node_id: node.id,
              state,
              timestamp: new Date().toISOString(),
            }),
          });
        } catch (e) {
          console.error("Webhook error:", e);
        }
      }
      return { success: true, data: { webhookSent: true } };
    }

    case "ai_agent": {
      // Process with AI
      const systemPrompt = nodeData.systemPrompt || "Você é um assistente útil.";
      const userMessage = state.triggerData?.message || "";

      // Get AI config
      const { data: aiConfig } = await supabase
        .from("ai_agent_config")
        .select("*")
        .eq("professional_id", flow.professional_id)
        .single();

      if (aiConfig?.openai_api_key) {
        try {
          const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${aiConfig.openai_api_key}`,
            },
            body: JSON.stringify({
              model: aiConfig.openai_preferred_model || "gpt-4o-mini",
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userMessage },
              ],
            }),
          });
          const data = await response.json();
          const aiResponse = data.choices?.[0]?.message?.content || "";
          return { success: true, data: { aiResponse } };
        } catch (e: unknown) {
          const errorMessage = e instanceof Error ? e.message : "Unknown error";
          return { success: false, error: `AI error: ${errorMessage}` };
        }
      }

      return { success: true, data: { aiResponse: null } };
    }

    default:
      return { success: true, data: {} };
  }
}

function replaceVariables(text: string, state: Record<string, any>): string {
  if (!text) return "";
  
  return text.replace(/\{(\w+)\}/g, (match, key) => {
    return getNestedValue(state, key) || getNestedValue(state.triggerData, key) || match;
  });
}

function getNestedValue(obj: any, path: string): any {
  if (!obj || !path) return undefined;
  return path.split(".").reduce((acc, key) => acc?.[key], obj);
}
