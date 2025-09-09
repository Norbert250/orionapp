import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Pill, DollarSign, Heart, Activity, Users, FileText, AlertCircle } from 'lucide-react';

interface Medicine {
  id?: number;
  name: string;
  description?: string;
  price?: number;
  dosage?: string;
  frequency?: string;
  duration?: string;
}

interface PrescriptionData {
  medicines?: Medicine[];
  doctor_name?: string;
  patient_name?: string;
  date?: string;
  diagnosis?: string;
}

const MedicineResults: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showSectorModal, setShowSectorModal] = useState(false);
  const [medicamentResults, setMedicamentResults] = useState<any[]>([]);
  const [prescriptionResults, setPrescriptionResults] = useState<PrescriptionData[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);

  const handleSectorSelect = (sector: 'formal' | 'informal') => {
    setShowSectorModal(false);
    navigate(`/loan/request/${sector}`);
  };

  useEffect(() => {
    // Get results from navigation state
    const state = location.state as {
      medicamentResults?: any[];
      prescriptionResults?: PrescriptionData[];
    };

    if (state) {
      console.log('Full state received:', state);
      console.log('Medicament results:', state.medicamentResults);
      console.log('Prescription results:', state.prescriptionResults);
      
      setMedicamentResults(state.medicamentResults || []);
      setPrescriptionResults(state.prescriptionResults || []);
      
      // Process and combine medicines from both sources
      const allMedicines: Medicine[] = [];
      
      // Add medicines from drug analysis
      if (state.medicamentResults) {
        state.medicamentResults.forEach((result) => {
          console.log('Processing medicament result:', result);
          
          // Drugs are inside files array
          if (result.files && result.files.length > 0) {
            result.files.forEach((file: any) => {
              if (file.drugs && file.drugs.length > 0) {
                file.drugs.forEach((drug: any) => {
                  allMedicines.push({
                    id: allMedicines.length + 1,
                    name: drug.drug_name,
                    description: `Manufacturer: ${drug.manufacturer}`,
                    price: drug.estimated_price,
                    manufacturer: drug.manufacturer
                  });
                });
              }
            });
          }
        });
      }
      
      // Add medicines from prescription analysis
      if (state.prescriptionResults) {
        state.prescriptionResults.forEach((result) => {
          console.log('Processing prescription result:', result);
          
          // Prescription drugs are also inside files array
          if (result.files && result.files.length > 0) {
            result.files.forEach((file: any) => {
              if (file.drugs && file.drugs.length > 0) {
                file.drugs.forEach((drug: any) => {
                  allMedicines.push({
                    id: allMedicines.length + 1,
                    name: drug.drug_name,
                    description: `Manufacturer: ${drug.manufacturer}`,
                    price: drug.estimated_price,
                    manufacturer: drug.manufacturer
                  });
                });
              }
            });
          }
        });
      }
      
      setMedicines(allMedicines);
    }
  }, [location.state]);

  const totalCost = medicines.reduce((sum, medicine) => sum + medicine.price, 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <button
          onClick={() => navigate('/assess-medical-needs')}
          className="flex items-center text-muted-foreground hover:text-primary mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Assessment
        </button>

        <div className="bg-card rounded-2xl shadow-sm border border-border p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-card-foreground mb-2">Medicine Analysis Results</h1>
          <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8">Based on your uploaded documents, here are the identified medicines:</p>
          
          {/* Analysis Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-secondary rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Pill className="w-5 h-5 text-secondary-foreground mr-2" />
                <span className="font-semibold text-secondary-foreground">Medicament Analysis</span>
              </div>
              <p className="text-sm text-secondary-foreground/80">
                {medicamentResults.length} image(s) analyzed
              </p>
            </div>
            <div className="bg-accent rounded-lg p-4">
              <div className="flex items-center mb-2">
                <FileText className="w-5 h-5 text-accent-foreground mr-2" />
                <span className="font-semibold text-accent-foreground">Prescription Analysis</span>
              </div>
              <p className="text-sm text-accent-foreground/80">
                {prescriptionResults.length} prescription(s) analyzed
              </p>
            </div>
          </div>

          <div className="space-y-4 sm:space-y-6">
            {medicines.length > 0 ? (
              medicines.map((medicine) => (
                <div key={medicine.id} className="border border-border rounded-xl p-4 sm:p-6 hover:shadow-sm transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-2 sm:mb-3">
                        <Pill className="w-4 h-4 sm:w-5 sm:h-5 text-primary mr-2" />
                        <h3 className="text-lg sm:text-xl font-semibold text-card-foreground">{medicine.name}</h3>
                      </div>
                      <p className="text-sm sm:text-base text-muted-foreground mb-2">{medicine.description}</p>
                      {medicine.manufacturer && medicine.manufacturer !== 'N/A' && (
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                          <span className="bg-secondary px-2 py-1 rounded text-secondary-foreground">
                            Manufacturer: {medicine.manufacturer}
                          </span>
                        </div>
                      )}
                    </div>
                    {medicine.price && (
                      <div className="flex items-center text-chart-2 font-bold text-lg sm:text-xl">
                        <span className="mr-1">KES</span>
                        {medicine.price.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-card-foreground mb-2">No medicines identified</h3>
                <p className="text-muted-foreground">The analysis couldn't identify any medicines from the uploaded images.</p>
              </div>
            )}
          </div>

          {medicines.length > 0 && medicines.some(m => m.price) && (
            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-border">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
                <span className="text-lg sm:text-xl font-semibold text-card-foreground">Estimated Total Cost:</span>
                <span className="text-xl sm:text-2xl font-bold text-chart-2 flex items-center">
                  <span className="mr-2">KES</span>
                  {totalCost.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={() => navigate('/')}
              className="w-full sm:flex-1 bg-secondary text-secondary-foreground py-3 sm:py-3 rounded-xl font-semibold hover:bg-secondary/80 transition-colors text-sm sm:text-base"
            >
              Back to Home
            </button>
            <button
              onClick={() => setShowSectorModal(true)}
              className="group w-full sm:flex-1 bg-primary text-primary-foreground py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg shadow-sm hover:shadow-md transform hover:-translate-y-1 transition-all duration-200 flex items-center justify-center"
            >
              Get Medical Loan
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Sector Selection Modal */}
      {showSectorModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-popover rounded-2xl sm:rounded-3xl shadow-2xl max-w-sm sm:max-w-md w-full p-6 sm:p-8 lg:p-10 transform animate-in fade-in duration-200 border border-border">
            <div className="text-center mb-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-popover-foreground mb-2">Select Your Employment Type</h3>
              <p className="text-sm sm:text-base text-muted-foreground">This helps us customize your medical loan application process</p>
            </div>

            <div className="space-y-3 sm:space-y-4 mb-6">
              <button
                onClick={() => handleSectorSelect('formal')}
                className="w-full p-4 sm:p-6 text-left border-2 border-border rounded-2xl hover:border-primary hover:bg-accent transition-all duration-200 group shadow-sm hover:shadow-md"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center group-hover:bg-secondary/80 transition-colors">
                    <Activity className="w-6 h-6 text-secondary-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-popover-foreground mb-1">Employed/Salaried</div>
                    <div className="text-sm text-muted-foreground">
                      Regular job with salary, bank statements, and payslips available
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleSectorSelect('informal')}
                className="w-full p-4 sm:p-6 text-left border-2 border-border rounded-2xl hover:border-primary hover:bg-accent transition-all duration-200 group shadow-sm hover:shadow-md"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center group-hover:bg-secondary/80 transition-colors">
                    <Users className="w-6 h-6 text-secondary-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-popover-foreground mb-1">Self-Employed/Freelance</div>
                    <div className="text-sm text-muted-foreground">
                      Own business, freelance work, or irregular income
                    </div>
                  </div>
                </div>
              </button>
            </div>

            <button
              onClick={() => setShowSectorModal(false)}
              className="w-full py-2 sm:py-3 text-sm sm:text-base text-muted-foreground hover:text-popover-foreground font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicineResults;