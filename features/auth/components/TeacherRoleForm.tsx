"use client";

import { useState } from "react";
import { PlusCircle, X, GraduationCap, BookOpen, Clock, Plus, Trash2, Copy, ArrowRight, ArrowLeft, AlertCircle } from "lucide-react";

interface TimeBlock {
  start: string;
  end: string;
}

interface DaySchedule {
  [key: string]: TimeBlock[];
}

interface TeacherRoleFormProps {
  formData: {
    education: string[];
    experience: string[];
    work_hours?: {
      schedule: DaySchedule;
    };
  };
  setFormData: (data: any) => void;
  onBack: () => void;
  onNext: () => void;
  errors?: Record<string, string>;
}

const isTimeOverlapping = (block1: TimeBlock, block2: TimeBlock): boolean => {
  const start1 = new Date(`2000/01/01 ${block1.start}`);
  const end1 = new Date(`2000/01/01 ${block1.end}`);
  const start2 = new Date(`2000/01/01 ${block2.start}`);
  const end2 = new Date(`2000/01/01 ${block2.end}`);

  return (start1 < end2 && end1 > start2);
};

const hasOverlap = (blocks: TimeBlock[], newBlock: TimeBlock, excludeIndex?: number): boolean => {
  return blocks.some((block, index) => {
    if (excludeIndex !== undefined && index === excludeIndex) return false;
    return isTimeOverlapping(block, newBlock);
  });
};

const findNextAvailableSlot = (blocks: TimeBlock[]): TimeBlock => {
  if (blocks.length === 0) return { start: "09:00", end: "10:00" };

  // Sort blocks by start time
  const sortedBlocks = [...blocks].sort((a, b) => {
    return new Date(`2000/01/01 ${a.start}`).getTime() - new Date(`2000/01/01 ${b.start}`).getTime();
  });

  // Find the first gap between blocks
  for (let i = 0; i < sortedBlocks.length - 1; i++) {
    const currentEnd = new Date(`2000/01/01 ${sortedBlocks[i].end}`);
    const nextStart = new Date(`2000/01/01 ${sortedBlocks[i + 1].start}`);
    
    // If there's at least a 1-hour gap
    if ((nextStart.getTime() - currentEnd.getTime()) >= 3600000) {
      const start = currentEnd.toTimeString().slice(0, 5);
      const end = new Date(currentEnd.getTime() + 3600000).toTimeString().slice(0, 5);
      return { start, end };
    }
  }

  // If no gaps found, add after the last block
  const lastBlock = sortedBlocks[sortedBlocks.length - 1];
  const lastEnd = new Date(`2000/01/01 ${lastBlock.end}`);
  const start = lastEnd.toTimeString().slice(0, 5);
  const end = new Date(lastEnd.getTime() + 3600000).toTimeString().slice(0, 5);
  
  // If end would be past midnight, suggest early morning next day
  if (end < start) {
    return { start: "07:00", end: "08:00" };
  }

  return { start, end };
};

