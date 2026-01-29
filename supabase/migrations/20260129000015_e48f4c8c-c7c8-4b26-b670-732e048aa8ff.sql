-- Create automation_flows table to store automation configurations
CREATE TABLE public.automation_flows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL,
  name TEXT NOT NULL DEFAULT 'Novo Fluxo',
  description TEXT,
  nodes JSONB NOT NULL DEFAULT '[]'::jsonb,
  edges JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT false,
  trigger_type TEXT, -- 'keyword', 'event', 'webhook', 'schedule'
  trigger_config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create automation_executions table to track flow executions
CREATE TABLE public.automation_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  flow_id UUID NOT NULL REFERENCES public.automation_flows(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL,
  trigger_data JSONB DEFAULT '{}'::jsonb,
  current_node_id TEXT,
  execution_state JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed', 'waiting_input'
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create automation_execution_logs for detailed step tracking
CREATE TABLE public.automation_execution_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  execution_id UUID NOT NULL REFERENCES public.automation_executions(id) ON DELETE CASCADE,
  node_id TEXT NOT NULL,
  node_type TEXT NOT NULL,
  input_data JSONB DEFAULT '{}'::jsonb,
  output_data JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'success', -- 'success', 'failed', 'skipped'
  error_message TEXT,
  executed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.automation_flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_execution_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for automation_flows
CREATE POLICY "Professionals can view their own flows"
  ON public.automation_flows FOR SELECT
  USING (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Professionals can insert their own flows"
  ON public.automation_flows FOR INSERT
  WITH CHECK (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Professionals can update their own flows"
  ON public.automation_flows FOR UPDATE
  USING (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Professionals can delete their own flows"
  ON public.automation_flows FOR DELETE
  USING (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- RLS Policies for automation_executions
CREATE POLICY "Professionals can view their own executions"
  ON public.automation_executions FOR SELECT
  USING (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Professionals can insert their own executions"
  ON public.automation_executions FOR INSERT
  WITH CHECK (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Professionals can update their own executions"
  ON public.automation_executions FOR UPDATE
  USING (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- RLS Policies for automation_execution_logs
CREATE POLICY "Professionals can view their execution logs"
  ON public.automation_execution_logs FOR SELECT
  USING (execution_id IN (
    SELECT id FROM automation_executions 
    WHERE professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  ));

-- Create trigger for updated_at
CREATE TRIGGER update_automation_flows_updated_at
  BEFORE UPDATE ON public.automation_flows
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();