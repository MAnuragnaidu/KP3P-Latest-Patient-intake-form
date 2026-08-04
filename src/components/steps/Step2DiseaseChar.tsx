import { FormData } from '@/lib/formSchema';
import {
  applyNoneExclusiveToggle,
  isNoneExclusiveOptionDisabled,
  NONE_EXCLUSIVE_OPTION,
} from '@/lib/noneExclusiveMultiSelect';
import { PREVIOUS_IBD_SURGERY_OPTIONS } from '@/lib/previousIbdSurgeries';
import Step8Vaccination from './Step8Vaccination';

interface Props { formData: FormData; onChange: (f: string, v: any) => void; errors: Record<string,string>; }

const Fg = ({ id, label, required, error, children }: { id:string;label:string;required?:boolean;error?:string;children:React.ReactNode }) => (
  <div className="fg">
    <label htmlFor={id}>{label}{required && <span className="req">*</span>}</label>
    {children}
    {error && <span className="ferr">{error}</span>}
  </div>
);

const Radio = ({ name, value, label, checked, onChange }: { name:string;value:string;label:string;checked:boolean;onChange:()=>void }) => (
  <label className={`radio-opt${checked?' selected':''}`}>
    <input type="radio" name={name} value={value} checked={checked} onChange={onChange} />{label}
  </label>
);

const Check = ({ value, label, checked, onChange, disabled }: {
  value: string; label: string; checked: boolean; onChange: () => void; disabled?: boolean;
}) => (
  <label className={`check-opt${checked ? ' checked' : ''}${disabled ? ' disabled' : ''}`}>
    <input type="checkbox" value={value} checked={checked} disabled={disabled} onChange={onChange} />{label}
  </label>
);

const DURATIONS = ['<3 months','3–12 months','1–2 years','2–5 years','5–10 years','>10 years'];

export default function Step2DiseaseChar({ formData: d, onChange, errors: e }: Props) {
  const handleSurgeryToggle = (opt: string) => {
    onChange('previousSurgeries', applyNoneExclusiveToggle(d.previousSurgeries, opt, true));
  };

  return (
    <div className="form-grid">
      <Fg id="primaryDiagnosis" label="Primary Diagnosis" required error={e.primaryDiagnosis}>
        <div className="radio-group">
          {['Ulcerative Colitis','Crohn\'s Disease','IBD-U'].map(opt => (
            <Radio key={opt} name="primaryDiagnosis" value={opt} label={opt}
              checked={d.primaryDiagnosis === opt} onChange={() => onChange('primaryDiagnosis', opt)} />
          ))}
        </div>
      </Fg>

      <Fg id="diseaseDuration" label="Disease Duration" required error={e.diseaseDuration}>
        <select id="diseaseDuration" className={`fi${e.diseaseDuration?' err':''}`}
          value={d.diseaseDuration} onChange={x => onChange('diseaseDuration', x.target.value)}>
          <option value="">Select duration…</option>
          {DURATIONS.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </Fg>

      <div className="span-2">
        <Fg id="montrealClass" label="Montreal Classification" error={e.montrealClass}>
          <input id="montrealClass" type="text" className="fi"
            value={d.montrealClass} onChange={x => onChange('montrealClass', x.target.value)}
            placeholder="e.g. UC: E2 (Left-sided) or CD: L1, B1" />
        </Fg>
      </div>

      <div className="span-2">
        <Fg id="previousSurgeries" label="Previous IBD Surgeries (select all that apply)" error={e.previousSurgeries}>
          <div className="check-group">
            {PREVIOUS_IBD_SURGERY_OPTIONS.map(opt => (
              <Check key={opt} value={opt} label={opt}
                checked={d.previousSurgeries.includes(opt)}
                disabled={isNoneExclusiveOptionDisabled(opt, d.previousSurgeries, NONE_EXCLUSIVE_OPTION)}
                onChange={() => handleSurgeryToggle(opt)} />
            ))}
          </div>
        </Fg>
      </div>

      <div className="span-2">
        <Fg id="perianalDiseaseAssessment" label="Perianal Disease Assessment" error={e.perianalDiseaseAssessment}>
          <textarea id="perianalDiseaseAssessment" className="fi"
            value={d.perianalDiseaseAssessment} onChange={x => onChange('perianalDiseaseAssessment', x.target.value)}
            placeholder="Describe any perianal disease, fistulas, abscesses, etc." />
        </Fg>
      </div>
      
      <div className="span-2 mt-8">
        <h3 className="text-xl font-semibold mb-4 text-white">Vaccination History</h3>
        <Step8Vaccination formData={d} onChange={onChange} errors={e} />
      </div>
    </div>
  );
}