export function TeacherRoleForm({ 
  formData, 
  setFormData, 
  onBack, 
  onNext,
  errors = {}
}: TeacherRoleFormProps) {
  const [educationItem, setEducationItem] = useState("");
  const [experienceItem, setExperienceItem] = useState("");
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [timeError, setTimeError] = useState<string | null>(null);
  
  const daysOfWeek = [
    { id: 'mon', label: 'Pirmdiena', shortLabel: 'P' },
    { id: 'tue', label: 'Otrdiena', shortLabel: 'O' },
    { id: 'wed', label: 'Trešdiena', shortLabel: 'T' },
    { id: 'thu', label: 'Ceturtdiena', shortLabel: 'C' },
    { id: 'fri', label: 'Piektdiena', shortLabel: 'Pk' },
    { id: 'sat', label: 'Sestdiena', shortLabel: 'S' },
    { id: 'sun', label: 'Svētdiena', shortLabel: 'Sv' }
  ];

  const handleAddEducation = () => {
    if (educationItem.trim() && !formData.education.includes(educationItem.trim())) {
      setFormData({
        ...formData,
        education: [...formData.education, educationItem.trim()]
      });
      setEducationItem("");
    }
  };

  const handleAddExperience = () => {
    if (experienceItem.trim() && !formData.experience.includes(experienceItem.trim())) {
      setFormData({
        ...formData,
        experience: [...formData.experience, experienceItem.trim()]
      });
      setExperienceItem("");
    }
  };

  const handleAddTimeBlock = (dayId: string) => {
    const currentSchedule = formData.work_hours?.schedule || {};
    const dayBlocks = currentSchedule[dayId] || [];
    
    const newBlock = findNextAvailableSlot(dayBlocks);
    
    if (hasOverlap(dayBlocks, newBlock)) {
      setTimeError("Nav pieejamu laika intervālu šajā dienā");
      return;
    }

    setTimeError(null);
    setFormData({
      ...formData,
      work_hours: {
        ...formData.work_hours,
        schedule: {
          ...currentSchedule,
          [dayId]: [...dayBlocks, newBlock].sort((a, b) => 
            new Date(`2000/01/01 ${a.start}`).getTime() - new Date(`2000/01/01 ${b.start}`).getTime()
          )
        }
      }
    });
  };

  const handleUpdateTimeBlock = (dayId: string, blockIndex: number, field: 'start' | 'end', value: string) => {
    const currentSchedule = formData.work_hours?.schedule || {};
    const dayBlocks = [...(currentSchedule[dayId] || [])];
    
    const updatedBlock = {
      ...dayBlocks[blockIndex],
      [field]: value
    };

    // Validate the time range
    const start = new Date(`2000/01/01 ${updatedBlock.start}`);
    const end = new Date(`2000/01/01 ${updatedBlock.end}`);
    
    if (end <= start) {
      setTimeError("Beigu laikam jābūt vēlākam par sākuma laiku");
      return;
    }

    // Check for overlaps with other blocks
    if (hasOverlap(dayBlocks, updatedBlock, blockIndex)) {
      setTimeError("Laika intervāls pārklājas ar citu bloku");
      return;
    }

    setTimeError(null);
    dayBlocks[blockIndex] = updatedBlock;

    // Sort blocks by start time
    const sortedBlocks = dayBlocks.sort((a, b) => 
      new Date(`2000/01/01 ${a.start}`).getTime() - new Date(`2000/01/01 ${b.start}`).getTime()
    );

    setFormData({
      ...formData,
      work_hours: {
        ...formData.work_hours,
        schedule: {
          ...currentSchedule,
          [dayId]: sortedBlocks
        }
      }
    });
  };

  const handleRemoveTimeBlock = (dayId: string, blockIndex: number) => {
    const currentSchedule = formData.work_hours?.schedule || {};
    const dayBlocks = currentSchedule[dayId].filter((_, idx) => idx !== blockIndex);

    setFormData({
      ...formData,
      work_hours: {
        ...formData.work_hours,
        schedule: {
          ...currentSchedule,
          [dayId]: dayBlocks
        }
      }
    });
  };

  const copyScheduleToDay = (fromDayId: string, toDayId: string) => {
    const currentSchedule = formData.work_hours?.schedule || {};
    const sourceBlocks = currentSchedule[fromDayId] || [];
    
    setFormData({
      ...formData,
      work_hours: {
        ...formData.work_hours,
        schedule: {
          ...currentSchedule,
          [toDayId]: [...sourceBlocks]
        }
      }
    });
  };

  const copyScheduleToAllDays = (fromDayId: string) => {
    const currentSchedule = formData.work_hours?.schedule || {};
    const sourceBlocks = currentSchedule[fromDayId] || [];
    
    const newSchedule = daysOfWeek.reduce((acc, day) => {
      if (day.id !== fromDayId) {
        acc[day.id] = [...sourceBlocks];
      } else {
        acc[day.id] = currentSchedule[fromDayId] || [];
      }
      return acc;
    }, {} as DaySchedule);

    setFormData({
      ...formData,
      work_hours: {
        ...formData.work_hours,
        schedule: newSchedule
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Education */}
      <div className="p-4 bg-base-200 rounded-lg border border-base-300">
        <h3 className="font-medium mb-1 flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-secondary" />
          <span>Izglītība</span>
        </h3>
        <p className="text-sm text-base-content/70 mb-4">
          Pievienojiet informāciju par savu izglītību un kvalifikāciju.
        </p>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              spellCheck="false"
              className={`input input-bordered flex-1 ${errors.education ? 'input-error' : ''}`}
              value={educationItem}
              onChange={(e) => setEducationItem(e.target.value)}
              placeholder="Piem., Bakalaura grāds matemātikā"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddEducation();
                }
              }}
            />
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleAddEducation}
            >
              <PlusCircle size={18} />
              <span className="hidden sm:inline">Pievienot</span>
            </button>
          </div>
          
          {errors.education && (
            <p className="text-error text-sm">{errors.education}</p>
          )}
          
          {formData.education.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {formData.education.map((edu, i) => (
                <div key={i} className="badge gap-1 p-3 bg-base-100">
                  <span>{edu}</span>
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs btn-circle"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        education: formData.education.filter((_, idx) => idx !== i)
                      });
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-4 text-center text-base-content/50 text-sm border border-dashed border-base-content/20 rounded-lg">
              Pievienojiet vismaz vienu izglītības ierakstu
            </div>
          )}
        </div>
      </div>

      {/* Experience */}
      <div className="p-4 bg-base-200 rounded-lg border border-base-300">
        <h3 className="font-medium mb-1 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-secondary" />
          <span>Pieredze</span>
        </h3>
        <p className="text-sm text-base-content/70 mb-4">
          Aprakstiet savu darba pieredzi un citu relevantu pieredzi.
        </p>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              spellCheck="false"
              className={`input input-bordered flex-1 ${errors.experience ? 'input-error' : ''}`}
              value={experienceItem}
              onChange={(e) => setExperienceItem(e.target.value)}
              placeholder="Piem., 5 gadi skolā kā matemātikas skolotājs"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddExperience();
                }
              }}
            />
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleAddExperience}
            >
              <PlusCircle size={18} />
              <span className="hidden sm:inline">Pievienot</span>
            </button>
          </div>
          
          {errors.experience && (
            <p className="text-error text-sm">{errors.experience}</p>
          )}
          
          {formData.experience.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {formData.experience.map((exp, i) => (
                <div key={i} className="badge gap-1 p-3 bg-base-100">
                  <span>{exp}</span>
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs btn-circle"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        experience: formData.experience.filter((_, idx) => idx !== i)
                      });
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-4 text-center text-base-content/50 text-sm border border-dashed border-base-content/20 rounded-lg">
              Pievienojiet vismaz vienu pieredzes ierakstu
            </div>
          )}
        </div>
      </div>

      {/* Work Hours */}
      <div className="p-4 bg-base-200 rounded-lg border border-base-300">
        <h3 className="font-medium mb-1 flex items-center gap-2">
          <Clock className="h-5 w-5 text-secondary" />
          <span>Darba laiks</span>
        </h3>
        <p className="text-sm text-base-content/70 mb-4">
          Iestatiet savu darba laiku katrai dienai. Varat pievienot vairākus laika blokus.
        </p>
        
        <div className="flex flex-col space-y-4">
          {/* Day selector */}
          <div className="flex flex-wrap gap-2">
            {daysOfWeek.map(day => (
              <button
                key={day.id}
                type="button"
                onClick={() => setSelectedDay(day.id)}
                className={`btn btn-sm ${
                  selectedDay === day.id 
                    ? 'btn-secondary' 
                    : (formData.work_hours?.schedule?.[day.id]?.length || 0) > 0
                      ? 'btn-outline btn-secondary'
                      : 'btn-outline'
                }`}
              >
                <span className="hidden sm:inline">{day.label}</span>
                <span className="sm:hidden">{day.shortLabel}</span>
                {(formData.work_hours?.schedule?.[day.id]?.length || 0) > 0 && (
                  <div className="badge badge-sm">{formData.work_hours?.schedule?.[day.id]?.length}</div>
                )}
              </button>
            ))}
          </div>

          {/* Selected day schedule */}
          {selectedDay && (
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium">{daysOfWeek.find(d => d.id === selectedDay)?.label}</h4>
                <div className="flex gap-2">
                  <div className="dropdown dropdown-end">
                    <label tabIndex={0} className="btn btn-sm btn-ghost">
                      <Copy size={16} />
                      <span className="hidden sm:inline ml-2">Kopēt uz</span>
                    </label>
                    <div tabIndex={0} className="dropdown-content z-[1] bg-base-100 rounded-box shadow-lg w-52 max-h-[12rem] overflow-y-auto">
                      <button 
                        type="button"
                        onClick={() => copyScheduleToAllDays(selectedDay)}
                        className="w-full px-4 py-2 text-sm font-medium hover:bg-base-200 text-left border-b border-base-200"
                      >
                        Visām dienām
                      </button>
                      {daysOfWeek
                        .filter(day => day.id !== selectedDay)
                        .map(day => (
                          <button
                            key={day.id}
                            type="button"
                            onClick={() => copyScheduleToDay(selectedDay, day.id)}
                            className="w-full px-4 py-2 text-sm hover:bg-base-200 text-left"
                          >
                            {day.label}
                          </button>
                        ))
                      }
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddTimeBlock(selectedDay)}
                    className="btn btn-sm btn-secondary gap-2"
                  >
                    <Plus size={16} />
                    <span className="hidden sm:inline">Pievienot laiku</span>
                  </button>
                </div>
              </div>

              {timeError && (
                <div className="alert alert-error mb-4">
                  <AlertCircle size={16} />
                  <span>{timeError}</span>
                </div>
              )}

              {(formData.work_hours?.schedule?.[selectedDay]?.length || 0) > 0 ? (
                <div className="space-y-2">
                  {formData.work_hours?.schedule?.[selectedDay]?.map((block, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-base-100 p-2 rounded-lg">
                      <div className="badge badge-sm">{idx + 1}</div>
                      <div className="grid grid-cols-2 gap-2 flex-1">
                        <div>
                          <input
                            type="time"
                            className="input input-bordered input-sm w-full"
                            value={block.start}
                            onChange={(e) => handleUpdateTimeBlock(selectedDay, idx, 'start', e.target.value)}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <ArrowRight size={16} className="text-base-content/50" />
                          <input
                            type="time"
                            className="input input-bordered input-sm w-full"
                            value={block.end}
                            onChange={(e) => handleUpdateTimeBlock(selectedDay, idx, 'end', e.target.value)}
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveTimeBlock(selectedDay, idx)}
                        className="btn btn-ghost btn-sm btn-square text-error"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-base-content/50 text-sm border border-dashed border-base-content/20 rounded-lg">
                  Nav pievienotu laika bloku. Izmantojiet pogu "Pievienot laiku", lai sāktu.
                </div>
              )}
            </div>
          )}

          {!selectedDay && (
            <div className="py-8 text-center text-base-content/50 text-sm border border-dashed border-base-content/20 rounded-lg">
              Izvēlieties dienu, lai pievienotu darba laikus
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          type="button"
          className="btn btn-ghost gap-2"
          onClick={onBack}
        >
          <ArrowLeft size={16} />
          Atpakaļ
        </button>
        <button
          type="button"
          className="btn btn-secondary gap-2"
          onClick={onNext}
        >
          Tālāk
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
} 