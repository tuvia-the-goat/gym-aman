
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { MedicalFormScore } from '../../types';
import FormSection from './FormSection';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MedicalDetailsSectionProps {
  medicalProfile: string;
  setMedicalProfile: (profile: string) => void;
  medicalFormScore: MedicalFormScore | '';
  setMedicalFormScore: (score: MedicalFormScore | '') => void;
  medicalCertificateProvided: boolean;
  setMedicalCertificateProvided: (provided: boolean) => void;
  orthopedicCondition: boolean;
  setOrthopedicCondition: (condition: boolean) => void;
  medicalLimitation: string;
  setMedicalLimitation: (limitation: string) => void;
}

const MedicalDetailsSection = ({
  medicalProfile,
  setMedicalProfile,
  medicalFormScore,
  setMedicalFormScore,
  medicalCertificateProvided,
  setMedicalCertificateProvided,
  orthopedicCondition,
  setOrthopedicCondition,
  medicalLimitation,
  setMedicalLimitation
}: MedicalDetailsSectionProps) => {
  return (
    <FormSection title="פרטים רפואיים">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
  <label htmlFor="medicalProfile" className="block text-sm font-medium text-black">
    פרופיל רפואי
  </label>
  <Select
    value={medicalProfile}
    onValueChange={(value) => value === "select_profile" ?setMedicalProfile(""):setMedicalProfile(value)}
    required
  >
    <SelectTrigger className="input-field w-full text-black">
      <SelectValue placeholder="בחר פרופיל" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="select_profile" className="flex justify-end text-black">בחר פרופיל</SelectItem>
      <SelectItem value="97" className="flex justify-end text-black">97</SelectItem>
      <SelectItem value="82" className="flex justify-end text-black">82</SelectItem>
      <SelectItem value="72" className="flex justify-end text-black">72</SelectItem>
      <SelectItem value="64" className="flex justify-end text-black">64</SelectItem>
      <SelectItem value="45" className="flex justify-end text-black">45</SelectItem>
      <SelectItem value="25" className="flex justify-end text-black">25</SelectItem>
    </SelectContent>
  </Select>
</div>

<div className="space-y-2">
  <label htmlFor="medicalFormScore" className="block text-sm font-medium text-black">
    ציון שאלון א"ס
  </label>
  <Select
    value={medicalFormScore}
    onValueChange={(value) => value === "select_score" ?setMedicalFormScore(""):setMedicalFormScore(value as MedicalFormScore)}
    required
  >
    <SelectTrigger className="input-field w-full text-black">
      <SelectValue placeholder="בחר ציון" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="select_score" className="flex justify-end text-black">בחר ציון</SelectItem>
      <SelectItem value="notRequired" className="flex justify-end text-black">לא נזקק/ה למילוי שאלון</SelectItem>
      <SelectItem value="fullScore" className="flex justify-end text-black">100 נקודות</SelectItem>
      <SelectItem value="partialScore" className="flex justify-end text-black">פחות מ-100 נקודות</SelectItem>
      <SelectItem value="reserve" className="flex justify-end text-black">מיל' או אע"צ, מילא/ה שאלון נפרד</SelectItem>
    </SelectContent>
  </Select>
</div>
        
        {medicalFormScore === 'partialScore' && (
          <div className="space-y-2">
            <label htmlFor="medicalCertificateProvided" className="block text-sm font-medium">
              האם הוצג אישור רפואי?
            </label>
            <div className="flex items-center space-x-4">
              <div className="flex items-center ml-4">
                <input
                  type="radio"
                  id="certificateYes"
                  name="medicalCertificate"
                  checked={medicalCertificateProvided}
                  onChange={() => setMedicalCertificateProvided(true)}
                  className="ml-2"
                />
                <label htmlFor="certificateYes" className="text-sm">
                  כן
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="certificateNo"
                  name="medicalCertificate"
                  checked={!medicalCertificateProvided}
                  onChange={() => setMedicalCertificateProvided(false)}
                  className="ml-2"
                />
                <label htmlFor="certificateNo" className="text-sm">
                  לא
                </label>
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-2 md:col-span-2">
          <div className="flex items-center">
            <input
              id="orthopedicCondition"
              type="checkbox"
              checked={orthopedicCondition}
              onChange={(e) => setOrthopedicCondition(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="orthopedicCondition" className="text-sm font-medium mr-2">
              מעוניין להצהיר על כך שקיים סעיף פרופיל אורטופדי
            </label>
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label htmlFor="medicalLimitation" className="block text-sm font-medium">
            מגבלה רפואית
          </label>
          <Textarea
            id="medicalLimitation"
            value={medicalLimitation}
            onChange={(e) => setMedicalLimitation(e.target.value)}
            className="input-field min-h-[80px]"
            placeholder="הזן מגבלות רפואיות אם קיימות"
          />
        </div>
      </div>
    </FormSection>
  );
};

export default MedicalDetailsSection;
