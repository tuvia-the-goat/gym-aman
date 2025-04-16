
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { MedicalFormScore } from '../../types';
import FormSection from './FormSection';

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
          <label htmlFor="medicalProfile" className="block text-sm font-medium">
            פרופיל רפואי
          </label>
          <select
            id="medicalProfile"
            value={medicalProfile}
            onChange={(e) => setMedicalProfile(e.target.value)}
            className="input-field"
            required
          >
            <option value="">בחר פרופיל</option>
            <option value="97">97</option>
            <option value="82">82</option>
            <option value="72">72</option>
            <option value="64">64</option>
            <option value="45">45</option>
            <option value="25">25</option>
          </select>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="medicalFormScore" className="block text-sm font-medium">
            ציון שאלון א"ס
          </label>
          <select
            id="medicalFormScore"
            value={medicalFormScore}
            onChange={(e) => setMedicalFormScore(e.target.value as MedicalFormScore | '')}
            className="input-field"
            required
          >
            <option value="">בחר ציון</option>
            <option value="notRequired">לא נזקק/ה למילוי שאלון</option>
            <option value="fullScore">100 נקודות</option>
            <option value="partialScore">פחות מ-100 נקודות</option>
            <option value="reserve">מיל' או אע"צ, מילא/ה שאלון נפרד</option>
          </select>
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
