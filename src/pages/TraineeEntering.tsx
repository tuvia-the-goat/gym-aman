import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { addMonths, compareAsc } from "date-fns";
import {
  AlertCircle,
  CheckCircle,
  Dumbbell,
  LogIn,
  Shield,
  User,
  XCircle
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import backgroundImage from "../assets/gym-with-indoor-cycling-equipment.jpg";
import { useAdmin } from "../context/AdminContext";
import {
  authService,
  baseService,
  entryService,
  traineeService
} from "../services/api";
import {
  Base,
  Trainee,
  PopulatedTrainee
} from "../types";

const TraineeEntering = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [bases, setBases] = useState<Base[]>([]);
  const [selectedBase, setSelectedBase] = useState<Base | null>(null);
  const [entryPersonalId, setEntryPersonalId] = useState("");
  const [confirmingEntry, setConfirmingEntry] = useState(false);
  const [entryTrainee, setEntryTrainee] = useState<PopulatedTrainee | null>(null);
  const [traineeMedicalExpirationDate, setTraineeMedicalExpirationDate] =
    useState<Date | null>(null);

  const baseFromStorage = localStorage.getItem("base");

  useEffect(() => {
    const fetchBases = async () => {
      if (!baseFromStorage && !selectedBase) {
        try {
          const fetchedBases = await baseService.getAll();
          setBases(fetchedBases);
        } catch (error) {
          toast({
            title: "שגיאה",
            description: "אירעה שגיאה בטעינת הבסיסים",
            variant: "destructive",
          });
        }
      }
    };
    fetchBases();
  }, [baseFromStorage, selectedBase, toast]);

  useEffect(() => {
    const fetchBase = async () => {
      if (baseFromStorage) {
        try {
          const base = await baseService.getById(baseFromStorage);
          setSelectedBase(base);
        } catch (error) {
          toast({
            title: "שגיאה",
            description: "אירעה שגיאה בטעינת הבסיס",
            variant: "destructive",
          });
        }
      } else {
        setSelectedBase(null);
      }
    };
    fetchBase();
  }, [baseFromStorage, toast]);

  useEffect(() => {
    window.history.pushState(null, "", window.location.pathname);
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.pathname);
    };
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);



  const validatePersonalId = (id: string) => {
    return /^\d{7}$/.test(id);
  };



  const getDateFormat = (dateToFormat: Date) => {
    const day = dateToFormat.getDate();
    const month = dateToFormat.getMonth() + 1;
    const year = dateToFormat.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handlePersonalIdCheck = async () => {
    if (!validatePersonalId(entryPersonalId)) {
      toast({
        title: "שגיאה",
        description: "מספר אישי חייב להיות בדיוק 7 ספרות",
        variant: "destructive",
      });
      return;
    }
    try {
      const trainee = await traineeService.getByPersonalId(entryPersonalId);
      if (!trainee) {
        handleNotRegisteredEntry();
        return;
      }
      setEntryTrainee(trainee);
      setTraineeMedicalExpirationDate(
        trainee.medicalApproval.expirationDate
          ? new Date(trainee.medicalApproval.expirationDate)
          : null
      );
      setConfirmingEntry(true);
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בחיפוש המתאמן",
        variant: "destructive",
      });
    }
  };

  const handleNotRegisteredEntry = async () => {
    if (!selectedBase) return;
    try {
      const today = new Date().toISOString().split("T")[0];
      const currentTime = new Date().toTimeString().split(" ")[0];
      const newEntry = await entryService.createNonRegistered({
        entryDate: today,
        entryTime: currentTime,
        traineePersonalId: entryPersonalId,
        baseId: selectedBase._id,
        status: "notRegistered",
      });
      toast({
        title: "משתמש לא רשום",
        description:
          'נרשמה כניסה למשתמש לא רשום. יש לבצע רישום למערכת אצל המד"ג/ית.',
        variant: "destructive",
      });
    } catch (error: any) {
      toast({
        title: "שגיאה",
        description:
          error.response?.data?.message || "אירעה שגיאה בעת רישום הכניסה",
        variant: "destructive",
      });
    } finally {
      setEntryPersonalId("");
    }
  };

  const isMedicalAboutToExpire = () => {
    if (!traineeMedicalExpirationDate) return false;
    const oneMonthFromNow = addMonths(new Date(), 1);
    return (
      compareAsc(traineeMedicalExpirationDate, new Date()) >= 0 &&
      compareAsc(traineeMedicalExpirationDate, oneMonthFromNow) <= 0
    );
  };

  const handleEntryConfirmation = async () => {
    if (!entryTrainee || !selectedBase) return;

    const isMedicalApprovalValid =
      entryTrainee.medicalApproval.approved &&
      (!entryTrainee.medicalApproval.expirationDate ||
        new Date(entryTrainee.medicalApproval.expirationDate) >= new Date());

    if (!isMedicalApprovalValid) {
      try {
        const today = new Date().toISOString().split("T")[0];
        const currentTime = new Date().toTimeString().split(" ")[0];
        const newEntry = await entryService.create({
          traineeId: entryTrainee._id,
          entryDate: today,
          entryTime: currentTime,
          traineeFullName: entryTrainee.fullName,
          traineePersonalId: entryTrainee.personalId,
          departmentId: entryTrainee.departmentId._id,
          subDepartmentId: entryTrainee.subDepartmentId?._id,
          baseId: selectedBase._id,
          status: "noMedicalApproval",
        });

        toast({
          title: "אישור רפואי נדרש",
          description: "לא ניתן לרשום כניסה ללא אישור רפואי בתוקף",
          variant: "destructive",
        });
      } catch (error: any) {
        toast({
          title: "שגיאה",
          description:
            error.response?.data?.message || "אירעה שגיאה בעת רישום הכניסה",
          variant: "destructive",
        });
      } finally {
        setConfirmingEntry(false);
        setEntryTrainee(null);
        setEntryPersonalId("");
      }
      return;
    }

    // Check if trainee's base matches selected base
    if (entryTrainee.baseId._id !== selectedBase._id) {
      try {
        const today = new Date().toISOString().split("T")[0];
        const currentTime = new Date().toTimeString().split(" ")[0];
        const newEntry = await entryService.create({
          traineeId: entryTrainee._id,
          entryDate: today,
          entryTime: currentTime,
          traineeFullName: entryTrainee.fullName,
          traineePersonalId: entryTrainee.personalId,
          departmentId: entryTrainee.departmentId._id,
          subDepartmentId: entryTrainee.subDepartmentId?._id,
          baseId: selectedBase._id,
          status: "notAssociated",
        });

        toast({
          title: "כניסה נרשמה בהצלחה",
          description: `${entryTrainee.fullName} נרשם/ה בהצלחה`,
          variant: "successful",
        });
      } catch (error: any) {
        toast({
          title: "שגיאה",
          description:
            error.response?.data?.message || "אירעה שגיאה בעת רישום הכניסה",
          variant: "destructive",
        });
      } finally {
        setConfirmingEntry(false);
        setEntryTrainee(null);
        setEntryPersonalId("");
      }
      return;
    }

    try {
      const today = new Date().toISOString().split("T")[0];
      const currentTime = new Date().toTimeString().split(" ")[0];
      const newEntry = await entryService.create({
        traineeId: entryTrainee._id,
        entryDate: today,
        entryTime: currentTime,
        traineeFullName: entryTrainee.fullName,
        traineePersonalId: entryTrainee.personalId,
        departmentId: entryTrainee.departmentId._id,
        subDepartmentId: entryTrainee.subDepartmentId?._id,
        baseId: selectedBase._id,
        status: "success",
      });
      toast({
        title: "כניסה נרשמה בהצלחה",
        description: `${entryTrainee.fullName} נרשם/ה בהצלחה`,
        variant: "successful",
      });
    } catch (error: any) {
      toast({
        title: "שגיאה",
        description:
          error.response?.data?.message || "אירעה שגיאה בעת רישום הכניסה",
        variant: "destructive",
      });
    } finally {
      setConfirmingEntry(false);
      setEntryTrainee(null);
      setEntryPersonalId("");
    }
  };


  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Background image with overlay */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Overlay div to control opacity */}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="bg-blue-500/70 text-primary-foreground py-4 px-6 shadow-md">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-3 space-x-reverse">
              <Dumbbell className="h-6 w-6" />
              <h1 className="text-2xl font-bold">מערכת אימ"ון</h1>
            </div>
                <div className="flex justify-center gap-6">
                  <img src="/amanLogo.png" alt="Aman Logo" className="h-16" />
                  <img src="/artechLogo.png" alt="Artech Logo" className="h-16" />
                  <img src="/hadrahaLogo.png" alt="Hadraha Logo" className="h-16" />
                </div>
              <Button
                onClick={() => navigate("/login")}
                variant="ghost"
                className="text-primary-foreground bg-primary-foreground/20 hover:bg-primary-foreground/10"
              >
                <LogIn className="ml-2 h-4 w-4" />
                התחברות מנהלים
              </Button>
            </div>
        </header>
        <main className="flex-1 container mx-auto px-6 py-8 max-w-5xl">
          <div className="max-w-4xl mx-auto">
            {!baseFromStorage && !selectedBase && (
              <div className="glass p-8 rounded-2xl mb-8 animate-scale-in">
                <h2 className="text-2xl font-bold mb-6 text-center">
                  בחר בסיס לרישום
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {bases.map((base) => (
                    <button
                      key={base._id}
                      onClick={() => {
                        setSelectedBase(base);
                        localStorage.setItem("base", base?._id);
                      }}
                      className="bg-card hover:bg-card/80 p-6 rounded-xl text-center hover:-translate-y-1 transition-all duration-300 shadow-md hover:shadow-lg border border-border/30"
                    >
                      <h3 className="text-xl font-semibold mb-2">
                        {base.name}
                      </h3>
                      <p className="text-muted-foreground">{base.location}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedBase && (
              <div className="space-y-3">
                <div className="text-center">
                  <span className="inline-block px-4 py-1 bg-white/10 text-white rounded-full text-sm font-medium mb-1">
                    בסיס: {selectedBase.name}
                  </span>
                </div>


                {(
                  <div className="glass max-w-xl mx-auto p-6 rounded-2xl animate-fade-up shadow-lg border border-border/30">
                    <h3 className="text-xl font-bold mb-6 text-center flex items-center justify-center">
                      <LogIn className="ml-2 h-5 w-5 text-primary" />
                      רישום כניסה לחדר כושר
                    </h3>

                    {!confirmingEntry ? (
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label
                            htmlFor="entryPersonalId"
                            className="block text-sm font-medium"
                          >
                            מספר אישי (7 ספרות)
                          </label>
                          <div className="relative">
                            <Input
                              id="entryPersonalId"
                              type="text"
                              inputMode="numeric"
                              value={entryPersonalId}
                              onChange={(e) => {
                                const value = e.target.value
                                  .replace(/\D/g, "")
                                  .slice(0, 7);
                                setEntryPersonalId(value);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handlePersonalIdCheck();
                                }
                              }}
                              className="input-field pr-10"
                              placeholder="הזן את מספרך האישי"
                              required
                              autoComplete="off"
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                              <User className="h-5 w-5 text-muted-foreground" />
                            </div>
                          </div>
                        </div>

                        <Button
                          onClick={handlePersonalIdCheck}
                          className="w-full"
                          size="lg"
                        >
                          בדוק
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {entryTrainee && (
                          <>
                            <div className="text-center mb-6">
                              <div className="inline-flex justify-center items-center bg-primary/10 rounded-full w-16 h-16 mb-3">
                                <User className="h-8 w-8 text-primary" />
                              </div>
                              <p className="text-lg">האם שמך הוא</p>
                              <p className="text-2xl font-bold">
                                {entryTrainee?.fullName}?
                              </p>
                            </div>

                            <div className="p-5 rounded-lg bg-card border border-border">
                              <h4 className="font-semibold text-lg mb-3 flex items-center">
                                <Shield className="h-5 w-5 ml-2 text-primary" />
                                הצהרת כשירות לאימון בחדר כושר
                              </h4>
                              <p className="mb-3">אני מצהיר/ה בזאת כי:</p>
                              <ul className="space-y-2 text-sm">
                                <li className="flex items-start">
                                  <CheckCircle className="h-4 w-4 ml-2 mt-0.5 text-primary shrink-0" />
                                  <span>המספר האישי והשם הנ"ל שייכים לי.</span>
                                </li>
                                <li className="flex items-start">
                                  <CheckCircle className="h-4 w-4 ml-2 mt-0.5 text-primary shrink-0" />
                                  <span>
                                    בחתימתי הנני מתחייב{" "}
                                    <b>שקראתי את התדריך למתאמן ואעמוד בו.</b>
                                  </span>
                                </li>
                                <li className="flex items-start">
                                  <CheckCircle className="h-4 w-4 ml-2 mt-0.5 text-primary shrink-0" />
                                  <span>
                                    הנני כשיר לאימון כולל תרגילי כוח ופעילות
                                    אירובית.
                                    <b>
                                      {" "}
                                      לא ידוע לי בעיה רפואית ממנה אני סובל{" "}
                                    </b>
                                    כגון בעיות לב, לחץ דם, סכרת, עודף שומנים
                                    בדם, כאבים בגזה, התעלפויות, הפרעה בשיווי
                                    משקל, סחרחורות, דופק מואץ, קוצר נשימה,
                                    צפצופים בנשימה, אסתמה או אירוע חריג אחר.
                                    <b>
                                      {" "}
                                      כמו כן, אינני נוטל תרופות או סובל ממחלות
                                      כרוניות
                                    </b>{" "}
                                    הפוגעות ביכולתי להתאמן.{" "}
                                  </span>
                                </li>
                                <li className="flex items-start">
                                  <CheckCircle className="h-4 w-4 ml-2 mt-0.5 text-primary shrink-0" />
                                  <span>
                                    בכל מקרה של הופעת הסימנים הבאים- כאב או לחץ
                                    בחזה, ביד או בלסת, קוצר נשימה, תחושת עילפון,
                                    סחרחורת- אפסיק את האימון באופן מידי ואפנה
                                    להתייעצות רפואית.
                                  </span>
                                </li>
                                <li className="flex items-start">
                                  <CheckCircle className="h-4 w-4 ml-2 mt-0.5 text-primary shrink-0" />
                                  <span>
                                    בחתימתי בכניסה לחד"כ אני מצהירה כי{" "}
                                    <b>
                                      נמצא בידיי אישור רופא לביצוע פ"ג ואני כשיר
                                      לבצע אימון
                                    </b>{" "}
                                    בחדר כושר.
                                  </span>
                                </li>
                                <li className="flex items-start">
                                  <b>
                                    מתאמן- גלה אחריות למצבך הרפואי והימנע מסיכון
                                    בריאותי!
                                  </b>
                                </li>
                              </ul>
                              <p className="mt-3 text-sm font-medium text-primary">
                                לחיצה על כפתור "רישום כניסה" מהווה אישור של
                                ההצהרה הרפואית למעלה
                              </p>
                            </div>

                            {isMedicalAboutToExpire() &&
                              entryTrainee.medicalApproval.approved && (
                                <div className="p-4 border-2 border-amber-400 bg-amber-50 rounded-lg flex items-start">
                                  <AlertCircle className="h-5 w-5 text-amber-500 mr-1 ml-2 shrink-0 mt-0.5" />
                                  <div className="text-amber-800">
                                    <p className="font-semibold">
                                      שימ/י לב! תוקף האישור הרפואי שלך יפוג ב-
                                      {getDateFormat(
                                        traineeMedicalExpirationDate!
                                      )}
                                    </p>
                                    <p className="text-sm">
                                      יש לחדש אותו בהקדם בברקוד הייעודי ולעדכן
                                      את צוות חדר הכושר.
                                    </p>
                                  </div>
                                </div>
                              )}

                            <div className="flex space-x-4 gap-4 mt-4">
                              <Button
                                onClick={() => {
                                  setConfirmingEntry(false);
                                  setEntryTrainee(null);
                                  setEntryPersonalId("");
                                }}
                                variant="outline"
                                className="flex-1"
                              >
                                <XCircle className="ml-2 h-4 w-4" />
                                ביטול
                              </Button>
                              <Button
                                onClick={handleEntryConfirmation}
                                className="flex-1"
                              >
                                <CheckCircle className="ml-2 h-4 w-4" />
                                רישום כניסה
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default TraineeEntering;
