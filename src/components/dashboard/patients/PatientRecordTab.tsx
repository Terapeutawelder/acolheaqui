import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ClipboardList,
  Save,
  Plus,
  X,
  AlertCircle,
  Heart,
  Brain,
  Target,
  FileText,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PatientRecordTabProps {
  patientEmail: string | null;
  patientName: string;
  professionalId: string;
}

interface PatientRecord {
  id?: string;
  chief_complaint: string;
  diagnosis: string;
  treatment_plan: string;
  medications: string[];
  allergies: string[];
  medical_history: string;
  family_history: string;
  observations: string;
  risk_level: "low" | "medium" | "high";
}

const PatientRecordTab = ({
  patientEmail,
  patientName,
  professionalId,
}: PatientRecordTabProps) => {
  const [record, setRecord] = useState<PatientRecord>({
    chief_complaint: "",
    diagnosis: "",
    treatment_plan: "",
    medications: [],
    allergies: [],
    medical_history: "",
    family_history: "",
    observations: "",
    risk_level: "low",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [newMedication, setNewMedication] = useState("");
  const [newAllergy, setNewAllergy] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  // For now, we'll store the record in localStorage since we don't have a dedicated table
  // In a production environment, this would be stored in a database table
  useEffect(() => {
    const key = `patient_record_${professionalId}_${patientEmail || patientName}`;
    const savedRecord = localStorage.getItem(key);
    if (savedRecord) {
      try {
        setRecord(JSON.parse(savedRecord));
      } catch (e) {
        console.error("Error loading patient record:", e);
      }
    }
  }, [patientEmail, patientName, professionalId]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const key = `patient_record_${professionalId}_${patientEmail || patientName}`;
      localStorage.setItem(key, JSON.stringify(record));
      toast.success("Prontuário salvo com sucesso");
      setHasChanges(false);
    } catch (error) {
      console.error("Error saving record:", error);
      toast.error("Erro ao salvar prontuário");
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field: keyof PatientRecord, value: any) => {
    setRecord((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const addMedication = () => {
    if (newMedication.trim()) {
      updateField("medications", [...record.medications, newMedication.trim()]);
      setNewMedication("");
    }
  };

  const removeMedication = (index: number) => {
    updateField(
      "medications",
      record.medications.filter((_, i) => i !== index)
    );
  };

  const addAllergy = () => {
    if (newAllergy.trim()) {
      updateField("allergies", [...record.allergies, newAllergy.trim()]);
      setNewAllergy("");
    }
  };

  const removeAllergy = (index: number) => {
    updateField(
      "allergies",
      record.allergies.filter((_, i) => i !== index)
    );
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "medium":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "high":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with Save Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Prontuário do Paciente</h3>
          {hasChanges && (
            <Badge variant="outline" className="text-yellow-500 border-yellow-500/20">
              Alterações não salvas
            </Badge>
          )}
        </div>
        <Button onClick={handleSave} disabled={isSaving} size="sm">
          <Save className="h-4 w-4 mr-1" />
          {isSaving ? "Salvando..." : "Salvar"}
        </Button>
      </div>

      {/* Risk Level */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Nível de Risco
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={record.risk_level}
            onValueChange={(value: "low" | "medium" | "high") =>
              updateField("risk_level", value)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  Baixo
                </span>
              </SelectItem>
              <SelectItem value="medium">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-500" />
                  Médio
                </span>
              </SelectItem>
              <SelectItem value="high">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  Alto
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Chief Complaint & Diagnosis */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Queixa Principal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={record.chief_complaint}
              onChange={(e) => updateField("chief_complaint", e.target.value)}
              placeholder="Descreva a queixa principal do paciente..."
              rows={3}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Hipótese Diagnóstica
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={record.diagnosis}
              onChange={(e) => updateField("diagnosis", e.target.value)}
              placeholder="CID ou descrição diagnóstica..."
              rows={3}
            />
          </CardContent>
        </Card>
      </div>

      {/* Treatment Plan */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Target className="h-4 w-4" />
            Plano Terapêutico
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={record.treatment_plan}
            onChange={(e) => updateField("treatment_plan", e.target.value)}
            placeholder="Descreva o plano de tratamento, objetivos e estratégias..."
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Medications & Allergies */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Medicações em Uso
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={newMedication}
                onChange={(e) => setNewMedication(e.target.value)}
                placeholder="Nome da medicação..."
                onKeyDown={(e) => e.key === "Enter" && addMedication()}
              />
              <Button size="icon" variant="outline" onClick={addMedication}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {record.medications.map((med, i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className="flex items-center gap-1 pr-1"
                >
                  {med}
                  <button
                    onClick={() => removeMedication(i)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {record.medications.length === 0 && (
                <span className="text-sm text-muted-foreground italic">
                  Nenhuma medicação registrada
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              Alergias
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={newAllergy}
                onChange={(e) => setNewAllergy(e.target.value)}
                placeholder="Adicionar alergia..."
                onKeyDown={(e) => e.key === "Enter" && addAllergy()}
              />
              <Button size="icon" variant="outline" onClick={addAllergy}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {record.allergies.map((allergy, i) => (
                <Badge
                  key={i}
                  variant="destructive"
                  className="flex items-center gap-1 pr-1"
                >
                  {allergy}
                  <button
                    onClick={() => removeAllergy(i)}
                    className="ml-1 hover:opacity-70"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {record.allergies.length === 0 && (
                <span className="text-sm text-muted-foreground italic">
                  Nenhuma alergia registrada
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Medical & Family History */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Histórico Médico</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={record.medical_history}
              onChange={(e) => updateField("medical_history", e.target.value)}
              placeholder="Histórico de doenças, cirurgias, internações..."
              rows={4}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Histórico Familiar</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={record.family_history}
              onChange={(e) => updateField("family_history", e.target.value)}
              placeholder="Doenças familiares relevantes..."
              rows={4}
            />
          </CardContent>
        </Card>
      </div>

      {/* General Observations */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Observações Gerais</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={record.observations}
            onChange={(e) => updateField("observations", e.target.value)}
            placeholder="Outras observações importantes sobre o paciente..."
            rows={4}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientRecordTab;
